#!/usr/bin/env ts-node

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const WORDPRESS_URL = process.env.WORDPRESS_URL;

interface ValidationResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

async function validateIntegration(): Promise<void> {
  const results: ValidationResult[] = [];

  console.log('🔍 Iniciando validación de integración...\n');

  try {
    console.log('1️⃣ Verificando que el backend esté corriendo...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    
    if (healthResponse.data.status === 'ok') {
      results.push({
        step: 'Backend Health Check',
        success: true,
        message: 'Backend está corriendo correctamente',
        data: healthResponse.data,
      });
      console.log('✅ Backend está corriendo\n');
    } else {
      throw new Error('Backend no responde correctamente');
    }
  } catch (error: any) {
    results.push({
      step: 'Backend Health Check',
      success: false,
      message: `Error: ${error.message}`,
    });
    console.log('❌ Backend no está disponible\n');
    printResults(results);
    process.exit(1);
  }

  try {
    console.log('2️⃣ Verificando eventos disponibles en la API...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events?limit=10`);
    
    if (eventsResponse.data.success && Array.isArray(eventsResponse.data.data)) {
      const events = eventsResponse.data.data;
      results.push({
        step: 'Obtener Eventos',
        success: true,
        message: `Se encontraron ${events.length} eventos`,
        data: { count: events.length },
      });
      console.log(`✅ Se encontraron ${events.length} eventos\n`);

      if (events.length > 0) {
        console.log('3️⃣ Validando formato de eventos...');
        const event = events[0];
        const requiredFields = ['id', 'name', 'date', 'time', 'location', 'price', 'category'];
        const missingFields = requiredFields.filter(field => !(field in event));

        if (missingFields.length === 0) {
          results.push({
            step: 'Formato de Eventos',
            success: true,
            message: 'Formato de eventos es correcto',
            data: {
              sampleEvent: {
                id: event.id,
                name: event.name,
                date: event.date,
                location: event.location,
              },
            },
          });
          console.log('✅ Formato de eventos es correcto\n');
          console.log('📋 Ejemplo de evento:');
          console.log(`   ID: ${event.id}`);
          console.log(`   Nombre: ${event.name}`);
          console.log(`   Fecha: ${event.date}`);
          console.log(`   Ubicación: ${event.location}`);
          console.log(`   Precio: $${event.price}\n`);
        } else {
          results.push({
            step: 'Formato de Eventos',
            success: false,
            message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
          });
          console.log(`❌ Faltan campos: ${missingFields.join(', ')}\n`);
        }
      }
    } else {
      throw new Error('Formato de respuesta inválido');
    }
  } catch (error: any) {
    results.push({
      step: 'Obtener Eventos',
      success: false,
      message: `Error: ${error.message}`,
    });
    console.log(`❌ Error al obtener eventos: ${error.message}\n`);
  }

  try {
    console.log('4️⃣ Verificando eventos destacados...');
    const featuredResponse = await axios.get(`${API_BASE_URL}/events/featured?limit=5`);
    
    if (featuredResponse.data.success && Array.isArray(featuredResponse.data.data)) {
      results.push({
        step: 'Eventos Destacados',
        success: true,
        message: `Se encontraron ${featuredResponse.data.data.length} eventos destacados`,
      });
      console.log(`✅ Eventos destacados funcionando (${featuredResponse.data.data.length} encontrados)\n`);
    }
  } catch (error: any) {
    results.push({
      step: 'Eventos Destacados',
      success: false,
      message: `Error: ${error.message}`,
    });
    console.log(`⚠️ Error al obtener eventos destacados: ${error.message}\n`);
  }

  if (WORDPRESS_URL) {
    try {
      console.log('5️⃣ Verificando sincronización con WordPress...');
      const syncResponse = await axios.post(
        `${API_BASE_URL}/events/sync`,
        { fullSync: false },
        {
          headers: {
            'x-webhook-secret': process.env.WEBHOOK_SECRET || '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (syncResponse.data.success) {
        results.push({
          step: 'Sincronización',
          success: true,
          message: 'Sincronización ejecutada correctamente',
          data: syncResponse.data.data,
        });
        console.log('✅ Sincronización ejecutada correctamente\n');
        if (syncResponse.data.data) {
          console.log(`   Creados: ${syncResponse.data.data.created || 0}`);
          console.log(`   Actualizados: ${syncResponse.data.data.updated || 0}`);
          console.log(`   Errores: ${syncResponse.data.data.errors || 0}\n`);
        }
      }
    } catch (error: any) {
      results.push({
        step: 'Sincronización',
        success: false,
        message: `Error: ${error.response?.data?.message || error.message}`,
      });
      console.log(`⚠️ Error en sincronización: ${error.response?.data?.message || error.message}\n`);
    }
  }

  console.log('6️⃣ Validando compatibilidad con frontend...');
  try {
    const eventsResponse = await axios.get(`${API_BASE_URL}/events?limit=1`);
    if (eventsResponse.data.success && eventsResponse.data.data.length > 0) {
      const event = eventsResponse.data.data[0];
      
      const frontendRequiredFields = {
        id: typeof event.id === 'string',
        name: typeof event.name === 'string',
        date: typeof event.date === 'string',
        time: typeof event.time === 'string',
        location: typeof event.location === 'string',
        price: typeof event.price === 'number',
        category: typeof event.category === 'string',
      };

      const allFieldsPresent = Object.values(frontendRequiredFields).every(Boolean);

      if (allFieldsPresent) {
        results.push({
          step: 'Compatibilidad Frontend',
          success: true,
          message: 'Formato compatible con React Native',
        });
        console.log('✅ Formato compatible con React Native\n');
      } else {
        const missing = Object.entries(frontendRequiredFields)
          .filter(([_, present]) => !present)
          .map(([field]) => field);
        results.push({
          step: 'Compatibilidad Frontend',
          success: false,
          message: `Faltan o tienen tipo incorrecto: ${missing.join(', ')}`,
        });
        console.log(`❌ Campos incompatibles: ${missing.join(', ')}\n`);
      }
    }
  } catch (error: any) {
    results.push({
      step: 'Compatibilidad Frontend',
      success: false,
      message: `Error: ${error.message}`,
    });
    console.log(`❌ Error en validación: ${error.message}\n`);
  }

  printResults(results);
  
  const allSuccess = results.every(r => r.success);
  if (allSuccess) {
    console.log('🎉 ¡Todas las validaciones pasaron! El sistema está funcionando correctamente.\n');
    process.exit(0);
  } else {
    console.log('⚠️ Algunas validaciones fallaron. Revisa los errores arriba.\n');
    process.exit(1);
  }
}

function printResults(results: ValidationResult[]): void {
  console.log('\n📊 Resumen de Validación:');
  console.log('═'.repeat(60));
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.step}`);
    console.log(`   ${result.message}`);
    if (result.data && typeof result.data === 'object') {
      console.log(`   Datos: ${JSON.stringify(result.data, null, 2).split('\n').join('\n   ')}`);
    }
    console.log('');
  });
  
  console.log('═'.repeat(60));
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  console.log(`Resultado: ${successCount}/${totalCount} validaciones exitosas\n`);
}

validateIntegration().catch((error) => {
  console.error('❌ Error crítico en validación:', error);
  process.exit(1);
});

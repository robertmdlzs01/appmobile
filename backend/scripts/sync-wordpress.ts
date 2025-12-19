

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import pool from '../src/config/database';

dotenv.config();

interface WordPressEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  price: number;
  category: string;
  images?: string;
  videoUrl?: string;
}

async function syncWordPressEvents() {
  try {
    console.log('🔄 Iniciando sincronización de eventos desde WordPress...');

    // Conectar a la base de datos MySQL en Plesk (misma donde está WordPress)
    // Usa las mismas credenciales configuradas en .env
    const wpPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Obtener eventos de WordPress
    // Ajusta esta query según tu estructura de WordPress
    const [wpEvents] = await wpPool.execute(`
      SELECT 
        p.ID as id,
        p.post_title as name,
        p.post_content as description,
        p.post_date as date,
        p.post_date_gmt as date_gmt,
        pm_location.meta_value as location,
        pm_price.meta_value as price,
        pm_category.meta_value as category,
        pm_images.meta_value as images,
        pm_video.meta_value as video_url
      FROM wp_posts p
      LEFT JOIN wp_postmeta pm_location ON p.ID = pm_location.post_id AND pm_location.meta_key = 'event_location'
      LEFT JOIN wp_postmeta pm_price ON p.ID = pm_price.post_id AND pm_price.meta_key = 'event_price'
      LEFT JOIN wp_postmeta pm_category ON p.ID = pm_category.post_id AND pm_category.meta_key = 'event_category'
      LEFT JOIN wp_postmeta pm_images ON p.ID = pm_images.post_id AND pm_images.meta_key = 'event_images'
      LEFT JOIN wp_postmeta pm_video ON p.ID = pm_video.post_id AND pm_video.meta_key = 'event_video'
      WHERE p.post_type = 'evento' 
        AND p.post_status = 'publish'
      ORDER BY p.post_date DESC
    `);

    const events = wpEvents as WordPressEvent[];
    console.log(`📦 Encontrados ${events.length} eventos en WordPress`);

    let synced = 0;
    let updated = 0;
    let errors = 0;

    // Sincronizar cada evento
    for (const wpEvent of events) {
      try {
        const eventId = `wp-${wpEvent.id}`;
        const eventDate = new Date(wpEvent.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        const eventTime = eventDate.toTimeString().split(' ')[0].substring(0, 5);

        // Parsear imágenes si están en JSON
        let images: string[] = [];
        if (wpEvent.images) {
          try {
            images = JSON.parse(wpEvent.images);
          } catch {
            // Si no es JSON, tratar como string separado por comas
            images = wpEvent.images.split(',').map(img => img.trim()).filter(Boolean);
          }
        }

        // Verificar si el evento ya existe
        const [existing] = await pool.execute(
          'SELECT id FROM events WHERE id = ?',
          [eventId]
        );

        const exists = (existing as any[]).length > 0;

        if (exists) {
          // Actualizar evento existente
          await pool.execute(
            `UPDATE events SET
              name = ?,
              description = ?,
              date = ?,
              time = ?,
              location = ?,
              price = ?,
              category = ?,
              images = ?,
              video_url = ?,
              updated_at = NOW()
            WHERE id = ?`,
            [
              wpEvent.name,
              wpEvent.description,
              eventDateStr,
              eventTime,
              wpEvent.location || 'Ubicación no especificada',
              parseFloat(wpEvent.price?.toString() || '0'),
              wpEvent.category || 'General',
              JSON.stringify(images),
              wpEvent.videoUrl || null,
              eventId,
            ]
          );
          updated++;
          console.log(`  ✅ Actualizado: ${wpEvent.name}`);
        } else {
          // Insertar nuevo evento
          await pool.execute(
            `INSERT INTO events (
              id, name, description, date, time, location, price, category,
              images, video_url, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
            [
              eventId,
              wpEvent.name,
              wpEvent.description,
              eventDateStr,
              eventTime,
              wpEvent.location || 'Ubicación no especificada',
              parseFloat(wpEvent.price?.toString() || '0'),
              wpEvent.category || 'General',
              JSON.stringify(images),
              wpEvent.videoUrl || null,
            ]
          );
          synced++;
          console.log(`  ➕ Nuevo: ${wpEvent.name}`);
        }
      } catch (error: any) {
        errors++;
        console.error(`  ❌ Error con evento ${wpEvent.id}: ${error.message}`);
      }
    }

    await wpPool.end();

    console.log('\n✨ Sincronización completada:');
    console.log(`   ➕ Nuevos: ${synced}`);
    console.log(`   🔄 Actualizados: ${updated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total procesados: ${events.length}`);
  } catch (error: any) {
    console.error('❌ Error en sincronización:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncWordPressEvents();
}

export default syncWordPressEvents;


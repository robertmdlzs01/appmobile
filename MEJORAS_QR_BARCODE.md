# Mejoras en el Manejo de Códigos QR y de Barras

## 📋 Resumen de Mejoras

Se ha mejorado significativamente el sistema de manejo de códigos QR y de barras para tickets, incluyendo:

### ✅ Componentes Creados

1. **`components/qr-code-display.tsx`**
   - Componente reutilizable para mostrar códigos QR
   - Soporte para estados (validado, escaneado, pendiente)
   - Logo personalizado integrado
   - Colores dinámicos según el estado

2. **`components/barcode-display.tsx`**
   - Componente para códigos de barras Code128
   - Generación automática basada en ticketId
   - Formato visual mejorado

3. **`app/tickets/scan.tsx`**
   - Pantalla completa de escáner QR/código de barras
   - Validación en tiempo real
   - Entrada manual de códigos
   - Feedback háptico y visual
   - Animaciones de éxito/error

### ✅ Utilidades Creadas

1. **`utils/qrCode.ts`**
   - `parseQRCode()` - Parsea y valida códigos QR
   - `generateQRPayload()` - Genera payloads QR mejorados
   - `isValidQRPayload()` - Valida formato de payload
   - `isQRExpired()` - Verifica expiración
   - `getTimeUntilExpiration()` - Calcula tiempo restante

2. **`utils/barcode.ts`**
   - `generateBarcodeData()` - Genera datos de código de barras
   - `isValidBarcode()` - Valida formato de código de barras
   - `extractTicketIdFromBarcode()` - Extrae ticketId del código
   - `generateBarcodeLines()` - Genera líneas visuales del código

### ✅ Mejoras en el Formato QR

**Antes:**
```json
{
  "type": "eventu_ticket",
  "ticketId": "ticket-1",
  "token": "hash",
  "exp": 1234567890,
  "validated": false
}
```

**Ahora:**
```json
{
  "type": "eventu_ticket",
  "ticketId": "ticket-1",
  "token": "hash",
  "exp": 1234567890,
  "validated": false,
  "eventId": "event-1",
  "eventName": "Evento",
  "date": "2025-12-12",
  "version": "1.0"
}
```

### ✅ Funcionalidades del Escáner

- **Escaneo de QR**: Detecta y parsea códigos QR de tickets
- **Escaneo de Código de Barras**: Soporta códigos de barras Code128
- **Validación en Tiempo Real**: Conecta con el backend para validar tickets
- **Entrada Manual**: Permite ingresar códigos manualmente
- **Feedback Visual**: Animaciones y colores según el estado
- **Feedback Háptico**: Vibraciones para éxito/error
- **Acciones Rápidas**: Validar o rechazar tickets directamente

### ✅ Integración

1. **Pantalla de Tickets** (`app/ticket/[id].tsx`)
   - Usa `QRCodeDisplay` para mostrar QR mejorado
   - Usa `BarcodeDisplay` para código de barras real
   - Payload QR mejorado con más información

2. **Perfil** (`app/(tabs)/profile.tsx`)
   - Sección "Herramientas de Staff" con acceso al escáner
   - Botón "Escanear Tickets" para staff/administradores

3. **Rutas**
   - Nueva ruta: `/tickets/scan` para el escáner

## 🚀 Uso

### Para Usuarios (Ver Tickets)

1. Ir a "Entradas" en la app
2. Seleccionar un ticket
3. Ver el código QR y código de barras mejorados
4. Los códigos se actualizan automáticamente cada 15 segundos (si no está validado)

### Para Staff (Validar Tickets)

1. Ir a "Perfil" → "Herramientas de Staff"
2. Seleccionar "Escanear Tickets"
3. Escanear el código QR o de barras del ticket
4. El sistema valida automáticamente
5. Opciones para validar o rechazar el ticket

### Entrada Manual

1. En la pantalla de escáner, tocar el icono de teclado
2. Ingresar el código manualmente
3. El sistema lo procesa igual que un escaneo

## 🔒 Seguridad

- **Tokens con expiración**: Los QR expiran después de 15 segundos (o 1 año si está validado)
- **Validación de formato**: Solo acepta códigos con formato válido
- **Verificación de expiración**: Rechaza códigos expirados
- **Hash SHA256**: Tokens generados con hash seguro

## 📱 Notas Técnicas

### Escáner Real (Producción)

El escáner actualmente usa una simulación. Para producción, necesitarás:

1. **Instalar expo-camera o expo-barcode-scanner:**
   ```bash
   npx expo install expo-camera
   # o
   npx expo install expo-barcode-scanner
   ```

2. **Actualizar `app/tickets/scan.tsx`** para usar la cámara real:
   ```typescript
   import { CameraView, useCameraPermissions } from 'expo-camera';
   ```

3. **Configurar permisos** en `app.json`:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-camera",
           {
             "cameraPermission": "Eventu necesita acceso a tu cámara para escanear tickets."
           }
         ]
       ]
     }
   }
   ```

### Códigos de Barras Reales

Para códigos de barras reales (Code128, EAN13, etc.), considera usar:
- `react-native-barcode-builder` para generar códigos reales
- O una librería de renderizado SVG para códigos de barras

## 🎨 Personalización

Los componentes son altamente personalizables:

```typescript
// QR Code
<QRCodeDisplay
  payload={qrPayload}
  size={200}
  color="#000000"
  backgroundColor="#FFFFFF"
  showLogo={true}
  validated={true}
  scanned={false}
/>

// Barcode
<BarcodeDisplay
  ticketId="ticket-123"
  width={250}
  height={80}
  showLabel={true}
/>
```

## 📊 Estados del QR

- **Pendiente** (negro): QR activo, esperando validación
- **Escaneado** (naranja): QR escaneado, en proceso de validación
- **Validado** (verde): QR validado, no se regenera

## 🔄 Flujo de Validación

1. Usuario muestra QR → Staff escanea
2. Sistema marca como "scanned" → QR cambia a naranja
3. Staff valida → Sistema marca como "validated" → QR cambia a verde y se vuelve estático
4. Si se rechaza → Sistema marca como "rejected"


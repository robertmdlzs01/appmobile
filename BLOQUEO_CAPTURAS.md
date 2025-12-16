# Bloqueo de Capturas de Pantalla y Grabación

## 📱 Implementación

Se ha implementado el bloqueo global de capturas de pantalla y grabación de pantalla en toda la aplicación para proteger información sensible, especialmente tickets con códigos QR y códigos de barras.

## 🔧 Configuración

### Hook Global (`hooks/useScreenCapture.ts`)

El hook `useGlobalScreenCaptureBlock` se aplica automáticamente en el layout principal (`app/_layout.tsx`) y bloquea capturas en todas las pantallas excepto las rutas permitidas.

### Rutas Permitidas (Sin Bloqueo)

Las siguientes rutas NO bloquean capturas de pantalla (pantallas públicas):

- `/welcome` - Pantalla de bienvenida
- `/login` - Inicio de sesión
- `/register` - Registro
- `/auth/onboarding` - Onboarding
- `/auth/verify-code` - Verificación de código
- `/auth/new-password` - Nueva contraseña
- `/auth/preferences-*` - Preferencias del usuario
- `/auth/complete-profile` - Completar perfil
- `/auth/location-access` - Acceso a ubicación
- `/auth/enter-location` - Ingresar ubicación

### Rutas Bloqueadas (Con Protección)

**Todas las demás rutas** están protegidas por defecto, incluyendo:

- Pantallas de tickets (`/ticket/[id]`)
- Pantallas de eventos (`/event/[id]`)
- Pantallas de perfil (`/profile/*`)
- Pantallas de configuración (`/settings/*`)
- Pantallas de compra (`/booking/*`)
- Pantallas de billetera (`/wallet/*`)
- Y todas las demás pantallas autenticadas

## 🛠️ Uso

### Bloqueo Global (Automático)

El bloqueo se aplica automáticamente en `app/_layout.tsx`:

```typescript
import { useGlobalScreenCaptureBlock } from '@/hooks/useScreenCapture';

function RootLayoutNav() {
  // Bloquear capturas de pantalla globalmente
  useGlobalScreenCaptureBlock(true);
  
  // ... resto del código
}
```

### Bloqueo en Pantallas Específicas

Si necesitas bloquear capturas en una pantalla específica (aunque ya está bloqueado globalmente):

```typescript
import { useScreenCapture } from '@/hooks/useScreenCapture';

export default function MyScreen() {
  // Bloquear capturas en esta pantalla
  useScreenCapture(true);
  
  // ... resto del código
}
```

### Permitir Capturas Temporalmente

Si necesitas permitir capturas temporalmente en una pantalla protegida:

```typescript
import { useScreenCapture } from '@/hooks/useScreenCapture';

export default function MyScreen() {
  // Permitir capturas en esta pantalla
  useScreenCapture(false);
  
  // ... resto del código
}
```

## 📋 Compatibilidad por Plataforma

### iOS ✅
- **Capturas de pantalla**: Bloqueadas automáticamente
- **Grabación de pantalla**: Bloqueada automáticamente
- **Funciona**: Sí, sin configuración adicional

### Android ✅
- **Capturas de pantalla**: Bloqueadas automáticamente
- **Grabación de pantalla**: Bloqueada automáticamente
- **Funciona**: Sí, `expo-screen-capture` maneja `FLAG_SECURE` automáticamente

### Web ⚠️
- **Capturas de pantalla**: No soportado (se ignora silenciosamente)
- **Grabación de pantalla**: No soportado
- **Nota**: En web, el bloqueo no es posible por limitaciones del navegador

## 🔒 Seguridad

### Nivel de Protección

1. **Alto**: Bloquea capturas de pantalla nativas
2. **Alto**: Bloquea grabación de pantalla nativa
3. **Medio**: No previene screenshots de herramientas de desarrollo
4. **Bajo**: No previene capturas físicas (fotos con otro dispositivo)

### Limitaciones

- **No previene**: Screenshots desde herramientas de desarrollo (Xcode, Android Studio)
- **No previene**: Capturas físicas con otro dispositivo
- **No previene**: Grabación con hardware externo
- **No funciona**: En navegadores web

### Recomendaciones Adicionales

Para mayor seguridad, considera:

1. **Watermarking**: Agregar marcas de agua a los tickets
2. **Tokens dinámicos**: Ya implementado (QR y códigos de barras cambian cada 15 segundos)
3. **Detección de root/jailbreak**: Detectar dispositivos comprometidos
4. **Validación en backend**: Validar tokens en el servidor

## 🧪 Testing

### Probar en iOS

1. Abre la app en un dispositivo iOS
2. Navega a una pantalla protegida (ej: `/ticket/[id]`)
3. Intenta tomar una captura de pantalla (botones de volumen + power)
4. **Resultado esperado**: La captura falla o muestra pantalla negra

### Probar en Android

1. Abre la app en un dispositivo Android
2. Navega a una pantalla protegida (ej: `/ticket/[id]`)
3. Intenta tomar una captura de pantalla (botones de volumen + power)
4. **Resultado esperado**: La captura falla o muestra pantalla negra

### Verificar Rutas Permitidas

1. Navega a `/welcome` o `/login`
2. Intenta tomar una captura de pantalla
3. **Resultado esperado**: La captura funciona normalmente

## 📝 Notas Técnicas

### Implementación

- Usa `expo-screen-capture` v8.0.9
- Hook personalizado `useScreenCapture` para manejo centralizado
- Bloqueo automático basado en rutas
- Cleanup automático al cambiar de pantalla

### Performance

- **Impacto mínimo**: El bloqueo se aplica solo cuando cambia la ruta
- **Sin overhead**: No hay polling ni verificaciones constantes
- **Eficiente**: Solo actualiza cuando es necesario

## 🔄 Actualizaciones Futuras

Posibles mejoras:

1. **Configuración por usuario**: Permitir que usuarios desactiven el bloqueo
2. **Bloqueo selectivo**: Bloquear solo en pantallas específicas (tickets)
3. **Detección de screenshots**: Detectar intentos de captura y notificar
4. **Logging**: Registrar intentos de captura para auditoría


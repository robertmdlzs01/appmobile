# 🔐 Credenciales de Staff para Desarrollo

## 📋 Credenciales Disponibles

### 👤 Staff (Personal Autorizado)
**Email:** `staff@eventu.co`  
**Contraseña:** `cualquier contraseña` (o vacía)

**Email:** `staff@eventu.com`  
**Contraseña:** `cualquier contraseña` (o vacía)

**Permisos:**
- ✅ Acceso al escáner de tickets (`/staff/scan`)
- ✅ Validar/escaneear tickets
- ✅ Ver sección "Herramientas de Staff" en el perfil

---

### 👑 Admin (Administrador)
**Email:** `admin@eventu.co`  
**Contraseña:** `cualquier contraseña` (o vacía)

**Email:** `admin@eventu.com`  
**Contraseña:** `cualquier contraseña` (o vacía)

**Permisos:**
- ✅ Todos los permisos de Staff
- ✅ Permisos adicionales de administrador (futuro)

---

## 🚀 Cómo Usar

1. **Abre la app** y ve a la pantalla de login
2. **Ingresa uno de los emails de staff/admin** listados arriba
3. **Ingresa cualquier contraseña** (el sistema mock acepta cualquier contraseña)
4. **Inicia sesión**
5. **Ve al perfil** - deberías ver la sección "Herramientas de Staff"
6. **Toca "Escanear Tickets"** para acceder al escáner

---

## ⚠️ Notas Importantes

### Desarrollo vs Producción

**En Desarrollo (Actual):**
- El sistema acepta cualquier contraseña
- Los roles se asignan automáticamente basados en el email
- No hay validación real de credenciales

**En Producción:**
- Las credenciales deben validarse contra el backend
- Los roles deben venir del servidor
- Se requiere autenticación real con JWT

### Emails que Otorgan Permisos de Staff

Los siguientes emails automáticamente reciben permisos de staff:

```typescript
const staffEmails = [
  'staff@eventu.co',
  'admin@eventu.co',
  'staff@eventu.com',
  'admin@eventu.com',
];
```

### Cómo Agregar Más Emails de Staff

Edita `contexts/AuthContext.tsx` y agrega más emails al array `staffEmails`:

```typescript
const staffEmails = [
  'staff@eventu.co',
  'admin@eventu.co',
  'staff@eventu.com',
  'admin@eventu.com',
  'tu-email@eventu.co', // Agregar aquí
];
```

---

## 🧪 Testing

### Probar como Usuario Normal
1. Usa cualquier email que NO esté en la lista de staff
2. Ejemplo: `usuario@eventu.co`
3. No deberías ver la sección "Herramientas de Staff"

### Probar como Staff
1. Usa `staff@eventu.co` o `staff@eventu.com`
2. Deberías ver la sección "Herramientas de Staff"
3. Deberías poder acceder a `/staff/scan`

### Probar como Admin
1. Usa `admin@eventu.co` o `admin@eventu.com`
2. Deberías tener todos los permisos de staff
3. Permisos adicionales de admin (futuro)

---

## 🔒 Seguridad

**IMPORTANTE:** Estas credenciales son solo para desarrollo. En producción:

1. **Nunca** uses estas credenciales en producción
2. **Implementa** autenticación real con backend
3. **Valida** credenciales en el servidor
4. **Usa** JWT o tokens seguros
5. **Almacena** roles en la base de datos
6. **Protege** las rutas de staff en el backend

---

## 📝 Resumen Rápido

| Rol | Email | Contraseña | Acceso Staff |
|-----|-------|------------|--------------|
| Staff | `staff@eventu.co` | cualquier | ✅ |
| Staff | `staff@eventu.com` | cualquier | ✅ |
| Admin | `admin@eventu.co` | cualquier | ✅ |
| Admin | `admin@eventu.com` | cualquier | ✅ |
| Usuario | cualquier otro | cualquier | ❌ |


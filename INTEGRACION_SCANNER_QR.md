# Integración del Scanner de QR - Eventu.co

## 📋 Tabla de Contenidos

1. [Formato del Código QR](#formato-del-código-qr)
2. [Extracción del ID del Ticket](#extracción-del-id-del-ticket)
3. [Flujo de Validación](#flujo-de-validación)
4. [Endpoints del API](#endpoints-del-api)
5. [Ejemplo Completo de Integración](#ejemplo-completo-de-integración)
6. [Configuración del Backend](#configuración-del-backend)
7. [Notas Importantes](#notas-importantes)

---

## Formato del Código QR

El código QR generado por la app tiene el siguiente formato:

```
TICKET_ID|TIMESTAMP|RANDOM|COUNTER
```

### Ejemplo:
```
AF345RS|1734567890123|abc123|5
```

### Estructura:
- **TICKET_ID**: ID único del ticket (ej: "AF345RS", "TICKET123")
- **TIMESTAMP**: Timestamp en milisegundos cuando se generó el QR
- **RANDOM**: String aleatorio para garantizar unicidad
- **COUNTER**: Contador incremental para evitar repeticiones

### Características:
- ✅ El QR cambia cada **10 segundos** para prevenir capturas de pantalla
- ✅ Cada QR generado es **único y nunca se repite**
- ✅ El ID del ticket es **estático** (no cambia)
- ✅ El formato permite extraer fácilmente el ID del ticket

---

## Extracción del ID del Ticket

El scanner debe extraer el **ID del ticket** (la primera parte antes del primer `|`):

### JavaScript/TypeScript:
```javascript
function extractTicketId(qrString) {
  // El ID del ticket es la primera parte antes del primer "|"
  const ticketId = qrString.split('|')[0];
  return ticketId;
}

// Ejemplo:
const qrCode = "AF345RS|1734567890123|abc123|5";
const ticketId = extractTicketId(qrCode); // Retorna: "AF345RS"
```

### Python:
```python
def extract_ticket_id(qr_string):
    """
    Extrae el ID del ticket del código QR.
    
    Args:
        qr_string: String completo del código QR
        
    Returns:
        str: ID del ticket (ej: "AF345RS")
    """
    # El ID del ticket es la primera parte antes del primer "|"
    ticket_id = qr_string.split('|')[0]
    return ticket_id

# Ejemplo:
qr_code = "AF345RS|1734567890123|abc123|5"
ticket_id = extract_ticket_id(qr_code)  # Retorna: "AF345RS"
```

### Java:
```java
public String extractTicketId(String qrString) {
    // El ID del ticket es la primera parte antes del primer "|"
    return qrString.split("\\|")[0];
}

// Ejemplo:
String qrCode = "AF345RS|1734567890123|abc123|5";
String ticketId = extractTicketId(qrCode); // Retorna: "AF345RS"
```

### Kotlin (Android):
```kotlin
fun extractTicketId(qrString: String): String {
    // El ID del ticket es la primera parte antes del primer "|"
    return qrString.split("|")[0]
}

// Ejemplo:
val qrCode = "AF345RS|1734567890123|abc123|5"
val ticketId = extractTicketId(qrCode) // Retorna: "AF345RS"
```

### Swift (iOS):
```swift
func extractTicketId(from qrString: String) -> String? {
    // El ID del ticket es la primera parte antes del primer "|"
    return qrString.components(separatedBy: "|").first
}

// Ejemplo:
let qrCode = "AF345RS|1734567890123|abc123|5"
if let ticketId = extractTicketId(from: qrCode) {
    print(ticketId) // Imprime: "AF345RS"
}
```

---

## Flujo de Validación

### 1. Usuario muestra el QR en la app
- El QR se genera automáticamente cuando el evento está disponible (día del evento)
- El QR cambia cada **10 segundos** (aunque el ID del ticket sigue siendo el mismo)
- Esto previene que alguien tome una captura de pantalla y la use después

### 2. Scanner lee el QR
- El scanner escanea el código QR
- Extrae el ID del ticket usando el método descrito arriba
- El ID del ticket es la parte antes del primer `|`

### 3. Scanner valida el ticket en el backend
- El scanner debe hacer una llamada al API para validar el ticket
- Endpoint: `POST /api/tickets/validate`
- Body: `{ "ticketId": "AF345RS" }`
- El backend debe:
  - Verificar que el ticket existe
  - Verificar que el ticket no ha sido validado previamente
  - Marcar el ticket como validado
  - Retornar el estado de validación

### 4. App detecta la validación en tiempo real
- La app hace **polling cada 1-2 segundos** al endpoint de validación
- Cuando el ticket es validado, la app:
  - ✅ Detiene la regeneración del QR (ya no cambia cada 10 segundos)
  - ✅ Muestra un badge de "Validado" con animación
  - ✅ Desactiva el QR (ya no se puede usar)
  - ✅ Muestra la fecha y hora de validación

---

## Endpoints del API

### Base URL
```
https://api.eventu.co/api
```

### 1. Validar Ticket

**Endpoint:** `POST /api/tickets/validate`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "ticketId": "AF345RS"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "data": {
    "validated": true,
    "validatedAt": "2025-01-15T10:30:00Z",
    "validationStatus": "validated",
    "ticketId": "AF345RS",
    "eventId": "event-123",
    "eventName": "Concierto de Rock"
  }
}
```

**Response (Error - Ticket ya validado):**
```json
{
  "success": false,
  "message": "El ticket ya ha sido validado anteriormente",
  "data": {
    "validated": true,
    "validatedAt": "2025-01-15T10:25:00Z",
    "validationStatus": "validated"
  }
}
```

**Response (Error - Ticket no encontrado):**
```json
{
  "success": false,
  "message": "Ticket no encontrado"
}
```

**Response (Error - Ticket no disponible):**
```json
{
  "success": false,
  "message": "El ticket no está disponible para validación aún"
}
```

### 2. Consultar Estado de Validación

**Endpoint:** `GET /api/tickets/{ticketId}/validation`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "validation": {
      "validated": true,
      "validatedAt": "2025-01-15T10:30:00Z",
      "validationStatus": "validated",
      "scannedAt": null,
      "ticketId": "AF345RS"
    }
  }
}
```

**Estados posibles de `validationStatus`:**
- `"pending"`: Ticket pendiente de validación
- `"scanned"`: Ticket escaneado pero aún no validado
- `"validated"`: Ticket validado exitosamente
- `"rejected"`: Ticket rechazado

### 3. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Ejemplo Completo de Integración

### JavaScript/TypeScript (Node.js/React Native)

```javascript
// Configuración
const API_BASE_URL = 'https://api.eventu.co/api';

/**
 * Extrae el ID del ticket del código QR
 */
function extractTicketId(qrString) {
  if (!qrString || typeof qrString !== 'string') {
    throw new Error('QR string inválido');
  }
  
  const parts = qrString.split('|');
  if (parts.length < 1) {
    throw new Error('Formato de QR inválido');
  }
  
  return parts[0];
}

/**
 * Valida un ticket escaneado
 */
async function validateTicket(qrString) {
  try {
    // 1. Extraer el ID del ticket
    const ticketId = extractTicketId(qrString);
    
    if (!ticketId) {
      return {
        success: false,
        message: 'No se pudo extraer el ID del ticket del QR'
      };
    }
    
    // 2. Validar el ticket en el backend
    const response = await fetch(`${API_BASE_URL}/tickets/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketId: ticketId
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data.validated) {
      console.log('✅ Ticket validado exitosamente:', ticketId);
      return {
        success: true,
        ticketId: ticketId,
        validatedAt: result.data.validatedAt,
        eventName: result.data.eventName
      };
    } else {
      console.log('❌ Error al validar ticket:', result.message);
      return {
        success: false,
        message: result.message || 'Error al validar ticket',
        alreadyValidated: result.data?.validated || false
      };
    }
  } catch (error) {
    console.error('❌ Error en la validación:', error);
    return {
      success: false,
      message: 'Error de conexión: ' + error.message
    };
  }
}

/**
 * Consulta el estado de validación de un ticket
 */
async function getTicketValidationStatus(ticketId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/validation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        validation: result.data.validation
      };
    } else {
      return {
        success: false,
        message: result.message || 'Error al consultar estado'
      };
    }
  } catch (error) {
    console.error('Error al consultar estado:', error);
    return {
      success: false,
      message: 'Error de conexión'
    };
  }
}

// Uso:
const qrCode = "AF345RS|1734567890123|abc123|5";
const result = await validateTicket(qrCode);

if (result.success) {
  console.log(`Ticket ${result.ticketId} validado a las ${result.validatedAt}`);
} else {
  console.error(`Error: ${result.message}`);
}
```

### Python (Flask/FastAPI)

```python
import requests
from typing import Dict, Optional

API_BASE_URL = "https://api.eventu.co/api"

def extract_ticket_id(qr_string: str) -> str:
    """
    Extrae el ID del ticket del código QR.
    
    Args:
        qr_string: String completo del código QR
        
    Returns:
        str: ID del ticket
        
    Raises:
        ValueError: Si el formato del QR es inválido
    """
    if not qr_string or not isinstance(qr_string, str):
        raise ValueError("QR string inválido")
    
    parts = qr_string.split('|')
    if len(parts) < 1:
        raise ValueError("Formato de QR inválido")
    
    return parts[0]

def validate_ticket(qr_string: str) -> Dict:
    """
    Valida un ticket escaneado.
    
    Args:
        qr_string: String completo del código QR
        
    Returns:
        dict: Resultado de la validación
    """
    try:
        # 1. Extraer el ID del ticket
        ticket_id = extract_ticket_id(qr_string)
        
        # 2. Validar el ticket en el backend
        response = requests.post(
            f"{API_BASE_URL}/tickets/validate",
            json={"ticketId": ticket_id},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        result = response.json()
        
        if result.get("success") and result.get("data", {}).get("validated"):
            print(f"✅ Ticket validado exitosamente: {ticket_id}")
            return {
                "success": True,
                "ticketId": ticket_id,
                "validatedAt": result["data"].get("validatedAt"),
                "eventName": result["data"].get("eventName")
            }
        else:
            print(f"❌ Error al validar ticket: {result.get('message')}")
            return {
                "success": False,
                "message": result.get("message", "Error al validar ticket"),
                "alreadyValidated": result.get("data", {}).get("validated", False)
            }
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return {
            "success": False,
            "message": f"Error de conexión: {str(e)}"
        }
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }

# Uso:
qr_code = "AF345RS|1734567890123|abc123|5"
result = validate_ticket(qr_code)

if result["success"]:
    print(f"Ticket {result['ticketId']} validado a las {result['validatedAt']}")
else:
    print(f"Error: {result['message']}")
```

### Java (Spring Boot)

```java
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashMap;
import java.util.Map;

public class TicketValidator {
    
    private static final String API_BASE_URL = "https://api.eventu.co/api";
    private final RestTemplate restTemplate;
    
    public TicketValidator() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Extrae el ID del ticket del código QR
     */
    public String extractTicketId(String qrString) {
        if (qrString == null || qrString.isEmpty()) {
            throw new IllegalArgumentException("QR string inválido");
        }
        
        String[] parts = qrString.split("\\|");
        if (parts.length < 1) {
            throw new IllegalArgumentException("Formato de QR inválido");
        }
        
        return parts[0];
    }
    
    /**
     * Valida un ticket escaneado
     */
    public ValidationResult validateTicket(String qrString) {
        try {
            // 1. Extraer el ID del ticket
            String ticketId = extractTicketId(qrString);
            
            // 2. Preparar la petición
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("ticketId", ticketId);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            // 3. Validar el ticket en el backend
            ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
                API_BASE_URL + "/tickets/validate",
                request,
                ApiResponse.class
            );
            
            ApiResponse apiResponse = response.getBody();
            
            if (apiResponse != null && apiResponse.isSuccess() && 
                apiResponse.getData() != null && apiResponse.getData().isValidated()) {
                
                System.out.println("✅ Ticket validado exitosamente: " + ticketId);
                return new ValidationResult(
                    true,
                    ticketId,
                    apiResponse.getData().getValidatedAt(),
                    null
                );
            } else {
                String message = apiResponse != null ? apiResponse.getMessage() : "Error al validar ticket";
                System.out.println("❌ Error al validar ticket: " + message);
                return new ValidationResult(
                    false,
                    ticketId,
                    null,
                    message
                );
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error en la validación: " + e.getMessage());
            return new ValidationResult(
                false,
                null,
                null,
                "Error de conexión: " + e.getMessage()
            );
        }
    }
    
    // Clases de respuesta
    public static class ApiResponse {
        private boolean success;
        private String message;
        private ValidationData data;
        
        // Getters y setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public ValidationData getData() { return data; }
        public void setData(ValidationData data) { this.data = data; }
    }
    
    public static class ValidationData {
        @JsonProperty("validated")
        private boolean validated;
        
        @JsonProperty("validatedAt")
        private String validatedAt;
        
        // Getters y setters
        public boolean isValidated() { return validated; }
        public void setValidated(boolean validated) { this.validated = validated; }
        public String getValidatedAt() { return validatedAt; }
        public void setValidatedAt(String validatedAt) { this.validatedAt = validatedAt; }
    }
    
    public static class ValidationResult {
        private final boolean success;
        private final String ticketId;
        private final String validatedAt;
        private final String message;
        
        public ValidationResult(boolean success, String ticketId, String validatedAt, String message) {
            this.success = success;
            this.ticketId = ticketId;
            this.validatedAt = validatedAt;
            this.message = message;
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getTicketId() { return ticketId; }
        public String getValidatedAt() { return validatedAt; }
        public String getMessage() { return message; }
    }
}

// Uso:
TicketValidator validator = new TicketValidator();
String qrCode = "AF345RS|1734567890123|abc123|5";
ValidationResult result = validator.validateTicket(qrCode);

if (result.isSuccess()) {
    System.out.println("Ticket " + result.getTicketId() + " validado a las " + result.getValidatedAt());
} else {
    System.err.println("Error: " + result.getMessage());
}
```

---

## Configuración del Backend

### Variables de Entorno

El backend debe tener configuradas las siguientes variables:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=production

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventu_db
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql

# JWT Secret (para autenticación, opcional)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS - Orígenes permitidos
CORS_ORIGIN=https://eventu.co,https://www.eventu.co,https://app.eventu.co

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Estructura de Base de Datos

El backend debe tener una tabla de tickets con al menos los siguientes campos:

```sql
CREATE TABLE tickets (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50),
  status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
  validated BOOLEAN DEFAULT FALSE,
  validated_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_validated (validated)
);
```

---

## Notas Importantes

### 1. Seguridad del QR
- ✅ **El QR cambia cada 10 segundos**: Aunque el ID del ticket es el mismo, el QR visual cambia para prevenir capturas de pantalla
- ✅ **Cada QR es único**: Nunca se repite un QR generado
- ✅ **El ID del ticket es estático**: El ID del ticket (ej: "AF345RS") no cambia, solo cambia el resto del formato

### 2. Validación en Tiempo Real
- ✅ **Polling automático**: La app hace polling cada 1-2 segundos al endpoint de validación
- ✅ **Detección inmediata**: Cuando el ticket es validado, la app lo detecta automáticamente
- ✅ **Desactivación automática**: El QR se desactiva inmediatamente después de ser validado

### 3. Reglas de Validación
- ✅ **Un ticket solo puede ser validado una vez**: Una vez validado, el QR se desactiva y no se puede usar nuevamente
- ✅ **Validación solo el día del evento**: El QR solo está disponible el día del evento
- ✅ **Formato del ID del ticket**: El ID del ticket puede contener letras y números (ej: "AF345RS", "TICKET123", etc.)

### 4. Manejo de Errores
- ✅ **Ticket no encontrado**: Retornar error 404 con mensaje claro
- ✅ **Ticket ya validado**: Retornar información de cuándo fue validado
- ✅ **Ticket no disponible**: Retornar error si el ticket no está disponible para validación
- ✅ **Error de conexión**: El scanner debe manejar errores de red gracefully

### 5. Mejores Prácticas
- ✅ **Validar formato del QR**: Verificar que el QR tenga el formato correcto antes de procesarlo
- ✅ **Manejar timeouts**: Configurar timeouts apropiados en las peticiones HTTP
- ✅ **Logging**: Registrar todas las validaciones para auditoría
- ✅ **Feedback visual**: Mostrar feedback claro al usuario cuando se valida un ticket

### 6. Testing
- ✅ **Probar con QRs válidos**: Probar con diferentes IDs de tickets
- ✅ **Probar con QRs inválidos**: Probar con formatos incorrectos
- ✅ **Probar validación duplicada**: Intentar validar el mismo ticket dos veces
- ✅ **Probar sin conexión**: Manejar casos donde no hay conexión a internet

---

## Soporte

Para más información o soporte, contactar al equipo de desarrollo de Eventu.co.

**Última actualización:** Enero 2025


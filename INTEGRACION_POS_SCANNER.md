# Integración del Lector POS (Point of Sale) - Eventu.co

## 📋 Resumen

Este documento explica cómo funciona el sistema de lectura de códigos QR desde un lector POS (Point of Sale) para validar tickets de Eventu.co.

---

## 🔍 Formato del Código QR

Cuando un usuario muestra su ticket en la app móvil, se genera un código QR con el siguiente formato:

```
TICKET_ID|TIMESTAMP|RANDOM|COUNTER
```

### Ejemplo Real:
```
AF345RS|1734567890123|abc123xyz|5
```

### Estructura:
- **TICKET_ID**: ID único del ticket (ej: "AF345RS", "TICKET123", "12345")
  - ⚠️ **Esta es la parte importante que el lector debe extraer**
- **TIMESTAMP**: Timestamp en milisegundos cuando se generó el QR
- **RANDOM**: String aleatorio para garantizar unicidad
- **COUNTER**: Contador incremental para evitar repeticiones

### Características Importantes:
- ✅ El QR **cambia cada 10 segundos** para prevenir capturas de pantalla
- ✅ Cada QR generado es **único y nunca se repite**
- ✅ **El ID del ticket NO cambia** (siempre es la primera parte antes del primer `|`)
- ✅ El formato permite extraer fácilmente el ID del ticket

---

## 📤 Proceso de Escaneo y Validación

### Paso 1: Escanear el QR

Cuando el lector POS escanea el código QR, obtiene un string como:
```
AF345RS|1734567890123|abc123xyz|5
```

### Paso 2: Extraer el ID del Ticket

El lector debe extraer el **ID del ticket** (la primera parte antes del primer `|`):

```javascript
function extractTicketId(qrString) {
  // El ID del ticket es la primera parte antes del primer "|"
  const ticketId = qrString.split('|')[0];
  return ticketId;
}

// Ejemplo:
const qrCode = "AF345RS|1734567890123|abc123xyz|5";
const ticketId = extractTicketId(qrCode); // Retorna: "AF345RS"
```

### Paso 3: Enviar al API POS

El lector debe hacer un **POST** al endpoint del API POS:

**URL:**
```
https://api-pos.eventu.co/get_data
```

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "collection": "checkintest",
  "filter": {
    "code": "AF345RS"
  }
}
```

**Donde:**
- `collection`: Siempre debe ser `"checkintest"`
- `filter.code`: El ID del ticket extraído del QR (ej: "AF345RS")

---

## 📥 Respuesta del API

### Respuesta Exitosa (Ticket Válido):

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "AF345RS",
      "code": "AF345RS",
      "eventId": "event-123",
      "eventName": "Concierto de Rock",
      "status": "active",
      "validated": false,
      "date": "2025-01-15",
      "seat": "Asiento 15",
      "venue": "Estadio El Campín"
    }
  }
}
```

### Respuesta Error (Ticket No Encontrado):

```json
{
  "success": false,
  "message": "Ticket no encontrado"
}
```

### Respuesta Error (Ticket Ya Validado):

```json
{
  "success": false,
  "message": "El ticket ya ha sido validado",
  "data": {
    "ticket": {
      "id": "AF345RS",
      "validated": true,
      "validatedAt": "2025-01-15T10:25:00Z"
    }
  }
}
```

---

## 💻 Ejemplos de Implementación

### JavaScript/TypeScript (Node.js):

```javascript
/**
 * Extrae el ID del ticket del código QR
 */
function extractTicketId(qrString) {
  if (!qrString || typeof qrString !== 'string') {
    throw new Error('QR string inválido');
  }
  
  // El ID del ticket es la primera parte antes del primer "|"
  const parts = qrString.split('|');
  if (parts.length < 1) {
    throw new Error('Formato de QR inválido');
  }
  
  return parts[0];
}

/**
 * Valida un ticket escaneado con el API POS
 */
async function validateTicketWithPOS(qrString) {
  try {
    // 1. Extraer el ID del ticket
    const ticketId = extractTicketId(qrString);
    
    if (!ticketId) {
      return {
        success: false,
        message: 'No se pudo extraer el ID del ticket del QR'
      };
    }
    
    // 2. Validar el ticket en el API POS
    const response = await fetch('https://api-pos.eventu.co/get_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'checkintest',
        filter: {
          code: ticketId
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data?.ticket) {
      const ticket = result.data.ticket;
      
      // Verificar si ya fue validado
      if (ticket.validated) {
        return {
          success: false,
          message: 'El ticket ya ha sido validado anteriormente',
          ticket: ticket,
          alreadyValidated: true
        };
      }
      
      console.log('✅ Ticket válido:', ticketId);
      return {
        success: true,
        ticket: ticket,
        ticketId: ticketId
      };
    } else {
      console.log('❌ Error al validar ticket:', result.message);
      return {
        success: false,
        message: result.message || 'Error al validar ticket'
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

// Uso:
const qrCode = "AF345RS|1734567890123|abc123xyz|5";
const result = await validateTicketWithPOS(qrCode);

if (result.success) {
  console.log(`✅ Ticket ${result.ticketId} es válido`);
  console.log(`Evento: ${result.ticket.eventName}`);
  console.log(`Fecha: ${result.ticket.date}`);
} else {
  console.error(`❌ Error: ${result.message}`);
}
```

### Python:

```python
import requests
from typing import Dict, Optional

API_POS_URL = "https://api-pos.eventu.co/get_data"

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
    
    # El ID del ticket es la primera parte antes del primer "|"
    parts = qr_string.split('|')
    if len(parts) < 1:
        raise ValueError("Formato de QR inválido")
    
    return parts[0]

def validate_ticket_with_pos(qr_string: str) -> Dict:
    """
    Valida un ticket escaneado con el API POS.
    
    Args:
        qr_string: String completo del código QR
        
    Returns:
        dict: Resultado de la validación
    """
    try:
        # 1. Extraer el ID del ticket
        ticket_id = extract_ticket_id(qr_string)
        
        # 2. Validar el ticket en el API POS
        response = requests.post(
            API_POS_URL,
            json={
                "collection": "checkintest",
                "filter": {
                    "code": ticket_id
                }
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        result = response.json()
        
        if result.get("success") and result.get("data", {}).get("ticket"):
            ticket = result["data"]["ticket"]
            
            # Verificar si ya fue validado
            if ticket.get("validated"):
                return {
                    "success": False,
                    "message": "El ticket ya ha sido validado anteriormente",
                    "ticket": ticket,
                    "already_validated": True
                }
            
            print(f"✅ Ticket válido: {ticket_id}")
            return {
                "success": True,
                "ticket": ticket,
                "ticket_id": ticket_id
            }
        else:
            print(f"❌ Error al validar ticket: {result.get('message')}")
            return {
                "success": False,
                "message": result.get("message", "Error al validar ticket")
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
qr_code = "AF345RS|1734567890123|abc123xyz|5"
result = validate_ticket_with_pos(qr_code)

if result["success"]:
    print(f"✅ Ticket {result['ticket_id']} es válido")
    print(f"Evento: {result['ticket']['eventName']}")
    print(f"Fecha: {result['ticket']['date']}")
else:
    print(f"❌ Error: {result['message']}")
```

### PHP:

```php
<?php

/**
 * Extrae el ID del ticket del código QR
 */
function extractTicketId($qrString) {
    if (empty($qrString) || !is_string($qrString)) {
        throw new InvalidArgumentException('QR string inválido');
    }
    
    // El ID del ticket es la primera parte antes del primer "|"
    $parts = explode('|', $qrString);
    if (empty($parts) || empty($parts[0])) {
        throw new InvalidArgumentException('Formato de QR inválido');
    }
    
    return $parts[0];
}

/**
 * Valida un ticket escaneado con el API POS
 */
function validateTicketWithPOS($qrString) {
    try {
        // 1. Extraer el ID del ticket
        $ticketId = extractTicketId($qrString);
        
        // 2. Preparar la petición
        $data = [
            'collection' => 'checkintest',
            'filter' => [
                'code' => $ticketId
            ]
        ];
        
        $options = [
            'http' => [
                'header' => "Content-Type: application/json\r\n",
                'method' => 'POST',
                'content' => json_encode($data),
                'timeout' => 10
            ]
        ];
        
        $context = stream_context_create($options);
        $response = file_get_contents('https://api-pos.eventu.co/get_data', false, $context);
        
        if ($response === FALSE) {
            return [
                'success' => false,
                'message' => 'Error de conexión al API POS'
            ];
        }
        
        $result = json_decode($response, true);
        
        if ($result['success'] && isset($result['data']['ticket'])) {
            $ticket = $result['data']['ticket'];
            
            // Verificar si ya fue validado
            if (isset($ticket['validated']) && $ticket['validated']) {
                return [
                    'success' => false,
                    'message' => 'El ticket ya ha sido validado anteriormente',
                    'ticket' => $ticket,
                    'already_validated' => true
                ];
            }
            
            return [
                'success' => true,
                'ticket' => $ticket,
                'ticket_id' => $ticketId
            ];
        } else {
            return [
                'success' => false,
                'message' => $result['message'] ?? 'Error al validar ticket'
            ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ];
    }
}

// Uso:
$qrCode = "AF345RS|1734567890123|abc123xyz|5";
$result = validateTicketWithPOS($qrCode);

if ($result['success']) {
    echo "✅ Ticket {$result['ticket_id']} es válido\n";
    echo "Evento: {$result['ticket']['eventName']}\n";
    echo "Fecha: {$result['ticket']['date']}\n";
} else {
    echo "❌ Error: {$result['message']}\n";
}
?>
```

---

## 🔐 Notas de Seguridad

1. **Extracción Correcta del ID**: Es crítico extraer solo la primera parte antes del primer `|`. El resto del código QR puede cambiar, pero el ID del ticket siempre será el mismo.

2. **Validación del Formato**: Siempre validar que el QR tenga el formato correcto antes de procesarlo.

3. **Manejo de Errores**: Implementar manejo robusto de errores para casos de:
   - QR mal formateado
   - Ticket no encontrado
   - Ticket ya validado
   - Errores de conexión

4. **Timeout**: Configurar timeouts apropiados (recomendado: 10 segundos) para las peticiones HTTP.

5. **Logging**: Registrar todas las validaciones para auditoría y debugging.

---

## ✅ Flujo Completo

```
1. Usuario muestra QR en la app móvil
   └─> QR generado: "AF345RS|1734567890123|abc123xyz|5"

2. Lector POS escanea el QR
   └─> Obtiene: "AF345RS|1734567890123|abc123xyz|5"

3. Lector extrae el ID del ticket
   └─> Extrae: "AF345RS" (primera parte antes del primer "|")

4. Lector hace POST al API POS
   └─> POST https://api-pos.eventu.co/get_data
   └─> Body: {
         "collection": "checkintest",
         "filter": { "code": "AF345RS" }
       }

5. API POS responde
   └─> Si es válido: { success: true, data: { ticket: {...} } }
   └─> Si no existe: { success: false, message: "Ticket no encontrado" }
   └─> Si ya validado: { success: false, message: "Ya validado", data: {...} }

6. Lector muestra resultado
   └─> ✅ Válido: Permitir entrada
   └─> ❌ Inválido: Rechazar entrada
```

---

## 📞 Soporte

Para más información o soporte, contactar al equipo de desarrollo de Eventu.co.

**Última actualización:** Enero 2025



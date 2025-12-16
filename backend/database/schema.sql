-- Base de datos para Eventu
-- Ejecutar este script en MySQL para crear las tablas necesarias

CREATE DATABASE IF NOT EXISTS eventu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE eventu_db;

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  full_description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  images JSON,
  video_url VARCHAR(500),
  promoter VARCHAR(255),
  instructions JSON,
  available_tickets INT DEFAULT 0,
  sold_tickets INT DEFAULT 0,
  status ENUM('draft', 'published', 'cancelled') DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de compras
-- NOTA: Las compras se gestionan en la web, no en esta app.
-- Esta tabla se mantiene solo para referencia histórica si ya existe en producción.
-- Si necesitas crear la tabla para integración con la web, descomenta lo siguiente:
/*
CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  tickets JSON NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('visa', 'mastercard', 'amex', 'paypal', 'cash') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_transaction_id VARCHAR(255),
  siigo_invoice_id VARCHAR(255),
  siigo_invoice_number VARCHAR(255),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_event_id (event_id),
  INDEX idx_order_number (order_number),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  ticket_type VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT DEFAULT 1,
  seat_number VARCHAR(50),
  status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
  purchase_id INT NULL COMMENT 'ID de compra desde la web (opcional)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_event_id (event_id),
  INDEX idx_status (status),
  INDEX idx_purchase_id (purchase_id)
  -- FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  -- FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL
  -- Nota: purchase_id se mantiene para referencia histórica, pero las compras se gestionan en la web
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de validaciones de tickets
CREATE TABLE IF NOT EXISTS ticket_validations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(255) NOT NULL UNIQUE,
  validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP NULL,
  validated_by VARCHAR(255),
  scanned_at TIMESTAMP NULL,
  scanned_by VARCHAR(255),
  validation_status ENUM('pending', 'scanned', 'validated', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_validation_status (validation_status),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  profile_image VARCHAR(500),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'staff', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Database Initialization Script for Couture Studio
-- Run this script in your MySQL client to set up the tables

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS production_stages;
DROP TABLE IF EXISTS production_orders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (for Authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sales', 'production', 'inventory', 'finance') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Settings Table (Global configuration)
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) DEFAULT 'Couture Studio',
    currency VARCHAR(10) DEFAULT 'KES',
    overhead_percent DECIMAL(5,2) DEFAULT 0.00,
    min_profit_percent DECIMAL(5,2) DEFAULT 20.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Quotes Table
CREATE TABLE quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    items JSON NOT NULL COMMENT 'Array of line items with prices, quantities, and notes',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'sent', 'accepted', 'rejected') DEFAULT 'draft',
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Invoices Table (Linked to Quotes)
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    client_name VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(50) UNIQUE,
    items JSON NOT NULL COMMENT 'Snapshot of items at invoice time',
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);

-- 5. Payments Table (Linked to Invoices)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) DEFAULT 'cash', -- mpesa, cash, bank_transfer
    reference_code VARCHAR(100), -- M-Pesa Code
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 6. Expenses Table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Production Orders Table
CREATE TABLE production_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE COMMENT 'Zoho-style reference (e.g., PRD-001)',
    brand_id VARCHAR(50),
    client_name VARCHAR(255) NOT NULL,
    assigned_tailor VARCHAR(255),
    current_status ENUM('cutting', 'sewing', 'finishing', 'qc', 'done') DEFAULT 'cutting',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    completed_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Production Stages (Workflow History)
CREATE TABLE production_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_order_id INT NOT NULL,
    status ENUM('cutting', 'sewing', 'finishing', 'qc', 'done') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

-- 9. Notifications Table (Cross-Department Communication)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_role ENUM('admin', 'sales', 'production', 'inventory', 'finance'),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Initialize Default Settings
INSERT INTO settings (business_name, currency) VALUES ('Couture Studio', 'KES');

-- End of Script

-- Institutional Fashion House Tables
-- Run to add Inventory and Communication features

-- 1. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id VARCHAR(50) DEFAULT 'ATELIER-01',
    name VARCHAR(255) NOT NULL,
    type ENUM('fabric', 'trim', 'packaging') DEFAULT 'fabric',
    unit VARCHAR(50) DEFAULT 'meters', -- pieces, rolls
    cost_per_unit DECIMAL(10,2) DEFAULT 0.00,
    quantity_available DECIMAL(10,2) DEFAULT 0.00,
    reorder_level DECIMAL(10,2) DEFAULT 5.00,
    sourcing_model ENUM('bulk', 'project') DEFAULT 'bulk', -- bulk stays in inventory, project is ordered per job
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. System Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id VARCHAR(50) DEFAULT 'ATELIER-01',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error', 'action_required') DEFAULT 'info',
    department ENUM('admin', 'sales', 'production', 'inventory', 'all') DEFAULT 'all',
    target_role ENUM('admin', 'user', 'all') DEFAULT 'all',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255), -- Link to the related order/invoice
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- Can be NULL for system automated actions
    action VARCHAR(255) NOT NULL,
    details TEXT,
    department ENUM('sales', 'production', 'inventory', 'finance', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Sample Inventory Data
INSERT INTO inventory (name, type, unit, cost_per_unit, quantity_available, reorder_level, sourcing_model) VALUES 
('Raw Silk - Ivory', 'fabric', 'meters', 1200.00, 25.5, 5.00, 'bulk'),
('Viscose Lining - Black', 'fabric', 'meters', 400.00, 50.0, 10.00, 'bulk'),
('French Lace - Chantilly', 'fabric', 'meters', 5500.00, 0.0, 0.00, 'project'), -- Sourced per project
('Invisible Zips (22 inch)', 'trim', 'pieces', 150.00, 120, 20.00, 'bulk');

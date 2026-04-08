-- Create production_orders table
CREATE TABLE IF NOT EXISTS production_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL, -- Link to Invoice or Quote ID
    brand_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    assigned_tailor VARCHAR(100),
    current_status ENUM('cutting', 'sewing', 'finishing', 'qc', 'done') DEFAULT 'cutting',
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    completed_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create production_stages table for history/audit log
CREATE TABLE IF NOT EXISTS production_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_order_id INT NOT NULL,
    status ENUM('cutting', 'sewing', 'finishing', 'qc', 'done') NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

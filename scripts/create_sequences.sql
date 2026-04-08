-- 1. Create sequences table
CREATE TABLE IF NOT EXISTS sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(10) NOT NULL,
    `current_value` INT NOT NULL DEFAULT 0,
    `padding` INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Initialize sequence values
INSERT INTO sequences (entity_type, prefix, `current_value`, `padding`)
VALUES 
    ('quote', 'QUO-', 0, 3),
    ('invoice', 'INV-', 0, 3),
    ('production', 'PRD-', 0, 3)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 3. Add quote_number to quotes table
-- Note: COLUMN IF NOT EXISTS requires MariaDB or MySQL 8.0.19+. 
-- We will use a more compatible approach if needed, but let's try this first.
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50) UNIQUE AFTER id;

-- 4. Ensure production_orders has order_id as UNIQUE if not already
-- (Assuming it was created correctly in create_production_orders.sql)

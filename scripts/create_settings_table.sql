-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1, -- Only one row for global settings
    business_name VARCHAR(100) NOT NULL DEFAULT 'Couture Studio',
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    overhead_rate DECIMAL(5, 2) DEFAULT 10.00,
    min_profit_margin DECIMAL(5, 2) DEFAULT 20.00,
    wholesale_markup DECIMAL(5, 2) DEFAULT 2.1,
    retail_markup DECIMAL(5, 2) DEFAULT 2.2,
    tax_rate DECIMAL(5, 2) DEFAULT 16.00,
    estimated_monthly_volume INT DEFAULT 20,
    monthly_overheads JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings if not exists
INSERT IGNORE INTO settings (id, business_name, currency, overhead_rate, min_profit_margin, wholesale_markup, retail_markup, tax_rate, estimated_monthly_volume, monthly_overheads)
VALUES (1, 'Couture Studio', 'KES', 10.00, 20.00, 2.1, 2.2, 16.00, 20, 
'{"rent": 25000, "electricity": 5000, "internet": 3000, "phone": 2000, "maintenance": 1500, "salaries": 60000, "insurance": 2000, "depreciation": 5000, "transport": 4000}');

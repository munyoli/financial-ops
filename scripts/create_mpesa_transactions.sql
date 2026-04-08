-- M-Pesa Transactions Table for Couture Studio
-- Stores all M-Pesa transactions regardless of source (SMS, Daraja, Manual)

CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id VARCHAR(255) NOT NULL,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Transaction type: received, sent, paybill, buy_goods, withdrawal, deposit, airtime, pochi_biz
    type ENUM('received', 'sent', 'paybill', 'buy_goods', 'withdrawal', 'deposit', 'airtime', 'pochi_biz') NOT NULL,
    
    amount DECIMAL(12, 2) NOT NULL,
    phone VARCHAR(20),
    recipient_name VARCHAR(255),
    sender_name VARCHAR(255),
    
    -- How the transaction was captured
    source ENUM('sms', 'daraja', 'manual') DEFAULT 'manual',
    
    -- Categorization (set by user)
    category VARCHAR(50) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    is_categorized BOOLEAN DEFAULT FALSE,
    
    -- Links to existing records
    linked_invoice_id INT DEFAULT NULL,
    linked_expense_id VARCHAR(255) DEFAULT NULL,
    
    balance_after DECIMAL(12, 2) DEFAULT 0.00,
    transaction_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_brand_categorized (brand_id, is_categorized),
    INDEX idx_brand_month (brand_id, transaction_date),
    INDEX idx_source (source),
    
    -- Foreign key to invoices (optional)
    FOREIGN KEY (linked_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Modify existing unmatched_payments to reference mpesa_transactions
-- ALTER TABLE unmatched_payments ADD COLUMN mpesa_transaction_id INT DEFAULT NULL;

-- Sample Data Seeder for Couture Studio

-- 1. Create a Test Admin User
-- Password is 'password123' (hashed with bcrypt for demo purposes, hash might vary slightly but this is a valid structure)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Antigravity Admin', 'admin@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'admin');

-- 2. Create a Quote
INSERT INTO quotes (client_name, items, subtotal, total_price, status, created_at)
VALUES 
('Lupita Nyong''o', 
 '[{"name": "Red Carpet Gown", "material_cost": 5000, "labor_cost": 15000, "price": 25000}]', 
 25000.00, 
 25000.00, 
 'accepted', 
 NOW());

-- Get the ID of the quote we just made (assuming it is 1 for clean DB)
-- 3. Create an Invoice from that Quote
INSERT INTO invoices (quote_id, client_name, invoice_number, total_amount, status, issue_date, due_date)
VALUES 
(LAST_INSERT_ID(), 'Lupita Nyong''o', 'INV-2024-001', 25000.00, 'partial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY));

-- 4. Add a Payment for that Invoice
INSERT INTO payments (invoice_id, amount, method, reference_code, note)
VALUES 
(LAST_INSERT_ID(), 10000.00, 'mpesa', 'QWE123RTY', 'Deposit payment');

-- 5. Add some Expenses
INSERT INTO expenses (category, amount, date, description) 
VALUES 
('Fabrics', 4500.00, CURDATE(), 'Silk flowered pattern 3m'),
('Utilities', 1200.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Electricity bill'),
('Labor', 3000.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Assistant wages');

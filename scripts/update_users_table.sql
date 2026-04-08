-- Add department column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS department ENUM('admin', 'sales', 'production', 'inventory', 'finance') DEFAULT 'admin';

-- Update existing admin user to have 'admin' department
-- Using a dynamic update based on the role
UPDATE users SET department = 'admin' WHERE role = 'admin';

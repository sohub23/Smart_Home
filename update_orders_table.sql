-- Add order_number field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) NOT NULL DEFAULT '#10001';

-- Create index for order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
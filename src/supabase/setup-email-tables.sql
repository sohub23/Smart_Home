-- Create SMTP configuration table
CREATE TABLE IF NOT EXISTS smtp_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, is_active) VALUES
('order_confirmation_customer', 'Order Confirmation - {{order_number}}', 
'<h2>Thank you for your order!</h2>
<p>Dear {{customer_name}},</p>
<p>Your order has been confirmed. Here are the details:</p>
<p><strong>Order Number:</strong> {{order_number}}</p>
<p><strong>Total Amount:</strong> {{total_amount}} BDT</p>
<p><strong>Payment Method:</strong> {{payment_method}}</p>
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f5f5f5;">
      <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
    </tr>
  </thead>
  <tbody>
    {{order_items}}
  </tbody>
</table>
<p>We will contact you soon to confirm delivery details.</p>
<p>Thank you for choosing us!</p>', true),

('order_confirmation_admin', 'New Order Received - {{order_number}}',
'<h2>New Order Received</h2>
<p><strong>Order Number:</strong> {{order_number}}</p>
<p><strong>Customer:</strong> {{customer_name}}</p>
<p><strong>Email:</strong> {{customer_email}}</p>
<p><strong>Phone:</strong> {{customer_phone}}</p>
<p><strong>Address:</strong> {{customer_address}}</p>
<p><strong>Total Amount:</strong> {{total_amount}} BDT</p>
<p><strong>Payment Method:</strong> {{payment_method}}</p>
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f5f5f5;">
      <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
    </tr>
  </thead>
  <tbody>
    {{order_items}}
  </tbody>
</table>', true)

ON CONFLICT (name) DO NOTHING;
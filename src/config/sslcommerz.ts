export const sslCommerzConfig = {
  // SSL Commerce Configuration
  store_id: 'sohubshop0live',
  store_passwd: '65FAB9002A98896874',
  
  // Server URLs (your server: 202.59.208.112)
  success_url: `http://202.59.208.112:7000/api/payment/success`,
  fail_url: `http://202.59.208.112:7000/api/payment/fail`,
  cancel_url: `http://202.59.208.112:7000/api/payment/cancel`,
  ipn_url: `http://202.59.208.112:7000/api/payment/ipn`,
  
  // SSL Commerce API URLs
  sandbox_url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
  live_url: 'https://securepay.sslcommerz.com/gwprocess/v4/api.php',
  
  // Environment
  is_live: true, // Live environment
  
  // Default values
  currency: 'BDT',
  shipping_method: 'Courier',
  product_category: 'Smart Home Products'
};

export const createSSLCommerzPayment = (orderData: any) => {
  const paymentData = {
    store_id: sslCommerzConfig.store_id,
    store_passwd: sslCommerzConfig.store_passwd,
    total_amount: orderData.total_amount,
    currency: sslCommerzConfig.currency,
    tran_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    success_url: sslCommerzConfig.success_url,
    fail_url: sslCommerzConfig.fail_url,
    cancel_url: sslCommerzConfig.cancel_url,
    ipn_url: sslCommerzConfig.ipn_url,
    
    // Customer Information
    cus_name: orderData.customer_name,
    cus_email: orderData.customer_email,
    cus_add1: orderData.customer_address,
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: orderData.customer_phone,
    
    // Shipping Information
    ship_name: orderData.customer_name,
    ship_add1: orderData.customer_address,
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
    ship_phone: orderData.customer_phone,
    
    // Product Information
    product_name: 'Smart Home Products',
    product_category: sslCommerzConfig.product_category,
    product_profile: 'general',
    
    // Additional
    shipping_method: sslCommerzConfig.shipping_method,
    num_of_item: orderData.items?.length || 1,
    
    // Optional
    value_a: orderData.order_id || '',
    value_b: JSON.stringify(orderData.items || []),
    value_c: orderData.payment_method || 'online',
    value_d: new Date().toISOString()
  };
  
  return paymentData;
};
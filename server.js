const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SSLCOMMERZ_CONFIG = {
  store_id: 'sohubshop0live',
  store_passwd: '65FAB9002A98896874',
  is_live: true,
  live_url: 'https://securepay.sslcommerz.com/gwprocess/v4/api.php',
  sandbox_url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
};

// Initiate Payment
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const paymentData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      total_amount: req.body.total_amount,
      currency: 'BDT',
      tran_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      success_url: `http://202.59.208.112:7000/api/payment/success`,
      fail_url: `http://202.59.208.112:7000/api/payment/fail`,
      cancel_url: `http://202.59.208.112:7000/api/payment/cancel`,
      ipn_url: `http://202.59.208.112:7000/api/payment/ipn`,
      
      cus_name: req.body.customer_name,
      cus_email: req.body.customer_email,
      cus_add1: req.body.customer_address,
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: req.body.customer_phone,
      
      ship_name: req.body.customer_name,
      ship_add1: req.body.customer_address,
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      
      product_name: 'Smart Home Products',
      product_category: 'Electronics',
      product_profile: 'general'
    };

    const response = await axios.post(
      SSLCOMMERZ_CONFIG.is_live ? SSLCOMMERZ_CONFIG.live_url : SSLCOMMERZ_CONFIG.sandbox_url,
      new URLSearchParams(paymentData)
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Success callback
app.post('/api/payment/success', (req, res) => {
  console.log('Payment Success:', req.body);
  res.redirect('http://your-frontend-domain.com/payment-success');
});

// Fail callback
app.post('/api/payment/fail', (req, res) => {
  console.log('Payment Failed:', req.body);
  res.redirect('http://your-frontend-domain.com/payment-failed');
});

// Cancel callback
app.post('/api/payment/cancel', (req, res) => {
  console.log('Payment Cancelled:', req.body);
  res.redirect('http://your-frontend-domain.com/payment-cancelled');
});

// IPN (Instant Payment Notification)
app.post('/api/payment/ipn', (req, res) => {
  console.log('IPN Received:', req.body);
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`SSL Commerce server running on port ${PORT}`);
});
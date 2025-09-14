import { sslCommerzConfig, createSSLCommerzPayment } from '@/config/sslcommerz';

export const initiateSSLCommerzPayment = async (orderData: any) => {
  try {
    console.log('Sending payment data:', orderData);
    
    // Send request to your server
    const response = await fetch('http://202.59.208.112:7000/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('SSL Commerce response:', result);
    
    if (result.status === 'SUCCESS') {
      // Redirect to SSL Commerce payment page
      window.location.href = result.GatewayPageURL;
      return { success: true, data: result };
    } else {
      throw new Error(result.failedreason || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('SSL Commerce payment error:', error);
    return { success: false, error: error.message };
  }
};

export const verifySSLCommerzPayment = async (transactionId: string) => {
  try {
    const verifyData = {
      store_id: sslCommerzConfig.store_id,
      store_passwd: sslCommerzConfig.store_passwd,
      val_id: transactionId
    };
    
    const formData = new FormData();
    Object.keys(verifyData).forEach(key => {
      formData.append(key, verifyData[key]);
    });
    
    const verifyUrl = sslCommerzConfig.is_live 
      ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
    
    const response = await fetch(verifyUrl, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('SSL Commerce verification error:', error);
    return { status: 'FAILED', error: error.message };
  }
};
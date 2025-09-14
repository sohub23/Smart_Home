// Manual notification trigger for orders and customers
export const triggerNotification = (type: 'order' | 'customer', data: any) => {
  // Dispatch custom event that the notification system can listen to
  const event = new CustomEvent('newNotification', {
    detail: { type, data }
  });
  window.dispatchEvent(event);
};

export const triggerOrderNotification = (orderData: any) => {
  triggerNotification('order', orderData);
};

export const triggerCustomerNotification = (customerData: any) => {
  triggerNotification('customer', customerData);
};
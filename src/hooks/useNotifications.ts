import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';

export interface Notification {
  id: string;
  type: 'order' | 'customer';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  console.log('useNotifications hook initialized', { notifications: notifications.length, unreadCount });

  useEffect(() => {
    console.log('Setting up notification system...');
    
    // Listen for manual notification triggers
    const handleCustomNotification = (event: CustomEvent) => {
      console.log('🔔 Manual notification triggered:', event.detail);
      const { type, data } = event.detail;
      
      if (type === 'order') {
        const newNotification: Notification = {
          id: `order-${data.id || Date.now()}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${data.order_number || data.id} - ${data.total_amount || 'N/A'} BDT`,
          timestamp: new Date(),
          read: false,
          data
        };
        addNotification(newNotification);
      } else if (type === 'customer') {
        const newNotification: Notification = {
          id: `customer-${data.id || Date.now()}`,
          type: 'customer',
          title: 'New Customer Registered',
          message: `${data.name || data.customer_name || 'New Customer'} - ${data.email || data.customer_email || ''}`,
          timestamp: new Date(),
          read: false,
          data
        };
        addNotification(newNotification);
      }
    };

    // Add event listener for manual triggers
    window.addEventListener('newNotification', handleCustomNotification as EventListener);

    // Also try Supabase subscriptions as backup
    const ordersChannel = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        console.log('🔔 Supabase order detected:', payload);
        const newNotification: Notification = {
          id: `order-${payload.new.id}-${Date.now()}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${payload.new.order_number || payload.new.id} - ${payload.new.total_amount || 'N/A'} BDT`,
          timestamp: new Date(),
          read: false,
          data: payload.new
        };
        addNotification(newNotification);
      })
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up notification system');
      window.removeEventListener('newNotification', handleCustomNotification as EventListener);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const addNotification = (notification: Notification) => {
    console.log('Adding notification:', notification);
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, 49)];
      console.log('Updated notifications:', newNotifications);
      return newNotifications;
    });
    setUnreadCount(prev => {
      const newCount = prev + 1;
      console.log('Updated unread count:', newCount);
      return newCount;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const addTestNotification = () => {
    console.log('Test notification button clicked');
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      type: 'order',
      title: 'Test Order Received',
      message: 'Order #TEST-001 - 1500 BDT',
      timestamp: new Date(),
      read: false,
      data: { id: 'test', order_number: 'TEST-001', total_amount: 1500 }
    };
    console.log('Creating test notification:', testNotification);
    addNotification(testNotification);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addTestNotification
  };
};
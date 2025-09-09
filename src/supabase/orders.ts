import { supabase } from './client';
import { customerService } from './customers';
import { sanitizeForLog, sanitizeSearchTerm, sanitizeString, validateId } from '../utils/sanitize';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  category: string;
}

export interface Order {
  id?: string;
  order_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  status: string;
  created_at?: string;
}

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'order_number'>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          order_number: `ORD${Date.now()}`,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', sanitizeForLog(error));
        throw error;
      }

      // Try to save customer data (non-blocking)
      try {
        await customerService.createOrUpdateCustomer({
          name: orderData.customer_name,
          email: orderData.customer_email,
          phone: orderData.customer_phone,
          address: orderData.customer_address,
          total_spent: orderData.total_amount
        });
      } catch (customerError) {
        console.warn('Customer save failed, but order was created:', sanitizeForLog(customerError));
      }

      return data;
    } catch (error) {
      console.error('Order creation failed:', sanitizeForLog(error));
      throw error;
    }
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', sanitizeForLog(error));
      throw error;
    }

    return data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const validOrderId = validateId(orderId)
    if (!validOrderId) throw new Error('Invalid order ID')
    
    const validStatus = sanitizeString(status)
    if (!validStatus) throw new Error('Invalid status')
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status: validStatus })
      .eq('id', validOrderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', sanitizeForLog(error));
      throw error;
    }

    return data;
  },

  async searchOrders(query: string) {
    const sanitizedQuery = sanitizeSearchTerm(query);
    
    if (!sanitizedQuery) {
      return [];
    }
    
    // Use parameterized queries to prevent injection
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.ilike.%${sanitizedQuery}%,customer_phone.ilike.%${sanitizedQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching orders:', sanitizeForLog(error));
      throw error;
    }

    return data;
  },

  async deleteOrder(orderId: string) {
    const validOrderId = validateId(orderId)
    if (!validOrderId) throw new Error('Invalid order ID')
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', validOrderId);

    if (error) {
      console.error('Error deleting order:', sanitizeForLog(error));
      throw error;
    }

    return true;
  },

  async updateOrder(orderId: string, orderData: Partial<Order>) {
    const validOrderId = validateId(orderId)
    if (!validOrderId) throw new Error('Invalid order ID')
    
    const sanitizedOrderData = {
      ...orderData,
      customer_name: orderData.customer_name ? sanitizeString(orderData.customer_name) : undefined,
      customer_email: orderData.customer_email ? sanitizeString(orderData.customer_email) : undefined,
      customer_phone: orderData.customer_phone ? sanitizeString(orderData.customer_phone) : undefined,
      customer_address: orderData.customer_address ? sanitizeString(orderData.customer_address) : undefined,
      status: orderData.status ? sanitizeString(orderData.status) : undefined
    };
    
    const { data, error } = await supabase
      .from('orders')
      .update(sanitizedOrderData)
      .eq('id', validOrderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', sanitizeForLog(error));
      throw error;
    }

    return data;
  }
};
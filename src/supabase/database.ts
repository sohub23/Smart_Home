import { supabase } from './client'

export interface Order {
  id: string
  customer_name: string
  email: string
  phone: string
  product_type: string
  status: string
  total_amount: number
  created_at: string
}

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateOrderStatus(id: string, status: string) {
    // Sanitize ID to prevent injection
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', sanitizedId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
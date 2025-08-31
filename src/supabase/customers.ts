import { supabase } from './client';

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  total_orders?: number;
  total_spent?: number;
  created_at?: string;
  updated_at?: string;
}

export const customerService = {
  async createOrUpdateCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    // Check if customer exists by email or phone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .or(`email.eq."${customerData.email.replace(/[^a-zA-Z0-9@.-]/g, '')}",phone.eq."${customerData.phone.replace(/[^0-9+\-\s]/g, '')}"`)
      .single();

    if (existingCustomer) {
      // Update existing customer
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          address: customerData.address,
          total_orders: (existingCustomer.total_orders || 0) + 1,
          total_spent: (existingCustomer.total_spent || 0) + (customerData.total_spent || 0),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id.replace(/[^a-zA-Z0-9-]/g, ''))
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new customer
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          total_orders: 1,
          total_spent: customerData.total_spent || 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
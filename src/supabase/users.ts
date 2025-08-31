import { supabase } from './client';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'support' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  department?: string;
  permissions?: string[];
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, userData: Partial<User>) {
    // Sanitize ID to prevent injection
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    const { data, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', sanitizedUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(userId: string) {
    // Sanitize ID to prevent injection
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', sanitizedUserId);

    if (error) throw error;
    return true;
  },

  async updateLastLogin(userId: string) {
    // Sanitize ID to prevent injection
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', sanitizedUserId);

    if (error) throw error;
    return true;
  }
};
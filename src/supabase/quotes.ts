import { supabase } from './client';
import { sanitizeLogInput } from '../utils/sanitize';

export interface QuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  category: string;
}

export interface Quote {
  id?: string;
  quote_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  items: QuoteItem[];
  total_amount: number;
  physical_visit_requested: boolean;
  need_expert_help?: boolean;
  status: string;
  created_at?: string;
}

export const quoteService = {
  async createQuote(quoteData: Omit<Quote, 'id' | 'created_at' | 'quote_number'>) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([{
        ...quoteData,
        quote_number: `Q${Date.now()}`,
        status: 'pending',
        need_expert_help: quoteData.need_expert_help || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating quote:', sanitizeLogInput(error));
      throw error;
    }

    return data;
  },

  async getQuotes() {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', sanitizeLogInput(error));
      throw error;
    }

    return data;
  },

  async updateQuoteStatus(quoteId: string, status: string) {
    // Validate inputs
    if (!quoteId || !status) {
      throw new Error('Quote ID and status are required');
    }
    
    // Validate status against allowed values
    const allowedStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }
    
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', quoteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating quote status:', sanitizeLogInput(error));
      throw error;
    }

    return data;
  }
};
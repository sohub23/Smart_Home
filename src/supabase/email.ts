import { supabase } from './client';

export interface SMTPConfig {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  admin_email: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const emailService = {
  // SMTP Configuration
  async getSMTPConfig(): Promise<SMTPConfig | null> {
    const { data, error } = await supabase
      .from('smtp_config')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching SMTP config:', error);
      return null;
    }
    
    return data;
  },

  async saveSMTPConfig(config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SMTPConfig | null> {
    try {
      // First try to insert directly
      const { data, error } = await supabase
        .from('smtp_config')
        .insert([config])
        .select()
        .single();

      if (error) {
        console.error('Error saving SMTP config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception saving SMTP config:', error);
      return null;
    }
  },

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }

    return data || [];
  },

  async getEmailTemplate(name: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching email template:', error);
      return null;
    }

    return data;
  },

  async saveEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate | null> {
    try {
      // Clean the template object to only include allowed fields
      const cleanTemplate = {
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content || null,
        is_active: template.is_active
      };
      
      // Try to update first, if not exists then insert
      const { data: updateData, error: updateError } = await supabase
        .from('email_templates')
        .update(cleanTemplate)
        .eq('name', template.name)
        .select()
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // Template doesn't exist, insert new one
        const { data, error } = await supabase
          .from('email_templates')
          .insert([cleanTemplate])
          .select()
          .single();

        if (error) {
          console.error('Error inserting email template:', error);
          return null;
        }
        return data;
      } else if (updateError) {
        console.error('Error updating email template:', updateError);
        return null;
      }

      return updateData;
    } catch (error) {
      console.error('Exception saving email template:', error);
      return null;
    }
  },

  async deleteEmailTemplate(templateName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('name', templateName);

      if (error) {
        console.error('Error deleting email template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting email template:', error);
      return false;
    }
  },

  // Send Email using server API
  async sendEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<boolean> {
    try {
      const smtpConfig = await this.getSMTPConfig();
      if (!smtpConfig) {
        console.error('No SMTP configuration found');
        return false;
      }

      const response = await fetch('http://202.59.208.112:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          smtpConfig
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  },

  // Send Order Confirmation
  async sendOrderConfirmation(orderData: any): Promise<boolean> {
    try {
      const smtpConfig = await this.getSMTPConfig();
      if (!smtpConfig) return false;

      const customerTemplate = await this.getEmailTemplate('order_confirmation_customer');
      const adminTemplate = await this.getEmailTemplate('order_confirmation_admin');

      // Send customer email
      if (customerTemplate) {
        const customerHtml = this.replaceTemplateVariables(customerTemplate.html_content, orderData);
        const customerSubject = this.replaceTemplateVariables(customerTemplate.subject, orderData);
        await this.sendEmail(orderData.customer_email, customerSubject, customerHtml);
      }

      // Send admin email
      if (adminTemplate && smtpConfig.admin_email) {
        const adminHtml = this.replaceTemplateVariables(adminTemplate.html_content, orderData);
        const adminSubject = this.replaceTemplateVariables(adminTemplate.subject, orderData);
        await this.sendEmail(smtpConfig.admin_email, adminSubject, adminHtml);
      }

      return true;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  },

  replaceTemplateVariables(template: string, data: any): string {
    return template
      .replace(/{{customer_name}}/g, data.customer_name || '')
      .replace(/{{order_number}}/g, data.order_number || '')
      .replace(/{{total_amount}}/g, data.total_amount?.toLocaleString() || '0')
      .replace(/{{customer_email}}/g, data.customer_email || '')
      .replace(/{{customer_phone}}/g, data.customer_phone || '')
      .replace(/{{customer_address}}/g, data.customer_address || '')
      .replace(/{{payment_method}}/g, data.payment_method || '')
      .replace(/{{order_items}}/g, this.formatOrderItems(data.items || []))
      .replace(/{{order_date}}/g, new Date().toLocaleDateString());
  },

  formatOrderItems(items: any[]): string {
    return items.map(item => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price?.toLocaleString()} BDT</td>
      </tr>`
    ).join('');
  }
};
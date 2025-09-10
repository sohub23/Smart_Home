import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { emailService, SMTPConfig, EmailTemplate } from '@/supabase/email';
import AdminNavbar from '@/components/AdminNavbar';

const AdminEmailSettings = () => {
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    admin_email: '',
    is_active: true
  });
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setSMTPLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  useEffect(() => {
    loadSMTPConfig();
    loadTemplates();
  }, []);

  const loadSMTPConfig = async () => {
    const config = await emailService.getSMTPConfig();
    if (config) {
      setSMTPConfig(config);
    }
  };

  const loadTemplates = async () => {
    const templateList = await emailService.getEmailTemplates();
    setTemplates(templateList);
  };

  const handleSMTPSave = async () => {
    setSMTPLoading(true);
    try {
      console.log('Saving SMTP config:', smtpConfig);
      const saved = await emailService.saveSMTPConfig(smtpConfig);
      console.log('Save result:', saved);
      if (saved) {
        toast({
          title: "SMTP Configuration Saved",
          description: "Email settings have been updated successfully."
        });
        loadSMTPConfig();
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('SMTP save error:', error);
      toast({
        title: "Error",
        description: `Failed to save SMTP configuration: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSMTPLoading(false);
    }
  };

  const handleTemplateSave = async () => {
    if (!selectedTemplate) return;
    
    setTemplateLoading(true);
    try {
      const saved = await emailService.saveEmailTemplate(selectedTemplate);
      if (saved) {
        toast({
          title: "Template Saved",
          description: "Email template has been updated successfully."
        });
        loadTemplates();
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email template.",
        variant: "destructive"
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateDelete = async (templateName: string) => {
    if (!confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      return;
    }
    
    try {
      const deleted = await emailService.deleteEmailTemplate(templateName);
      if (deleted) {
        toast({
          title: "Template Deleted",
          description: "Email template has been deleted successfully."
        });
        loadTemplates();
        setSelectedTemplate(null);
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email template.",
        variant: "destructive"
      });
    }
  };

  const defaultTemplates = [
    {
      name: 'order_confirmation_customer',
      subject: 'Order Confirmation - {{order_number}}',
      html_content: `
        <h2>Thank you for your order!</h2>
        <p>Dear {{customer_name}},</p>
        <p>Your order has been confirmed. Here are the details:</p>
        <p><strong>Order Number:</strong> {{order_number}}</p>
        <p><strong>Total Amount:</strong> {{total_amount}} BDT</p>
        <p><strong>Payment Method:</strong> {{payment_method}}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{order_items}}
          </tbody>
        </table>
        <p>We will contact you soon to confirm delivery details.</p>
        <p>Thank you for choosing us!</p>
      `,
      is_active: true
    },
    {
      name: 'order_confirmation_admin',
      subject: 'New Order Received - {{order_number}}',
      html_content: `
        <h2>New Order Received</h2>
        <p><strong>Order Number:</strong> {{order_number}}</p>
        <p><strong>Customer:</strong> {{customer_name}}</p>
        <p><strong>Email:</strong> {{customer_email}}</p>
        <p><strong>Phone:</strong> {{customer_phone}}</p>
        <p><strong>Address:</strong> {{customer_address}}</p>
        <p><strong>Total Amount:</strong> {{total_amount}} BDT</p>
        <p><strong>Payment Method:</strong> {{payment_method}}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{order_items}}
          </tbody>
        </table>
      `,
      is_active: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Email Settings</h1>
        
        <Tabs defaultValue="smtp" className="space-y-6">
          <TabsList>
            <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="smtp">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">SMTP Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input
                      id="host"
                      value={smtpConfig.host}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={smtpConfig.port}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={smtpConfig.username}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={smtpConfig.password}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from_email">From Email</Label>
                    <Input
                      id="from_email"
                      type="email"
                      value={smtpConfig.from_email}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, from_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      value={smtpConfig.from_name}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, from_name: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={smtpConfig.admin_email}
                    onChange={(e) => setSMTPConfig(prev => ({ ...prev, admin_email: e.target.value }))}
                  />
                </div>
                
                <Button onClick={handleSMTPSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save SMTP Configuration'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Templates</h3>
                  <div className="space-y-2">
                    {defaultTemplates.map((template) => {
                      const existing = templates.find(t => t.name === template.name);
                      return (
                        <div key={template.name} className="flex gap-2">
                          <Button
                            variant={selectedTemplate?.name === template.name ? "default" : "outline"}
                            className="flex-1 justify-start"
                            onClick={() => {
                              setSelectedTemplate(existing || {
                                ...template,
                                id: undefined,
                                created_at: undefined,
                                updated_at: undefined
                              });
                            }}
                          >
                            {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Button>
                          {existing && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleTemplateDelete(template.name)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
              </div>

              {selectedTemplate && (
                <div className="lg:col-span-2 bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Template: {selectedTemplate.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="html_content">HTML Content</Label>
                      <Textarea
                        id="html_content"
                        rows={15}
                        value={selectedTemplate.html_content}
                        onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, html_content: e.target.value } : null)}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Available Variables:</strong></p>
                      <p>customer_name, order_number, total_amount, customer_email, customer_phone, customer_address, payment_method, order_items, order_date</p>
                    </div>
                    
                    <Button onClick={handleTemplateSave} disabled={templateLoading}>
                      {templateLoading ? 'Saving...' : 'Save Template'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminEmailSettings;
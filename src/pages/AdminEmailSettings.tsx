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
  const [testEmail, setTestEmail] = useState('');
  const [testTemplate, setTestTemplate] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

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

  const handleTestEmail = async () => {
    setTestLoading(true);
    try {
      const template = defaultTemplates.find(t => t.name === testTemplate);
      if (!template) throw new Error('Template not found');
      
      const testData = {
        customer_name: 'Test Customer',
        order_number: 'TEST-001',
        total_amount: '1000',
        customer_email: testEmail,
        customer_phone: '+8801234567890',
        customer_address: 'Test Address, Dhaka',
        payment_method: 'Cash on Delivery',
        order_items: '<tr><td style="padding: 8px; border: 1px solid #ddd;">Test Product</td><td style="padding: 8px; border: 1px solid #ddd;">1</td><td style="padding: 8px; border: 1px solid #ddd;">1000 BDT</td></tr>',
        order_date: new Date().toLocaleDateString()
      };
      
      const sent = await emailService.sendTestEmail(testEmail, template, testData);
      if (sent) {
        toast({
          title: "Test Email Sent",
          description: `Test email sent successfully to ${testEmail}`
        });
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;
    
    const testData = {
      customer_name: 'John Doe',
      order_number: 'ORD-12345',
      total_amount: '2500',
      customer_email: 'john@example.com',
      customer_phone: '+8801234567890',
      customer_address: '123 Main Street, Dhaka, Bangladesh',
      payment_method: 'Cash on Delivery',
      order_items: '<tr><td style="padding: 8px; border: 1px solid #ddd;">Smart LED Bulb</td><td style="padding: 8px; border: 1px solid #ddd;">2</td><td style="padding: 8px; border: 1px solid #ddd;">1200 BDT</td></tr><tr><td style="padding: 8px; border: 1px solid #ddd;">Smart Switch</td><td style="padding: 8px; border: 1px solid #ddd;">1</td><td style="padding: 8px; border: 1px solid #ddd;">1300 BDT</td></tr>',
      order_date: new Date().toLocaleDateString()
    };
    
    const preview = emailService.replaceTemplateVariables(selectedTemplate.html_content || '', testData);
    setPreviewContent(preview);
    setShowPreview(true);
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
            <TabsTrigger value="test">Test Email</TabsTrigger>
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
                        <div key={template.name}>
                          <Button
                            variant={selectedTemplate?.name === template.name ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedTemplate(existing || {
                                ...template,
                                id: undefined,
                                created_at: undefined,
                                updated_at: undefined
                              });
                            }}
                          >
                            {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/[<>&"']/g, '')}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
              </div>

              {selectedTemplate && (
                <div className="lg:col-span-2 bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Template: {String(selectedTemplate.name || '').replace(/[<>&"']/g, '')}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={selectedTemplate.subject || ''}
                        onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="html_content">HTML Content</Label>
                      <Textarea
                        id="html_content"
                        rows={15}
                        value={selectedTemplate.html_content || ''}
                        onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, html_content: e.target.value } : null)}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Available Variables:</strong></p>
                      <p>customer_name, order_number, total_amount, customer_email, customer_phone, customer_address, payment_method, order_items, order_date</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleTemplateSave} disabled={templateLoading}>
                        {templateLoading ? 'Saving...' : 'Save Template'}
                      </Button>
                      <Button variant="outline" onClick={handlePreview}>
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to send test"
                  />
                </div>
                
                <div>
                  <Label htmlFor="test-template">Select Template</Label>
                  <select
                    id="test-template"
                    value={testTemplate}
                    onChange={(e) => setTestTemplate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select a template</option>
                    {defaultTemplates.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  onClick={handleTestEmail} 
                  disabled={testLoading || !testEmail || !testTemplate}
                >
                  {testLoading ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Email Preview</h3>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="bg-white border rounded-lg p-4 min-h-[400px]">
                  <iframe
                    srcDoc={previewContent}
                    className="w-full h-[500px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmailSettings;
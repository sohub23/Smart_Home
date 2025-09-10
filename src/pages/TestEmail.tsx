import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { emailService } from '@/supabase/email';

const TestEmail = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const testOrderData = {
        customer_name: 'Test Customer',
        customer_email: testEmail,
        customer_phone: '+8801234567890',
        customer_address: 'Test Address, Dhaka',
        order_number: 'TEST-' + Date.now(),
        total_amount: 5000,
        payment_method: 'Cash on Delivery',
        items: [
          {
            product_name: 'Smart Switch',
            quantity: 2,
            price: 2500
          }
        ]
      };

      const success = await emailService.sendOrderConfirmation(testOrderData);
      
      if (success) {
        toast({
          title: "Test Email Sent",
          description: `Test order confirmation sent to ${testEmail}`
        });
      } else {
        toast({
          title: "Email Failed",
          description: "Failed to send test email. Check SMTP configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Test Email</h1>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Test Email Address</Label>
          <Input
            id="email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
          />
        </div>
        
        <Button onClick={sendTestEmail} disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Test Order Email'}
        </Button>
      </div>
    </div>
  );
};

export default TestEmail;
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Truck } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  paymentMethod: string;
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  totalPrice: number;
  onConfirmOrder: (orderData: OrderData) => void;
}

export function CheckoutModal({ open, onOpenChange, cart, totalPrice, onConfirmOrder }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onConfirmOrder({
        customer: formData,
        items: cart,
        total: totalPrice,
        paymentMethod
      });
      onOpenChange(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Order confirmation failed:', JSON.stringify(error, null, 2));
      // Show error message to user
      alert('Order failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Payment Method</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <input 
                  type="radio" 
                  id="cod" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                  <Truck className="w-4 h-4" />
                  Cash on Delivery
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <input 
                  type="radio" 
                  id="online" 
                  name="payment" 
                  value="online" 
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  Online Payment
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total: ৳{totalPrice.toLocaleString()}</span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { useSupabase } from "@/supabase";
import { quoteService } from "@/supabase/quotes";

interface SaveEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  totalPrice: number;
}

export function SaveEmailModal({ open, onOpenChange, cartItems, totalPrice }: SaveEmailModalProps) {
  const { executeQuery } = useSupabase();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [physicalVisit, setPhysicalVisit] = useState(false);
  const [needExpertHelp, setNeedExpertHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const quoteData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category
        })),
        total_amount: totalPrice,
        physical_visit_requested: physicalVisit,
        need_expert_help: needExpertHelp,
        status: 'saved'
      };
      
      await executeQuery(() => quoteService.createQuote(quoteData));
      
      toast({
        title: "Quote Saved Successfully",
        description: "Your quote has been saved to our database and will be emailed to you shortly.",
      });
      
      setFormData({ name: '', phone: '', email: '', address: '' });
      setPhysicalVisit(false);
      setNeedExpertHelp(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save quote:', error);
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save & Email Quote</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="save-name">Name *</Label>
            <Input
              id="save-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="save-phone">Phone *</Label>
            <Input
              id="save-phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="save-email">Email *</Label>
            <Input
              id="save-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="save-address">Address</Label>
            <Textarea
              id="save-address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expert-help"
                checked={needExpertHelp}
                onCheckedChange={setNeedExpertHelp}
              />
              <Label htmlFor="expert-help" className="text-sm">
                Need help from technical expert or key account manager
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="physical-visit"
                checked={physicalVisit}
                onCheckedChange={setPhysicalVisit}
              />
              <Label htmlFor="physical-visit" className="text-sm">
                Physical visit interest
              </Label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600 mb-4">
              <p>Items: {cartItems.length}</p>
              <p className="font-semibold">Total: ৳{totalPrice.toLocaleString()}</p>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
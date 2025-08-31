import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface InstallationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onAddToCart: (serviceItem: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    color: string;
    quantity: number;
  }) => void;
}

const installationServices = [
  {
    id: 'curtain-installation',
    name: 'Curtain Installation',
    description: 'Professional curtain installation service',
    price: 1500,
    image: '/assets/hero-roller-curtain.jpg'
  },
  {
    id: 'switch-installation',
    name: 'Smart Switch Installation',
    description: 'Expert smart switch installation',
    price: 800,
    image: '/images/smart_switch/one gang.webp'
  },
  {
    id: 'security-installation',
    name: 'Security System Installation',
    description: 'Complete security system setup',
    price: 2500,
    image: '/assets/gallery-2.jpg'
  },
  {
    id: 'film-installation',
    name: 'PDLC Film Installation',
    description: 'Professional smart film installation',
    price: 3000,
    image: '/assets/gallery-5.jpg'
  }
];

export function InstallationModal({ open, onOpenChange, onBack, onAddToCart }: InstallationModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAddToCart = () => {
    selectedServices.forEach(serviceId => {
      const service = installationServices.find(s => s.id === serviceId);
      if (service) {
        const cartItem = {
          id: service.id,
          name: service.name,
          price: service.price,
          category: 'Services',
          image: service.image,
          color: `৳${service.price}`,
          quantity: 1
        };
        onAddToCart(cartItem);
      }
    });
    onOpenChange(false);
    setSelectedServices([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  onOpenChange(false);
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <DialogTitle>Select Installation Services</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Choose the installation services you need:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {installationServices.map((service) => (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{service.name}</h4>
                      <Badge variant="default">
                        ৳{service.price}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedServices.length} service(s) selected
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToCart} 
              disabled={selectedServices.length === 0}
              className="border-2 border-black bg-black text-white hover:bg-gray-900 hover:border-gray-900 hover:shadow-lg transition-all duration-300"
            >
              Add to Cart ({selectedServices.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface ServicesModalProps {
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

const consultancyServices = [
  {
    id: 'smart-curtain-consultation',
    name: 'Smart Curtain Consultation',
    description: 'Expert advice on smart curtain solutions',
    price: 0,
    image: '/assets/hero-sliding-curtain.jpg'
  },
  {
    id: 'smart-switch-consultation',
    name: 'Smart Switch Consultation',
    description: 'Professional guidance on smart switch setup',
    price: 0,
    image: '/images/smart_switch/3 gang mechanical.webp'
  },
  {
    id: 'security-consultation',
    name: 'Security System Consultation',
    description: 'Security system planning and advice',
    price: 0,
    image: '/assets/gallery-1.jpg'
  },
  {
    id: 'film-consultation',
    name: 'PDLC Film Consultation',
    description: 'Smart film installation guidance',
    price: 0,
    image: '/assets/window.jpeg'
  },
  {
    id: 'smart-home-consultation',
    name: 'Smart Home Consultation',
    description: 'Complete smart home automation planning and advice',
    price: 0,
    image: '/images/services/services.png'
  },
  {
    id: 'warranty-support',
    name: 'Warranty Support',
    description: 'Extended warranty and support service',
    price: 0,
    image: '/assets/gallery-4.jpg'
  }
];

export function ServicesModal({ open, onOpenChange, onBack, onAddToCart }: ServicesModalProps) {
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
      const service = consultancyServices.find(s => s.id === serviceId);
      if (service) {
        const cartItem = {
          id: service.id,
          name: service.name,
          price: service.price,
          category: 'Services',
          image: service.image,
          color: service.price === 0 ? 'Free' : `৳${service.price}`,
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
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
            <DialogTitle className="text-sm sm:text-base">Consultancy & Installation Services</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">We don't just sell devices. We build solutions.</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Free Consultation</h4>
              <p className="text-sm text-blue-800">Book a SOHUB Smart Home expert.</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">On-Site Assessment</h4>
              <p className="text-sm text-green-800">Engineers visit and suggest the perfect setup.</p>
            </div>
            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Installation & Setup</h4>
              <p className="text-sm text-purple-800">Seamless, professional installation with full testing.</p>
            </div>
            <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">After-Sales Support</h4>
              <p className="text-sm text-orange-800">24/7 service, warranty, and remote troubleshooting.</p>
            </div>
          </div>
          

        </div>
        <div className="flex justify-center pt-4 border-t">
          <Button 
            onClick={() => {
              const cartItem = {
                id: 'free-consultation',
                name: 'Free Consultation',
                price: 0,
                category: 'Services',
                image: '/images/services/services.png',
                color: 'Free',
                quantity: 1
              };
              onAddToCart(cartItem);
              onOpenChange(false);
            }}
            className="border-2 border-black bg-black text-white hover:bg-gray-900 hover:border-gray-900 hover:shadow-lg transition-all duration-300 px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
          >
            Book a Free Consultation →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConsultancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (consultancyItem: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    color: string;
    quantity: number;
  }) => void;
}

export function ConsultancyModal({ open, onOpenChange, onAddToCart }: ConsultancyModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = ['Smart Curtain', 'Smart Switch', 'Security', 'Film'];

  const handleAddToCart = () => {
    if (selectedCategory) {
      const cartItem = {
        id: `consultancy-${selectedCategory.toLowerCase().replace(' ', '-')}`,
        name: `${selectedCategory} Consultancy`,
        price: 0,
        category: 'Services',
        image: '/assets/gallery-2.jpg',
        color: 'Free',
        quantity: 1
      };
      onAddToCart(cartItem);
      onOpenChange(false);
      setSelectedCategory('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Consultancy Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Choose the category you need consultancy for:</p>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  selectedCategory === category
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {category} Consultancy
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToCart} disabled={!selectedCategory}>
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
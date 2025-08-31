import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SmartSwitchCard } from '@/components/ui/SmartSwitchCard';

interface ProductListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  products: Array<{
    id: string;
    name: string;
    price: string;
    gangType?: string;
    isSoldOut?: boolean;
    imageUrl: string;
  }>;
  onProductClick: (productId: string) => void;
  onAddToCart: (product: any) => void;
}

export function ProductListModal({ open, onOpenChange, title, products, onProductClick, onAddToCart }: ProductListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {products.map((product, index) => (
            <SmartSwitchCard
              key={`${product.id}-${index}`}
              imageUrl={product.imageUrl}
              name={product.name}
              price={product.price}
              gangType={product.gangType}
              isSoldOut={product.isSoldOut}
              onClick={() => onProductClick(product.id)}
              onAdd={() => onAddToCart(product)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
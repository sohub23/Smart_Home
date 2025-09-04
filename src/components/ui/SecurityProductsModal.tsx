import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SecurityProductsModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAddToCart: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

const SECURITY_PRODUCTS = {
  panel: [
    { id: 'sp01', name: 'SP 01', price: 7490, image: '/images/sohub_protect/sp01.png' },
    { id: 'sp02', name: 'SP 02', price: 15990, image: '/images/sohub_protect/sp02.png' }
  ],
  sensors: [
    { id: 'sos-band', name: 'SOS Band', price: 3999, image: '/images/sohub_protect/accesories/B020-SOS-SOS-Band.png' },
    { id: 'doorbell', name: 'Doorbell Button', price: 4999, image: '/images/sohub_protect/accesories/doorbell-b100.png' },
    { id: 'signal-extender', name: 'Signal Extender', price: 3499, image: '/images/sohub_protect/accesories/EX010-Signal-extender.png' },
    { id: 'smoke-detector', name: 'Smoke Detector Fire Alarm Sensor', price: 3999, image: '/images/sohub_protect/accesories/smoke-detector.png' },
    { id: 'gas-detector', name: 'Gas detector', price: 4499, image: '/images/sohub_protect/accesories/GS020-Gas-Detector.png' },
    { id: 'wireless-siren', name: 'Wireless Siren', price: 4999, image: '/images/sohub_protect/accesories/WSR101-Wireless_siren.png' },
    { id: 'vibration-sensor', name: 'Vibration Sensor', price: 3299, image: '/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png' },
    { id: 'shutter-sensor', name: 'Shutter sensor', price: 2999, image: '/images/sohub_protect/accesories/shutter_sensor_ss010.png' },
    { id: 'motion-sensor', name: 'Motion Sensor', price: 2999, image: '/images/sohub_protect/accesories/Motion_pr200.png' },
    { id: 'door-sensor', name: 'Door Sensor', price: 2499, image: '/images/sohub_protect/accesories/door_Sensor_DS200.png' }
  ],
  camera: [
    { id: 'indoor-camera', name: 'Indoor AI Camera 2.4G/5G', price: 8999, image: '/images/sohub_protect/accesories/camera-c11.png' }
  ]
};

export function SecurityProductsModal({ open, onOpenChange, onAddToCart, addToCart }: SecurityProductsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('panel');
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);

  const updateQuantity = (productId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change)
    }));
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const selectedItems = Object.entries(quantities).filter(([_, qty]) => qty > 0);
      
      if (selectedItems.length === 0) {
        toast({
          title: "No items selected",
          description: "Please select at least one product to add to cart.",
          variant: "destructive"
        });
        return;
      }

      for (const [productId, qty] of selectedItems) {
        const allProducts = [...SECURITY_PRODUCTS.panel, ...SECURITY_PRODUCTS.sensors, ...SECURITY_PRODUCTS.camera];
        const product = allProducts.find(p => p.id === productId);
        
        if (product && addToCart) {
          addToCart({
            id: `security_${productId}_${Date.now()}`,
            name: product.name,
            price: product.price,
            category: 'Security System',
            image: product.image,
            quantity: qty
          });
        }
      }

      toast({
        title: "Added to Cart",
        description: `${selectedItems.length} security product(s) added to your cart.`,
      });
      
      onOpenChange(false);
      setQuantities({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProducts = (products: any[], categoryName: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{categoryName}:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-50 rounded-md mb-3 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/sohub_protect/default.png';
                }}
              />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">{product.name}</h4>
            <p className="text-lg font-bold text-gray-900 mb-3">{product.price.toLocaleString()} BDT</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  disabled={!quantities[product.id]}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                  {quantities[product.id] || 0}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [productId, qty]) => {
    const allProducts = [...SECURITY_PRODUCTS.panel, ...SECURITY_PRODUCTS.sensors, ...SECURITY_PRODUCTS.camera];
    const product = allProducts.find(p => p.id === productId);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[45] bg-black/60" />
      <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-hidden p-0 rounded-2xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Security Products</h1>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-4">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setSelectedCategory('panel')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'panel' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Panel Kit
            </button>
            <button
              onClick={() => setSelectedCategory('sensors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'sensors' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sensors
            </button>
            <button
              onClick={() => setSelectedCategory('camera')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'camera' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Camera
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedCategory === 'panel' && renderProducts(SECURITY_PRODUCTS.panel, 'Panel Kit')}
          {selectedCategory === 'sensors' && renderProducts(SECURITY_PRODUCTS.sensors, 'Sensors')}
          {selectedCategory === 'camera' && renderProducts(SECURITY_PRODUCTS.camera, 'Camera')}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{totalItems} item(s) selected</p>
                <p className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString()} BDT</p>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold"
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
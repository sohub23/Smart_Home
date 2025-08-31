import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface SohubProtectModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    detailed_description?: string;
    features?: string;
    specifications?: string;
    warranty?: string;
    installation_included?: boolean;
    image?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    stock: number;
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
}

export function SohubProtectModal({ open, onOpenChange, product, onAddToCart, onBuyNow }: SohubProtectModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);

  // Parse features and specifications
  const features = product.features ? product.features.split('\n').filter(f => f.trim()) : [];
  const specifications = product.specifications ? product.specifications.split('\n').filter(s => s.trim()) : [];
  const allImages = [product.image, product.image2, product.image3, product.image4, product.image5].filter(Boolean);

  // Installation charge for Sohub Protect products
  const installationCharge = 0;
  const totalWithInstallation = (product.price * quantity);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await onAddToCart({
        productId: product.id,
        quantity: quantity,
        installationCharge: installationCharge,
        totalPrice: totalWithInstallation
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Add to cart failed:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      await onBuyNow({
        productId: product.id,
        quantity: quantity,
        installationCharge: installationCharge
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Buy now failed:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[45] bg-black/50" />
      <DialogContent className="max-w-[1100px] h-[95vh] overflow-hidden p-0 rounded-3xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid md:grid-cols-[1fr,1fr] gap-8 p-4">

          {/* Left: Images */}
          <div className="flex gap-4 items-start">
            {/* Thumbnail Column */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 w-20 items-center">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0",
                      selectedImage === index ? "border-black" : "border-gray-200"
                    )}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/sohub_protect/accesories/camera-c11.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1">
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={allImages[selectedImage] || '/images/sohub_protect/accesories/camera-c11.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/sohub_protect/accesories/camera-c11.png';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-4">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Sohub Protect</span>
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary" className="text-xs">Low Stock</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price - Apple Style */}
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              BDT {totalWithInstallation.toLocaleString()}
              <span className="text-base font-normal text-gray-500 ml-2">Total</span>
            </div>

            {/* Specifications under price */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="specs" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                  Specifications
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Wireless connectivity (WiFi/Zigbee)
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      24/7 monitoring and alerts
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Mobile app control
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Easy installation and setup
                    </div>
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {spec}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Product Details Accordion */}
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              {/* Description */}
              {(product.description || product.detailed_description) && (
                <AccordionItem value="description" className="border rounded-lg px-4 mb-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 whitespace-pre-line pb-4">
                    {product.description && (
                      <p className="mb-3">{product.description}</p>
                    )}
                    {product.detailed_description && (
                      <div>{product.detailed_description}</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Features */}
              {features.length > 0 && (
                <AccordionItem value="features" className="border rounded-lg px-4 mt-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Features
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Specifications */}
              {specifications.length > 0 && (
                <AccordionItem value="specifications" className="border rounded-lg px-4 mt-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Specifications
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="text-sm text-gray-700 space-y-2">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          {spec}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Warranty and Manual in one row */}
            <div className="grid grid-cols-2 gap-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="warranty" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Warranty
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 pb-4">
                    {product.warranty || '1 Year'}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="manual" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Instruction Manual
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      <a 
                        href="/user_manual/Sohub_Protect_Brochure.pdf" 
                        target="_blank" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Manual
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Installation Service */}
            <div className="border-4 border-gray-800 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="installation"
                  checked={includeInstallation}
                  onChange={(e) => setIncludeInstallation(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label htmlFor="installation" className="text-base font-bold text-gray-900">
                  Installation and Setup (TBD)
                </label>
              </div>
              {includeInstallation && (
                <p className="text-sm text-gray-700 mt-3 font-semibold leading-relaxed">
                  <strong className="text-gray-900">Note:</strong> Our technical person will contact you for installation service.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t mt-6 -mx-6 px-6 py-6">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0}
                className="w-full h-12 font-semibold border-2 border-black bg-black text-white hover:bg-gray-900 hover:border-gray-900 hover:shadow-lg transition-all duration-300 shadow-md"
              >
                {loading ? 'ADDING...' : product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
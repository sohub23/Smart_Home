import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface RollerCurtainModalProps {
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

export function RollerCurtainModal({ open, onOpenChange, product, onAddToCart, onBuyNow }: RollerCurtainModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [trackSizes, setTrackSizes] = useState([0]);
  const [trackQuantities, setTrackQuantities] = useState([1]);
  const [loading, setLoading] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [connectionType, setConnectionType] = useState('zigbee');
  const [showInstallationSetup, setShowInstallationSetup] = useState(false);
  const [installationNotes, setInstallationNotes] = useState('');
  const [installationTBD, setInstallationTBD] = useState(false);

  const features = product.features ? product.features.split('\n').filter(f => f.trim()) : [];
  const specifications = product.specifications ? product.specifications.split('\n').filter(s => s.trim()) : [];
  const allImages = [product.image, product.image2, product.image3, product.image4, product.image5].filter(Boolean);

  const totalQuantity = trackQuantities.reduce((sum, qty) => sum + qty, 0);
  const smartCurtainInstallation = (includeInstallation && trackSizes.length > 0) ? totalQuantity * 3500 : 0;
  const totalWithInstallation = (product.price * totalQuantity) + smartCurtainInstallation;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const installationForThisRoller = includeInstallation ? trackQuantities[0] * 3500 : 0;
      const totalPriceForThisRoller = (product.price * trackQuantities[0]) + installationForThisRoller;
      
      const cartPayload = {
        productId: `${product.id}_${Date.now()}`,
        productName: product.name,
        quantity: trackQuantities[0],
        connectionType: connectionType,
        installationCharge: installationForThisRoller,
        totalPrice: totalPriceForThisRoller,
        unitPrice: product.price
      };
      
      await onAddToCart(cartPayload);
      
      toast({
        title: "Added to Cart",
        description: `${product.name} added to your cart.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[45] bg-black/50" />
      <DialogContent className="max-w-[1100px] max-h-[90vh] overflow-hidden p-0 rounded-3xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid md:grid-cols-[1fr,1fr] gap-8 p-8">
          {/* Back Button */}
          <div className="md:col-span-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-white hover:bg-gray-600 transition-all duration-300 px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Left: Images */}
          <div className="flex gap-4 items-start">
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
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
                        target.src = '/images/smart_switch/3 gang mechanical.webp';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex-1">
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={allImages[selectedImage] || '/images/smart_switch/3 gang mechanical.webp'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/smart_switch/3 gang mechanical.webp';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-hide">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Roller Curtain</span>
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary" className="text-xs">Low Stock</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {totalWithInstallation.toLocaleString()} BDT
              <span className="text-base font-normal text-gray-500 ml-2">Total</span>
            </div>

            {/* Product Details Accordion */}
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              {(product.description || product.detailed_description) && (
                <AccordionItem value="description" className="border rounded-lg px-4 mb-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 whitespace-pre-line pb-4">
                    {product.description && <p className="mb-3">{product.description}</p>}
                    {product.detailed_description && <div>{product.detailed_description}</div>}
                  </AccordionContent>
                </AccordionItem>
              )}

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

              <AccordionItem value="specifications" className="border rounded-lg px-4 mt-2">
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                  Specifications
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Maximum width: 120 inches (3 meters)
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Roller blind mechanism
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Compatible with smart home systems
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Includes motor and complete roller system
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
            
            {/* Warranty and Manual in one row */}
            <div className="grid grid-cols-2 gap-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="warranty" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Warranty
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 pb-4">
                    1 Year
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
                      <p className="text-sm text-gray-700">Download or view the instruction manual:</p>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <iframe
                          src="/pdfs/roller-curtain-manual.pdf"
                          width="100%"
                          height="300"
                          className="border rounded"
                          title="Roller Curtain Manual"
                        >
                          <p className="text-sm text-gray-600">
                            Your browser does not support PDFs. 
                            <a href="/pdfs/roller-curtain-manual.pdf" target="_blank" className="text-blue-600 hover:underline">
                              Download the PDF
                            </a>
                          </p>
                        </iframe>
                      </div>
                      <a 
                        href="/pdfs/roller-curtain-manual.pdf" 
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

            {/* Connection Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Connection Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    id="roller-zigbee" 
                    name="roller-connection" 
                    value="zigbee" 
                    checked={connectionType === 'zigbee'}
                    onChange={(e) => {
                      setConnectionType(e.target.value);
                      setTimeout(() => {
                        const trackSection = document.querySelector('.track-configuration-section');
                        if (trackSection) {
                          trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="roller-zigbee" className="text-sm font-medium cursor-pointer flex-1">
                    Zigbee
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    id="roller-wifi" 
                    name="roller-connection" 
                    value="wifi" 
                    checked={connectionType === 'wifi'}
                    onChange={(e) => {
                      setConnectionType(e.target.value);
                      setTimeout(() => {
                        const trackSection = document.querySelector('.track-configuration-section');
                        if (trackSection) {
                          trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="roller-wifi" className="text-sm font-medium cursor-pointer flex-1">
                    WiFi
                  </label>
                </div>
              </div>
              {connectionType === 'zigbee' && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Zigbee connection requires a Zigbee hub for operation.
                  </p>
                </div>
              )}
              
              {/* Important Note about Pipe Requirements */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> 32mm tube pipe needed. Pipe standard size is 8 feet. If size is larger than 8 feet, need 2 motors and two pipes.
                </p>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.max(1, newQuantities[0] - 1);
                      setTrackQuantities(newQuantities);
                    }}
                    className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                    {trackQuantities[0] || 1}
                  </span>
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.min(10, (newQuantities[0] || 1) + 1);
                      setTrackQuantities(newQuantities);
                    }}
                    className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="border-4 border-gray-800 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="roller-installation-service"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label htmlFor="roller-installation-service" className="text-base font-bold text-gray-900">
                    Installation and Setup (TBD)
                  </label>
                </div>
                {includeInstallation && (
                  <p className="text-sm text-gray-700 mt-3 font-semibold leading-relaxed">
                    <strong className="text-gray-900">Note:</strong> Our technical person will contact you for installation service.
                  </p>
                )}
              </div>
            </div>





            {/* Actions */}
            <div className="space-y-4 pt-6 sticky bottom-0 bg-white border-t mt-6 -mx-6 px-6 py-6">
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
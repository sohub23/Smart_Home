import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface SliderCurtainModalProps {
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

export function SliderCurtainModal({ open, onOpenChange, product, onAddToCart, onBuyNow }: SliderCurtainModalProps) {
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
  const smartCurtainInstallation = 0;
  const totalWithInstallation = (product.price * totalQuantity);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Add each track configuration as separate cart item
      const validTracks = trackSizes.filter((size, i) => size > 0 && trackQuantities[i] > 0);
      
      for (let i = 0; i < trackSizes.length; i++) {
        if (trackSizes[i] > 0 && trackQuantities[i] > 0) {
          const installationForThisTrack = 0;
          const totalPriceForThisTrack = (product.price * trackQuantities[i]);
          
          const cartPayload = {
            productId: `${product.id}_${trackSizes[i]}ft_${Date.now()}_${i}`,
            productName: `${product.name} (${trackSizes[i]} feet)`,
            quantity: trackQuantities[i],
            trackSize: trackSizes[i],
            connectionType: connectionType,
            installationCharge: installationForThisTrack,
            totalPrice: totalPriceForThisTrack,
            unitPrice: product.price
          };
          
          await onAddToCart(cartPayload);
          // Small delay to ensure each item is processed
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      toast({
        title: "Added to Cart",
        description: `${validTracks.length} track configuration(s) added to your cart.`,
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
      <DialogContent className="max-w-[1100px] max-h-[95vh] overflow-hidden p-0 rounded-3xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid md:grid-cols-[1fr,1fr] gap-6 p-4">


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
          <div className="space-y-4 overflow-y-auto overflow-x-hidden max-h-[calc(95vh-150px)] scrollbar-hide">
            <div className="flex items-center gap-2 mb-1">
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary" className="text-xs">Low Stock</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-0">
              {product.name}
            </h1>
            <p className="text-xs text-gray-600 mb-1">
              App control
            </p>

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
                      Maximum track length: 326 inches (8.3 meters)
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Sliding curtain mechanism
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Compatible with smart home systems
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Includes motor and complete track system
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
            
            <Accordion type="multiple" defaultValue={[]} className="w-full">
            </Accordion>

            {/* Connection Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Connection Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    id="zigbee" 
                    name="connection" 
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
                  <label htmlFor="zigbee" className="text-sm font-medium cursor-pointer flex-1">
                    Zigbee
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    id="wifi" 
                    name="connection" 
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
                  <label htmlFor="wifi" className="text-sm font-medium cursor-pointer flex-1">
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
            </div>

            {/* Track Configuration */}
            <div className="space-y-4 track-configuration-section">
              {trackSizes.map((size, index) => (
                <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Track {index + 1}</h4>
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newSizes = trackSizes.filter((_, i) => i !== index);
                          const newQuantities = trackQuantities.filter((_, i) => i !== index);
                          setTrackSizes(newSizes);
                          setTrackQuantities(newQuantities);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Track Length (feet)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="27"
                        step="0.5"
                        value={size || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const newSizes = [...trackSizes];
                          newSizes[index] = value > 27 ? 27 : value;
                          setTrackSizes(newSizes);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter track length in feet (max 27)"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newQuantities = [...trackQuantities];
                            newQuantities[index] = Math.max(1, newQuantities[index] - 1);
                            setTrackQuantities(newQuantities);
                          }}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {trackQuantities[index] || 1}
                        </span>
                        <button
                          onClick={() => {
                            const newQuantities = [...trackQuantities];
                            newQuantities[index] = Math.min(10, (newQuantities[index] || 1) + 1);
                            setTrackQuantities(newQuantities);
                          }}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => {
                  setTrackSizes([...trackSizes, 0]);
                  setTrackQuantities([...trackQuantities, 1]);
                }}
                className="w-full h-10 font-medium border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Track
              </Button>
              
              <div className="border-4 border-gray-800 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="installation-service"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label htmlFor="installation-service" className="text-base font-bold text-gray-900">
                    Installation and Setup (TBD)
                  </label>
                </div>
                {includeInstallation && (
                  <p className="text-sm text-gray-700 mt-3 font-semibold leading-relaxed">
                    <strong className="text-gray-900">Note:</strong> Our technical person will contact you for installation service.
                  </p>
                )}
              </div>
              
              {showInstallationSetup && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                  <p className="text-sm text-blue-800 font-medium">
                    আপনি কি installation service নিতে চান? তাহলে আমাদের team আপনার সাথে কথা বলে installation service সম্পর্কে জানাবে।
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-blue-700 mb-2 block">
                        আপনার মন্তব্য বা বিশেষ প্রয়োজন:
                      </label>
                      <textarea
                        value={installationNotes}
                        onChange={(e) => setInstallationNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="আপনার installation সম্পর্কে কোন বিশেষ প্রয়োজন বা মন্তব্য থাকলে এখানে লিখুন..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="installation-tbd"
                        checked={installationTBD}
                        onChange={(e) => setInstallationTBD(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="installation-tbd" className="text-sm font-medium text-blue-700">
                        TBD (To Be Decided) - পরে ঠিক করব
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>





            {/* Actions */}
            <div className="space-y-4 pt-6 sticky bottom-0 bg-white border-t mt-6 -mx-6 px-6 py-6">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0 || trackSizes[0] === 0}
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
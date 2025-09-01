import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
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
  addToCart?: (item: any) => void;
}

export function RollerCurtainModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: RollerCurtainModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [trackSizes, setTrackSizes] = useState([0]);
  const [trackQuantities, setTrackQuantities] = useState([1]);
  const [loading, setLoading] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [connectionType, setConnectionType] = useState('zigbee');
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Reset to default when modal opens
  useEffect(() => {
    if (open) {
      setConnectionType('zigbee');
    }
  }, [open]);
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
      const installationForThisRoller = 0;
      const totalPriceForThisRoller = (product.price * trackQuantities[0]);
      
      const cartPayload = {
        productId: `${product.id}_${Date.now()}`,
        productName: `${product.name} (${connectionType.toUpperCase()})`,
        quantity: trackQuantities[0],
        trackSize: 8, // Default size for roller curtain
        connectionType: connectionType,
        installationCharge: installationForThisRoller,
        totalPrice: connectionType === 'wifi' ? totalPriceForThisRoller + 2000 : totalPriceForThisRoller,
        unitPrice: product.price
      };
      
      await onAddToCart(cartPayload);
      
      // Add installation service if selected
      if (installationSelected && addToCart) {
        addToCart({
          id: `${product.id}_installation`,
          name: 'Installation and setup',
          price: 0,
          category: 'Installation Service',
          image: '/images/sohub_protect/installation-icon.png',
          color: 'Service',
          quantity: 1
        });
      }
      
      // Force cart update
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }, 100);
      
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
      <div className="fixed inset-0 z-[45] bg-black/60" />
      <DialogContent className="max-w-[1200px] max-h-[95vh] overflow-hidden p-0 rounded-2xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid lg:grid-cols-2 gap-0">

          {/* Left: Hero Image Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col">
            {/* Main Product Image */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full max-w-lg aspect-square">
                <img
                  src={allImages[selectedImage] || '/images/smart_switch/3 gang mechanical.webp'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/smart_switch/3 gang mechanical.webp';
                  }}
                />
              </div>
            </div>
            
            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1)}
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                
                <div className="flex gap-3">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200",
                        selectedImage === index ? "ring-2 ring-orange-500" : "opacity-70 hover:opacity-100"
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
                
                <button
                  onClick={() => setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0)}
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Product Purchase Panel */}
          <div className="p-8 overflow-y-auto max-h-[95vh] bg-white">
            {/* Top Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {(connectionType === 'wifi' ? totalWithInstallation + 2000 : totalWithInstallation).toLocaleString()} BDT
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {Math.round((connectionType === 'wifi' ? totalWithInstallation + 2000 : totalWithInstallation) * 1.3).toLocaleString()} BDT
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    Save {Math.round((connectionType === 'wifi' ? totalWithInstallation + 2000 : totalWithInstallation) * 0.3).toLocaleString()} BDT
                  </span>
                </div>

              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Tab Section */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  <button 
                    onClick={() => setActiveTab('benefits')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'benefits' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('bestfor')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'bestfor' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Technical Details
                  </button>
                  <button 
                    onClick={() => setActiveTab('bonuses')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'bonuses' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Warranty
                  </button>
                </div>
              </div>
              <div className="pt-4">
                {activeTab === 'benefits' && (
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Smart motorized roller curtain with app control and voice command integration
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Automated scheduling and remote operation for enhanced privacy and comfort
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Energy-efficient design with quiet operation and premium fabric options
                    </li>
                  </ul>
                )}
                {activeTab === 'bestfor' && (
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      DC 12V brushless motor with max load 15kg and noise level below 35dB
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Zigbee 3.0/WiFi connectivity with 30m range and voice control support
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      32mm tube diameter, max 3m width/drop with AC power and battery backup
                    </li>
                  </ul>
                )}
                {activeTab === 'bonuses' && (
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      1 Year Service Warranty
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Upgrade Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Model</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  connectionType === 'zigbee' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setConnectionType('zigbee')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">Original Zigbee</div>
                    <div className="text-sm text-gray-600">(This item)</div>
                  </div>
                  <div className="text-sm text-gray-600">Smart control + Hub required</div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  connectionType === 'wifi' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setConnectionType('wifi')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">Original WiFi</div>
                    <div className="text-sm text-orange-600 font-medium">+2,000 BDT</div>
                  </div>
                  <div className="text-sm text-gray-600">Smart control + Direct connection</div>
                </div>
              </div>
            </div>



            {/* Options Section */}
            <div className="mb-6">
              {/* Size Dropdown */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pick your size
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900">
                  <option>Standard (up to 8 feet)</option>
                  <option>Large (8-12 feet) - Requires 2 motors</option>
                  <option>Extra Large (12+ feet) - Custom quote</option>
                </select>
              </div>
              
              {/* Cover Options */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Installation and setup
                </label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="installation-service" 
                      name="installation" 
                      checked={installationSelected}
                      onChange={(e) => setInstallationSelected(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500 mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="installation-service" className="font-medium text-gray-900 cursor-pointer">
                        Professional Installation Service (TBD)
                      </label>
                      <p className="text-sm text-gray-600 mt-1">Our team will contact you for installation services. <span className="text-xs">(To Be Determined)</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div 
                    onClick={() => setHelpModalOpen(true)}
                    className="flex items-center gap-2 text-sm text-orange-600 cursor-pointer hover:text-orange-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Need help deciding?</span>
                  </div>
                </div>
              </div>
            </div>


            


            {/* Quantity Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.max(1, newQuantities[0] - 1);
                      setTrackQuantities(newQuantities);
                    }}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                    {trackQuantities[0] || 1}
                  </span>
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.min(10, (newQuantities[0] || 1) + 1);
                      setTrackQuantities(newQuantities);
                    }}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>





            {/* Collapsed Details */}
            <details className="mb-20">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                View full specifications
              </summary>
              <div className="mt-3 text-sm text-gray-700 space-y-2">
                <p><strong>Specifications:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maximum width: 120 inches (3 meters)</li>
                  <li>32mm tube pipe required</li>
                  <li>Complete motor & roller system included</li>
                  <li>Smart home compatible</li>
                  <li>1-year warranty</li>
                </ul>
              </div>
            </details>
          </div>
          
          {/* Fixed Bottom CTA - Right Side Only */}
          <div className="fixed bottom-0 right-0 w-[600px] bg-white border-t border-l border-gray-200 p-4 z-[60] shadow-lg">
            <Button
              onClick={handleAddToCart}
              disabled={loading || product.stock === 0}
              className="w-full h-12 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wide"
            >
              {loading ? 'Adding to cart...' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>
            
            {/* Stock Status */}
            {product.stock <= 3 && product.stock > 0 && (
              <p className="text-center text-sm text-orange-600 font-medium mt-2">
                Only {product.stock} left in stock - order soon!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-lg p-0 rounded-2xl bg-white shadow-2xl border-0">
          {/* Close Button */}
          <button 
            onClick={() => setHelpModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Product Image */}
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl flex items-center justify-center">
            <img
              src={allImages[0] || '/images/smart_switch/3 gang mechanical.webp'}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/smart_switch/3 gang mechanical.webp';
              }}
            />
          </div>
          
          <div className="p-6">
            {/* Headline */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Need help deciding? We've got you covered</h2>
            </div>
            
            {/* Options */}
            <div className="space-y-6">
              {/* Option 1 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Standard Installation (+0 BDT)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Basic setup with motor installation and app configuration. Perfect for standard windows up to 8 feet wide. Includes mounting hardware and basic smart home integration.
                </p>
              </div>
              
              {/* Option 2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Premium Installation (+2,500 BDT)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Complete professional service with custom measurements, advanced mounting solutions, and full smart home ecosystem integration. Includes 1-year service warranty and priority support.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
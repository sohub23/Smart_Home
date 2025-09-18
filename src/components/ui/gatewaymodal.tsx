import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

import { EngravingTrigger } from '@/components/ui/EngravingTrigger';
import { EngravingModal } from '@/components/ui/EngravingModal';

interface GatewayModalProps {
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
    engraving_available?: boolean;
    engraving_price?: number;
    engraving_image?: string;
    engraving_text_color?: string;
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

// Static gateway product data
const gatewayProduct = {
  id: 'gateway-m6-hub',
  title: 'M6 Smart Gateway Hub',
  display_name: 'M6 Smart Gateway Hub',
  name: 'M6 Smart Gateway Hub',
  price: 8500,
  discount_price: 8500,
  image: '/assets/Hub/hub1.jpg',
  image2: '/assets/Hub/hub2.jpg',
  image3: '/assets/Hub/hub3.jpg',
  image4: '/assets/Hub/hub4.jpg',
  image5: '/assets/Hub/hub5.jpg',
  additional_images: JSON.stringify([
    '/assets/Hub/hub6.jpg'
  ]),
  overview: 'Central smart home gateway hub for seamless device connectivity and automation control\nSupports multiple wireless protocols including Zigbee, WiFi, and Bluetooth for comprehensive smart home integration\nAdvanced processing power with cloud connectivity for remote monitoring and control of all connected devices',
  technical_details: 'Wireless Protocols: Zigbee 3.0, WiFi 802.11 b/g/n, Bluetooth 5.0\nProcessor: ARM Cortex-A7 Quad-core, RAM: 1GB DDR3, Storage: 8GB eMMC\nConnectivity: Ethernet port, USB 2.0, Operating Temperature: 0°C to +40°C, Power: 12V DC adapter',
  warranty: '2 Year Manufacturer Warranty',
  variants: JSON.stringify([
    { name: 'Standard', price: 8500, discount_price: 8500, stock: 25, image: '/assets/Hub/hub1.jpg' },
    { name: 'Pro', price: 12500, discount_price: 12500, stock: 15, image: '/assets/Hub/hub2.jpg' },
    { name: 'Enterprise', price: 18500, discount_price: 18500, stock: 8, image: '/assets/Hub/hub3.jpg' }
  ]),
  help_text: 'The M6 Smart Gateway Hub is the central control unit for your smart home ecosystem. It connects and manages all your smart devices through multiple wireless protocols.',
  help_image_url: '/assets/Hub/hub1.jpg',
  engraving_available: false,
  stock: 25
};

export function GatewayModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: GatewayModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingModalOpen, setEngravingModalOpen] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(gatewayProduct);
  const [selectedGang, setSelectedGang] = useState('');
  const [hasSelectedGang, setHasSelectedGang] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedImage(0);
      // Use database product data if available, otherwise fallback to static data
      setSelectedProduct(product.name ? product : gatewayProduct);
      setHasSelectedGang(false);
      setSelectedGang('');
    }
  }, [open, product]);

  const currentProductData = selectedProduct || product;
  
  const getCurrentStock = () => {
    // For gateway products, always return a positive stock value
    if (currentProductData?.id === 'gateway-m6-hub' || currentProductData?.name?.toLowerCase().includes('gateway') || currentProductData?.name?.toLowerCase().includes('hub')) {
      return 25; // Default stock for gateway products
    }
    
    if (!currentProductData) return 0;
    
    let variants = currentProductData.variants;
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        variants = [];
      }
    }
    
    if (variants && variants.length > 0) {
      const firstVariant = variants[0];
      return firstVariant.stock || 0;
    }
    
    return currentProductData.stock || product.stock || 0;
  };
  
  const currentStock = getCurrentStock();
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  
  // Get all available images from current product (similar to other modals)
  const getProductImages = (productData) => {
    if (!productData) return [];
    
    // For gateway products, always use all Hub images
    if (productData.id === 'gateway-m6-hub' || productData.name?.toLowerCase().includes('gateway') || productData.name?.toLowerCase().includes('hub')) {
      return [
        '/assets/Hub/hub1.jpg',
        '/assets/Hub/hub2.jpg',
        '/assets/Hub/hub3.jpg',
        '/assets/Hub/hub4.jpg',
        '/assets/Hub/hub5.jpg',
        '/assets/Hub/hub6.jpg'
      ];
    }
    
    const images = [productData.image, productData.image2, productData.image3, productData.image4, productData.image5].filter(Boolean);
    
    // Add additional images if they exist
    if (productData.additional_images) {
      try {
        const additionalImages = typeof productData.additional_images === 'string' 
          ? JSON.parse(productData.additional_images) 
          : productData.additional_images;
        if (Array.isArray(additionalImages)) {
          images.push(...additionalImages.filter(Boolean));
        }
      } catch (e) {
        console.log('Failed to parse additional images:', e);
      }
    }
    
    return images;
  };
  
  const allImages = getProductImages(currentProductData);

  const getCurrentPrice = () => {
    if (!currentProductData) return 0;
    
    let variants = currentProductData.variants;
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        variants = [];
      }
    }
    
    if (variants && variants.length > 0) {
      const selectedVariant = selectedGang ? variants.find(v => v.name === selectedGang) : variants[0];
      const variant = selectedVariant || variants[0];
      return variant.discount_price && variant.discount_price > 0 
        ? variant.discount_price 
        : variant.price || 0;
    }
    
    return currentProductData.price || 0;
  };
  
  const currentPrice = getCurrentPrice();
  const engravingPrice = engravingText ? (currentProductData.engraving_price || 200) * quantity : 0;
  const totalPrice = (currentPrice * quantity) + engravingPrice;

  const handleAddToCart = async () => {
    
    setLoading(true);
    try {
      const unitPrice = currentPrice + (engravingText ? (currentProductData.engraving_price || 200) : 0);
      const cartPayload = {
        id: `${currentProductData.id || product.id}_${Date.now()}`,
        name: `${currentProductData?.title || currentProductData?.name || product.name}`,
        price: unitPrice,
        category: product.category,
        image: currentProductData?.image || '',
        quantity: quantity,
        selectedVariation: selectedGang,
        gang: selectedGang,
        engravingText: engravingText,
        totalPrice: totalPrice
      };
      
      if (addToCart) {
        addToCart(cartPayload);
      } else {
        await onAddToCart(cartPayload);
      }
      
      // Add installation service if selected
      if (installationSelected && addToCart) {
        addToCart({
          id: `${product.id}_installation`,
          name: 'Installation and setup',
          price: 0,
          category: 'Installation Service',
          image: currentProductData?.image || allImages[selectedImage] || '/images/sohub_protect/installation-icon.png',
          color: 'Service',
          quantity: 1,
          selectedImages: allImages,
          selectedGang: selectedGang,
          productName: currentProductData?.title || currentProductData?.name || product.name
        });
      }
      
      // Force cart update
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }, 100);
      
      toast({
        title: "Added to Bag",
        description: `${product.name} added to your bag.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Add to cart failed:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to add item to bag. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[45] bg-black/60" />
      <DialogContent className="max-w-[1200px] max-h-[85vh] w-[95vw] overflow-hidden p-0 rounded-2xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="overflow-y-auto max-h-[85vh] lg:overflow-hidden lg:grid lg:grid-cols-2 lg:h-[85vh]">
          <div className="flex flex-col lg:contents gap-0">

            {/* Left: Hero Image Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 flex flex-col h-64 lg:h-full lg:max-h-[85vh]">
              {/* Main Product Image */}
              <div className="flex-1 flex items-center justify-center relative lg:min-h-0">
                <div className="w-full h-48 lg:h-auto lg:max-w-lg lg:max-h-[60vh] lg:aspect-square">
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[selectedImage]}
                      alt={currentProductData.name || product.name}
                      className="w-full h-full object-contain lg:object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>
                
                {/* Mobile Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1)}
                      className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0)}
                      className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop Thumbnails */}
              {allImages.length > 1 && (
                <div className="hidden lg:flex items-center gap-3 justify-center mt-6">
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
                        onMouseEnter={() => setSelectedImage(index)}
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200",
                          selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} ${index + 1}`} 
                          className="w-full h-full object-cover"
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
            <div className="p-4 lg:p-8 bg-white lg:overflow-y-auto lg:max-h-[85vh]">
            {/* Top Section */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-5 leading-tight tracking-tight">
                {product.name || currentProductData.title || currentProductData.name || 'M6 Hub'}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
                    {!hasSelectedGang ? 'Starting From ' : ''}{(hasSelectedGang ? totalPrice : (product.price || currentPrice)).toLocaleString()} BDT
                  </span>
                  {(() => {
                    // Check if variants exist and parse them
                    let variants = currentProductData?.variants;
                    if (typeof variants === 'string') {
                      try {
                        variants = JSON.parse(variants);
                      } catch (e) {
                        variants = [];
                      }
                    }
                    
                    // Get first variant for discount calculation
                    const firstVariant = variants && variants.length > 0 ? variants[0] : null;
                    
                    if (firstVariant && firstVariant.discount_price > 0 && firstVariant.discount_price < firstVariant.price) {
                      const originalTotal = (firstVariant.price * quantity) + engravingPrice;
                      const savings = (firstVariant.price - firstVariant.discount_price) * quantity;
                      
                      return (
                        <>
                          <span className="text-xs text-gray-500 line-through">
                            {originalTotal.toLocaleString()} BDT
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            Save {savings.toLocaleString()} BDT
                          </span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
                {(currentProductData.engraving_available || product.engraving_available) && (currentProductData.engraving_price || product.engraving_price) && (
                  <p className="text-sm text-gray-600">+{currentProductData.engraving_price || product.engraving_price} BDT for customization</p>
                )}
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-gray-800 text-base font-medium mb-6">
                <Truck className="w-5 h-5 text-gray-700" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="mb-4">
              <Accordion type="single" collapsible className="w-full border-t border-b border-gray-200">
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-left text-lg font-bold text-gray-900 no-underline hover:no-underline py-2">Product Description</AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="border-b border-gray-200">
                      <div className="flex space-x-8">
                        <button 
                          onClick={() => setActiveTab('benefits')}
                          className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === 'benefits' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          Overview
                        </button>
                        <button 
                          onClick={() => setActiveTab('bestfor')}
                          className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === 'bestfor' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          Technical Details
                        </button>
                        <button 
                          onClick={() => setActiveTab('bonuses')}
                          className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === 'bonuses' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          Warranty
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      {activeTab === 'benefits' && (
                        <div className="text-sm text-gray-500">
                          {(currentProductData?.overview || currentProductData?.description) ? (
                            <ul className="space-y-2">
                              {(currentProductData.overview || currentProductData.description).split('\n').filter(item => item.trim()).map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {item.trim()}
                                </li>
                              ))}
                            </ul>
                          ) : features.length > 0 ? (
                            <ul className="space-y-2">
                              {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Central smart home gateway hub for seamless device connectivity and automation control
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Supports multiple wireless protocols including Zigbee, WiFi, and Bluetooth for comprehensive smart home integration
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Advanced processing power with cloud connectivity for remote monitoring and control of all connected devices
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          {currentProductData?.technical_details ? (
                            <ul className="space-y-2">
                              {currentProductData.technical_details.split('\n').filter(item => item.trim()).map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {item.trim()}
                                </li>
                              ))}
                            </ul>
                          ) : specifications.length > 0 ? (
                            <ul className="space-y-2">
                              {specifications.map((spec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {spec}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Wireless Protocols: Zigbee 3.0, WiFi 802.11 b/g/n, Bluetooth 5.0
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Processor: ARM Cortex-A7 Quad-core, RAM: 1GB DDR3, Storage: 8GB eMMC
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Connectivity: Ethernet port, USB 2.0, Operating Temperature: 0°C to +40°C, Power: 12V DC adapter
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                      {activeTab === 'bonuses' && (
                        <div className="text-sm text-gray-500">
                          {currentProductData?.warranty ? (
                            <div className="text-sm text-gray-500">
                              {currentProductData.warranty.split('\n').filter(w => w.trim()).map((warrantyItem, index) => (
                                <div key={index} className="flex items-start gap-2 mb-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-1.5 flex-shrink-0 opacity-80"></span>
                                  <span dangerouslySetInnerHTML={{ __html: warrantyItem.trim() }} />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                {product.warranty || '2 Year Manufacturer Warranty'}
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>





            {/* Quantity Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Installation and setup */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Installation and setup</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="installation-service" 
                    name="installation" 
                    checked={installationSelected}
                    onChange={(e) => setInstallationSelected(e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="installation-service" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Professional Installation Service (TBD)
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Our team will contact you for installation services. <span className="text-xs">(To Be Determined)</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div 
                  onClick={() => setHelpModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Need help deciding?</span>
                </div>
              </div>
            </div>

            <div className="mb-20 lg:mb-16"></div>
            </div>
          </div>
          
          {/* Fixed Bottom CTA - Right Side Only */}
          <div className="fixed bottom-0 left-0 right-0 lg:right-0 lg:left-auto lg:w-[600px] bg-white border-t lg:border-l border-gray-200 p-3 lg:p-4 z-[60] shadow-lg">
            <Button
              onClick={handleAddToCart}
              disabled={loading || currentStock === 0}
              className="w-full h-10 lg:h-12 text-sm lg:text-base font-bold text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wide"
              style={{ backgroundColor: '#7e8898' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Adding to bag...
                </span>
              ) : currentStock === 0 ? 'Out of stock' : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Add to bag
                </span>
              )}
            </Button>
            
            {/* Stock Status */}
            {currentStock <= 3 && currentStock > 0 && (
              <p className="text-center text-sm text-black font-medium mt-2">
                Only {currentStock} left in stock - order soon!
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
          
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
            
            <div className="border-b border-gray-200 mb-4">
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                    activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('technical')}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                    activeTab === 'technical' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Technical Details
                </button>
                <button 
                  onClick={() => setActiveTab('warranty')}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                    activeTab === 'warranty' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Warranty
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 leading-relaxed">
              {activeTab === 'overview' && (
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Central smart home gateway hub for seamless device connectivity and automation control
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Supports multiple wireless protocols including Zigbee, WiFi, and Bluetooth for comprehensive smart home integration
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Advanced processing power with cloud connectivity for remote monitoring and control of all connected devices
                  </li>
                </ul>
              )}
              {activeTab === 'technical' && (
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Wireless Protocols: Zigbee 3.0, WiFi 802.11 b/g/n, Bluetooth 5.0
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Processor: ARM Cortex-A7 Quad-core, RAM: 1GB DDR3, Storage: 8GB eMMC
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Connectivity: Ethernet port, USB 2.0, Operating Temperature: 0°C to +40°C, Power: 12V DC adapter
                  </li>
                </ul>
              )}
              {activeTab === 'warranty' && (
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    1 Year Service Warranty
                  </li>
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Engraving Modal */}
      {engravingModalOpen && (
        <>
          <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" />
          <EngravingModal
            open={engravingModalOpen}
            onOpenChange={setEngravingModalOpen}
            productImage={allImages[selectedImage] || currentProductData.image || product.image || ''}
            engravingImage={currentProductData.engraving_image || product.engraving_image || '/assets/Touch_DIY/engreving.png'}
            productName={currentProductData.name || product.name}
            engravingTextColor={currentProductData.engraving_text_color || product.engraving_text_color}
            initialText={engravingText}
            currentQuantity={quantity}
            onSave={({ text }) => {
              setEngravingText(text);
              // Force re-render to update price calculation
            }}
          />
        </>
      )}
    </Dialog>
  );
}
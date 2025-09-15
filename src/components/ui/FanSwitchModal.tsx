import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { EngravingTrigger } from '@/components/ui/EngravingTrigger';
import { EngravingModal } from '@/components/ui/EngravingModal';

// Static fan switch products data
const fanSwitchProducts = [
  {
    id: '1-gang-fan',
    title: '1 Gang Fan Switch (Touch)',
    display_name: '1 Gang Fan Switch (Touch)',
    name: '1 Gang Fan Switch (Touch)',
    price: 3500,
    discount_price: 3200,
    image: '/assets/Fan_switch/touch/touch1.png',
    additional_images: JSON.stringify([
      '/assets/Fan_switch/touch/touch2.png',
      '/assets/Fan_switch/touch/touch3.png',
      '/assets/Fan_switch/touch/touch4.png',
      '/assets/Fan_switch/touch/touch5.png',
      '/assets/Fan_switch/touch/touch6.png'
    ]),
    overview: 'Variable speed fan controller with smart controls and energy-efficient operation. Perfect for ceiling fans and ventilation systems.',
    technical_details: 'AC 100-240V input, Variable speed control, Standard electrical box mounting, High-quality plastic housing',
    warranty: '2 Year Manufacturer Warranty\nFree replacement for defects\n24/7 customer support',
    variants: JSON.stringify([
      { name: 'White', price: 3500, discount_price: 3200, color: 'White' },
      { name: 'Gold', price: 3800, discount_price: 3500, color: 'Gold' },
      { name: 'Black', price: 3600, discount_price: 3300, color: 'Black' }
    ]),
    help_text: 'Perfect for single fan control with variable speed',
    help_image_url: '/assets/Fan_switch/touch/touch1.png',
    engraving_available: true,
    engraving_price: 200
  },
  {
    id: '2-gang-fan',
    title: '2 Gang Fan Speed Controller',
    display_name: '2 Gang Fan Speed Controller', 
    name: '2 Gang Fan Speed Controller',
    price: 4200,
    discount_price: 3900,
    image: '/assets/Fan_switch/touch/touch1.png',
    additional_images: JSON.stringify([
      '/assets/Fan_switch/touch/touch2.png',
      '/assets/Fan_switch/touch/touch3.png',
      '/assets/Fan_switch/touch/touch4.png',
      '/assets/Fan_switch/touch/touch5.png',
      '/assets/Fan_switch/touch/touch6.png'
    ]),
    overview: 'Dual fan controller for independent speed control of two fans or fan with light combination.',
    technical_details: 'AC 100-240V input, Dual variable speed control, Standard electrical box mounting, High-quality plastic housing',
    warranty: '2 Year Manufacturer Warranty\nFree replacement for defects\n24/7 customer support',
    variants: JSON.stringify([
      { name: 'White', price: 4200, discount_price: 3900, color: 'White' },
      { name: 'Gold', price: 4500, discount_price: 4200, color: 'Gold' },
      { name: 'Black', price: 4300, discount_price: 4000, color: 'Black' }
    ]),
    help_text: 'Control two fans independently or fan with light',
    help_image_url: '/assets/Fan_switch/touch/touch1.png',
    engraving_available: true,
    engraving_price: 200
  },
  {
    id: '3-gang-fan',
    title: '3 Gang Fan Speed Controller',
    display_name: '3 Gang Fan Speed Controller',
    name: '3 Gang Fan Speed Controller', 
    price: 4800,
    discount_price: 4500,
    image: '/assets/Fan_switch/touch/touch1.png',
    additional_images: JSON.stringify([
      '/assets/Fan_switch/touch/touch2.png',
      '/assets/Fan_switch/touch/touch3.png',
      '/assets/Fan_switch/touch/touch4.png',
      '/assets/Fan_switch/touch/touch5.png',
      '/assets/Fan_switch/touch/touch6.png'
    ]),
    overview: 'Triple fan controller for comprehensive control of multiple fans and lighting combinations.',
    technical_details: 'AC 100-240V input, Triple variable speed control, Standard electrical box mounting, High-quality plastic housing',
    warranty: '2 Year Manufacturer Warranty\nFree replacement for defects\n24/7 customer support',
    variants: JSON.stringify([
      { name: 'White', price: 4800, discount_price: 4500, color: 'White' },
      { name: 'Gold', price: 5100, discount_price: 4800, color: 'Gold' },
      { name: 'Black', price: 4900, discount_price: 4600, color: 'Black' }
    ]),
    help_text: 'Control three fans independently with advanced features',
    help_image_url: '/assets/Fan_switch/touch/touch1.png',
    engraving_available: true,
    engraving_price: 200
  }
];

interface FanSwitchModalProps {
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

export function FanSwitchModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: FanSwitchModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingModalOpen, setEngravingModalOpen] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(fanSwitchProducts[0]);
  const [selectedColor, setSelectedColor] = useState('White');
  const [selectedGang, setSelectedGang] = useState('one');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedGangImage, setSelectedGangImage] = useState('');
  const [selectedGangTitle, setSelectedGangTitle] = useState('');

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedImage(0);
      setSelectedProduct(fanSwitchProducts[0]);
      setSelectedColor('White');
      setSelectedGang('one');
    }
  }, [open]);

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedProduct]);

  const currentProductData = selectedProduct;
  
  const currentStock = 10; // Static stock
  
  const allImages = [
    currentProductData.image,
    '/assets/Fan_switch/touch/touch2.png',
    '/assets/Fan_switch/touch/touch3.png',
    '/assets/Fan_switch/touch/touch4.png',
    '/assets/Fan_switch/touch/touch5.png',
    '/assets/Fan_switch/touch/touch6.png'
  ].filter(Boolean);

  const getCurrentPrice = () => {
    if (!currentProductData) return 3500;
    
    let variants = currentProductData.variants;
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        return currentProductData.price || 3500;
      }
    }
    
    if (variants && variants.length > 0) {
      const selectedVariant = variants.find(v => v.color === selectedColor) || variants[0];
      return selectedVariant.discount_price && selectedVariant.discount_price > 0 
        ? selectedVariant.discount_price 
        : selectedVariant.price || 3500;
    }
    
    return currentProductData.price || 3500;
  };
  
  const currentPrice = getCurrentPrice();
  const engravingPrice = engravingText ? 200 * quantity : 0;
  const totalPrice = (currentPrice * quantity) + engravingPrice;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const cartPayload = {
        id: `${currentProductData.id}_${selectedGang}_${selectedColor}_${Date.now()}`,
        name: `${currentProductData?.title || currentProductData?.name || ''} - ${selectedColor}${engravingText ? ` (Engraved: "${engravingText}")` : ''}`,
        price: currentPrice,
        category: product.category,
        image: currentProductData?.image || '',
        quantity: quantity,
        selectedGang: selectedGang,
        selectedColor: selectedColor,
        color: selectedColor,
        engravingText: engravingText || undefined,
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
                      alt={selectedProduct?.name || currentProductData.name || product.name}
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
                {currentProductData.title || currentProductData.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
                    {totalPrice.toLocaleString()} BDT
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
                <p className="text-sm text-gray-600">+200 BDT for customization</p>
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
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Modern touch-sensitive wall switch with tempered glass panel
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Smart home integration with Tuya Smart Life app
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Voice control support for Google Assistant, Amazon Alexa, Yandex
                            </li>
                          </ul>
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Max Current: 10A, Max Voltage: 250V, Rated Power: 250W per gang
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Size: 86mm x 86mm x 34mm, Mechanical Life: 100,000 on/off cycles
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              UL94V-0 PC fire-resistant material with blue LED indicator
                            </li>
                          </ul>
                        </div>
                      )}
                      {activeTab === 'bonuses' && (
                        <div className="text-sm text-gray-500">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              1 Year Service Warranty
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Color Variation Section */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Variations</h3>
              <div className="grid grid-cols-4 gap-3">
                {['White', 'Gold', 'Black'].map((color) => {
                  const isSelected = selectedColor === color;
                  
                  return (
                    <div key={color} className="text-center">
                      <div 
                        className={`rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden relative ${
                          isSelected ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md' : 
                          'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => setSelectedColor(color)}
                      >
                        <img 
                          src={`/assets/Fan_switch/touch/${color === 'Black' ? 'Black' : color.toLowerCase()}.png`}
                          alt={`${color} Fan Switch`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGangImage(`/assets/Fan_switch/touch/${color === 'Black' ? 'Black' : color.toLowerCase()}.png`);
                            setSelectedGangTitle(`Variations: ${color}`);
                            setImageModalOpen(true);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <div className={`mt-2 text-xs font-medium ${
                        isSelected ? 'text-[#0a1d3a]' : 'text-gray-700'
                      }`}>{color}</div>
                    </div>
                  );
                })}
              </div>
            </div>



            {/* Customization Section */}
            <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Personalization</h3>
                <div 
                  onClick={() => setEngravingModalOpen(true)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    engravingText 
                      ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md hover:shadow-lg' 
                      : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-[#0a1d3a]/50 hover:bg-[#0a1d3a]/5'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        engravingText ? 'bg-[#0a1d3a]/10' : 'bg-gray-200'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          engravingText ? 'text-[#0a1d3a]' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold ${
                          engravingText ? 'text-[#0a1d3a]' : 'text-gray-700'
                        }`}>Customize Your Switch</div>
                        <div className="text-sm text-gray-600">
                          {engravingText ? (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">"${engravingText}"</span>
                              <span className="text-green-600">✓ Added</span>
                            </span>
                          ) : (
                            'Add personal text engraving'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        engravingText ? 'text-[#0a1d3a]' : 'text-gray-700'
                      }`}>
                        +{(200 * quantity).toLocaleString()} BDT
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {engravingText ? 'Click to edit' : 'Optional'}
                      </div>
                    </div>
                  </div>
                </div>
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
              disabled={loading}
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
              ) : (
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
            

          </div>
        </div>
      </DialogContent>
      
      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl bg-white shadow-2xl border-0">
          <div className="p-6">
            {/* Header with Icon */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌀</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Need Help Deciding?</h2>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              The T2 Tuya WiFi Smart Switch is a modern, touch-sensitive wall switch designed for smart home integration. It features a sleek tempered glass panel and operates over a 2.4GHz Wi-Fi network.
            </p>
            
            {/* Key Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  🏠
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Home Integration</h3>
                  <p className="text-sm text-gray-600">Seamless integration with Tuya Smart Life app and supports major voice assistants.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Technical Specs</h3>
                  <p className="text-sm text-gray-600">10A max current, 250V, tempered glass panel with 100,000 on/off cycles.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  ✅
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Installation Ready</h3>
                  <p className="text-sm text-gray-600">Requires both live and neutral wires. Blue LED indicator and fire-resistant material.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl bg-white shadow-2xl border-0">
          <button 
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedGangTitle}</h2>
            <img
              src={selectedGangImage}
              alt="Gang Switch"
              className="w-full h-auto object-contain rounded-lg"
            />
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
            productImage={allImages[selectedImage] || selectedProduct?.image || ''}
            engravingImage="/assets/Fan_switch/touch/engreving.png"
            productName={selectedProduct?.name || selectedProduct?.title || ''}
            engravingTextColor={selectedProduct?.engraving_text_color || '#000000'}
            initialText={engravingText}
            currentQuantity={quantity}
            onSave={({ text }) => {
              setEngravingText(text);
            }}
          />
        </>
      )}
    </Dialog>
  );
}
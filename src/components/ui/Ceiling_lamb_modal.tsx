import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Truck, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Static spotlight products data
const spotlightProducts = [
  {
    id: 'spotlight-1',
    title: 'LED Downlight Ceiling Lamp',
    display_name: 'LED Downlight Ceiling Lamp',
    name: 'LED Downlight Ceiling Lamp',
    price: 2500,
    discount_price: 2200,
    image: '/assets/Lighting/seiling_lamp/spot_1.jpg',
    additional_images: JSON.stringify([
      '/assets/Lighting/seiling_lamp/spot2.jpg',
      '/assets/Lighting/seiling_lamp/spot3.jpg',
      '/assets/Lighting/seiling_lamp/spot4.jpg',
      '/assets/Lighting/seiling_lamp/spot5.jpg',
      '/assets/Lighting/seiling_lamp/spot6.jpg'
    ]),
    overview: 'High-quality LED spotlight with smart controls and adjustable brightness. Perfect for accent lighting and task illumination.',
    technical_details: 'LED Power: 12W, Color Temperature: 3000K-6500K, Beam Angle: 30°, Dimming: 1-100%, Lifespan: 25,000 hours',
    warranty: '2 Year Manufacturer Warranty\nFree replacement for defects\n24/7 customer support',
    variants: JSON.stringify([
      { name: '2.5 inch', price: 5999, discount_price: 0, size: '2.5' },
      { name: '3.5 inch', price: 6200, discount_price: 0, size: '3.5' },
      { name: '4 inch', price: 6500, discount_price: 0, size: '4' }
    ]),
    help_text: 'Smart LED spotlights are perfect for highlighting artwork, creating ambient lighting, or providing focused task lighting. Choose Zigbee for hub-based control or WiFi for direct connection.',
    help_image_url: '/assets/Lighting/seiling_lamp/spot_1.jpg'
  }
];

interface CeilingLampModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    features?: string;
    specifications?: string;
    warranty?: string;
    image?: string;
    stock: number;
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

export function CeilingLampModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: CeilingLampModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(spotlightProducts[0]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedGangImage, setSelectedGangImage] = useState('');
  const [selectedGangTitle, setSelectedGangTitle] = useState('');

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');


  const isLoading = false;

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedImage(0);
      setSelectedSize(''); // No default size selected
      setActiveTab('benefits');
      
      const productData = spotlightProducts[0];
      setSelectedProduct(productData);
      
      try {
        let variants = [];
        if (productData.variants) {
          variants = typeof productData.variants === 'string' 
            ? JSON.parse(productData.variants) 
            : productData.variants;
        }
        
        if (variants.length > 0) {
          setSelectedVariant(variants[0]);
        } else {
          setSelectedVariant({
            name: 'Standard',
            price: productData.price || 0,
            discount_price: productData.discount_price || 0
          });
        }
      } catch (error) {
        setSelectedVariant({
          name: 'Standard',
          price: productData.price || 0,
          discount_price: productData.discount_price || 0
        });
      }
    }
  }, [open]);

  const getSizePrice = () => {
    const basePrice = 5999;
    const sizeMap = { '2.5': basePrice, '3.5': basePrice + 200, '4': basePrice + 400 };
    return sizeMap[selectedSize] || basePrice;
  };
  
  const currentPrice = getSizePrice();
  
  let additionalImages = [];
  try {
    if (selectedProduct?.additional_images) {
      additionalImages = typeof selectedProduct.additional_images === 'string' 
        ? JSON.parse(selectedProduct.additional_images)
        : selectedProduct.additional_images;
    }
  } catch (e) {
    additionalImages = [];
  }
  
  const allImages = [
    selectedProduct?.image,
    ...(Array.isArray(additionalImages) ? additionalImages : [])
  ].filter(Boolean);
  
  console.log('Debug allImages:', {
    selectedProduct: selectedProduct?.id,
    mainImage: selectedProduct?.image,
    additionalImages: additionalImages,
    allImages: allImages,
    totalCount: allImages.length
  });

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Please Select Size",
        description: "Please select a size variation before adding to bag.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const basePrice = currentPrice * quantity;
      const totalPrice = basePrice;
      
      const cartPayload = {
        id: `${selectedProduct.id}_${selectedSize}_${Date.now()}`,
        name: `${selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || ''} - ${selectedSize} inch`,
        price: currentPrice,
        category: product.category,
        image: selectedProduct?.image || '',
        quantity: quantity,
        selectedSize: selectedSize,
        size: `${selectedSize} inc`,
        totalPrice: currentPrice
      };
      
      if (addToCart) {
        addToCart(cartPayload);
      } else {
        await onAddToCart(cartPayload);
      }
      
      if (installationSelected && addToCart) {
        const installationImage = product?.image || selectedProduct?.image || '/images/services/services.png';
        addToCart({
          id: `${product.id}_installation_${Date.now()}`,
          name: 'Professional Installation Service',
          price: 0,
          category: 'Installation Service',
          image: installationImage,
          color: 'Service',
          quantity: 1,
          productName: product?.name || 'Ceiling Lamp',
          installationFor: product?.name || 'Ceiling Lamp'
        });
      }
      
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cartUpdated'));
          }
        } catch (error) {
          console.error('Failed to dispatch cart update event:', error);
        }
      }, 100);
      
      toast({
        title: "Added to Bag",
        description: `Product added to your bag.`,
      });
      onOpenChange(false);
    } catch (error) {
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
              <div className="flex-1 flex items-center justify-center relative lg:min-h-0">
                <div className="w-full h-48 lg:h-auto lg:max-w-lg lg:max-h-[60vh] lg:aspect-square">
                  {allImages[selectedImage]?.endsWith('.mp4') ? (
                    <video
                      src={allImages[selectedImage]}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={allImages[selectedImage]}
                      alt={selectedProduct?.title || selectedProduct?.name || 'Ceiling Lamp'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                
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
              
              {allImages.length > 1 && (
                <div className="hidden lg:flex justify-center mt-6">
                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-8" id="spotlight-thumbnails" style={{maxWidth: '400px'}}>
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0",
                            selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                          )}
                        >
                          {image.endsWith('.mp4') ? (
                            <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
                              <video 
                                src={image} 
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                                onMouseEnter={(e) => e.target.play()}
                                onMouseLeave={(e) => e.target.pause()}
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={image} 
                              alt={`Product ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        const container = document.getElementById('spotlight-thumbnails');
                        container?.scrollBy({ left: -100, behavior: 'smooth' });
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors border"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const container = document.getElementById('spotlight-thumbnails');
                        container?.scrollBy({ left: 100, behavior: 'smooth' });
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors border"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Product Purchase Panel */}
            <div className="p-4 lg:p-8 bg-white lg:overflow-y-auto lg:max-h-[85vh]">
            {/* Top Section */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-5 leading-tight tracking-tight">
                {product?.name || selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
                    {selectedSize ? `${((currentPrice || 0) * quantity).toLocaleString()} BDT` : `Starting From ${(product?.price || 5999).toLocaleString()} BDT`}
                  </span>
                  {selectedVariant && selectedVariant.discount_price > 0 && selectedVariant.discount_price < selectedVariant.price && (
                    <>
                      <span className="text-xs text-gray-500 line-through">
                        {(selectedVariant.price * quantity).toLocaleString()} BDT
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        Save {((selectedVariant.price - selectedVariant.discount_price) * quantity).toLocaleString()} BDT
                      </span>
                    </>
                  )}
                </div>

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
                              Versatile lighting solution with wide color range and smart features
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Compatible with major smart home platforms for convenient control
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Dimmable feature allows customizable ambiance with long lifespan for durability
                            </li>
                          </ul>
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Power Options: 2.5" (9W), 3.5" (12W), 4" (15W) sizes available
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Connectivity: 2.4GHz WiFi, compatible with Alexa, Google Home, Apple HomeKit
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              RGBCW color modes, 120° beam angle, CRI &gt;80, 30,000 hours lifespan
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

            {/* Product Variation Section */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Variations</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['2.5', '3.5', '4'].map((size) => {
                  const isSelected = selectedSize === size;
                  
                  return (
                    <div key={size} className="text-center">
                      <div 
                        className={`rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden relative ${
                          isSelected ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md' : 
                          'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        <img 
                          src={`/assets/Lighting/seiling_lamp/${size}.png`}
                          alt={`${size} inch Spotlight`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGangImage(`/assets/Lighting/seiling_lamp/${size}.png`);
                            setSelectedGangTitle(`Variations: ${size} inc`);
                            setImageModalOpen(true);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <div className={`mt-2 text-xs font-medium ${
                        isSelected ? 'text-[#0a1d3a]' : 'text-gray-700'
                      }`}>{size} inc</div>
                    </div>
                  );
                })}
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
          <button 
            onClick={() => setHelpModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Need Help Deciding?</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    B
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Basic</h3>
                    <p className="text-xs text-gray-700">
                      Simple on/off, fixed white light, suitable for hallways, bedrooms, or general lighting.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Smart</h3>
                    <p className="text-xs text-gray-700">
                      WiFi control via app, voice commands (Alexa/Google Home), adjustable brightness & tunable white (2700–6500K). Great for living rooms, kitchens, or study areas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    C
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Complete</h3>
                    <p className="text-xs text-gray-700">
                      Full RGB + tunable white, integration with HomeKit/Matter/SmartThings, scheduling, scenes, high CRI lighting. Perfect for premium smart homes, entertainment rooms, or showrooms.
                    </p>
                  </div>
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
              alt="Size Variation"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
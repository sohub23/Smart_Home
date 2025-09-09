import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

import { useQuery } from '@tanstack/react-query';

const loadSpotlightProducts = async () => {
  const { supabase } = await import('@/supabase/client');
  const { data, error } = await supabase
    .from('products')
    .select('*, help_text, help_image_url')
    .or('title.ilike.%spot%,display_name.ilike.%spot%,category.ilike.%spot%')
    .limit(10);
  
  if (error) {
    console.error('Error fetching spotlight products:', error);
    return [];
  }
  return data || [];
};

interface SpotLightModalProps {
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

export function SpotLightModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: SpotLightModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [connectionType, setConnectionType] = useState('zigbee');


  const { data: spotlightProducts, isLoading } = useQuery({
    queryKey: ['spotlight-products'],
    queryFn: loadSpotlightProducts,
    enabled: open,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (open && spotlightProducts?.length) {
      setQuantity(1);
      setSelectedImage(0);
      
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
          // Create default variant if none exists
          setSelectedVariant({
            name: 'Standard',
            price: productData.price || 0,
            discount_price: productData.discount_price || 0
          });
        }
      } catch (error) {
        console.error('Error parsing variants:', error);
        setSelectedVariant({
          name: 'Standard',
          price: productData.price || 0,
          discount_price: productData.discount_price || 0
        });
      }
    }
  }, [open, spotlightProducts]);

  const currentPrice = selectedVariant?.discount_price && selectedVariant.discount_price > 0 
    ? selectedVariant.discount_price 
    : selectedVariant?.price || selectedProduct?.price || 0;
  
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

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const basePrice = currentPrice * quantity;
      const wifiUpcharge = selectedVariant?.wifi_upcharge || 0;
      const totalPrice = connectionType === 'wifi' ? basePrice + wifiUpcharge : basePrice;
      
      const cartPayload = {
        productId: `${selectedProduct.id}_${Date.now()}`,
        productName: `${selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || ''}`,
        quantity: quantity,
        connectionType: connectionType,
        variant: selectedVariant?.name || 'Standard',
        model: connectionType === 'zigbee' ? 'Zigbee' : 'Wifi',
        installationCharge: 0,
        totalPrice: totalPrice,
        unitPrice: currentPrice
      };
      
      await onAddToCart(cartPayload);
      
      if (installationSelected && addToCart) {
        addToCart({
          id: `${product.id}_installation`,
          name: 'Installation and setup',
          price: 0,
          category: 'Installation Service',
          image: selectedProduct?.image || product.image,
          color: 'Service',
          quantity: 1
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
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[selectedImage]}
                      alt={selectedProduct?.title || selectedProduct?.name || 'Spotlight'}
                      className="w-full h-full object-contain lg:object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          target.style.display = 'none';
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center ${allImages.length > 0 ? 'hidden' : ''}`}>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                    <span className="text-gray-400 text-sm">Loading image...</span>
                  </div>
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
                          <img 
                            src={image} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
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
            <>
            <div className="mb-6">
              {!isLoading && selectedProduct ? (
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">
                  {selectedProduct.title || selectedProduct.display_name || selectedProduct.name}
                </h1>
              ) : (
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
              )}
              
              {!isLoading ? (
                <div className="mb-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-base text-gray-900">
                      {((currentPrice || 0) * quantity).toLocaleString()} BDT
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
              ) : (
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-24"></div>
              )}
              
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            <div className="mb-4">
              <Accordion type="single" collapsible className="w-full border-t border-b border-gray-200">
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-left text-sm font-semibold no-underline hover:no-underline py-3">Product description</AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="border-b border-gray-200">
                      <div className="flex space-x-8">
                        <button 
                          onClick={() => setActiveTab('benefits')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs ${
                            activeTab === 'benefits' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Overview
                        </button>
                        <button 
                          onClick={() => setActiveTab('bestfor')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs ${
                            activeTab === 'bestfor' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Technical Details
                        </button>
                        <button 
                          onClick={() => setActiveTab('bonuses')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs ${
                            activeTab === 'bonuses' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Warranty
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      {activeTab === 'benefits' && (
                        <div className="text-sm text-gray-500">
                          {!isLoading ? (
                            selectedProduct?.overview ? (
                              <div className="text-sm text-gray-500">
                                {selectedProduct.overview.replace(/<[^>]*>/g, '')}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                No overview available
                              </div>
                            )
                          ) : (
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          {!isLoading ? (
                            selectedProduct?.technical_details ? (
                              <div className="text-sm text-gray-500">
                                {selectedProduct.technical_details.replace(/<[^>]*>/g, '')}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                No technical details available
                              </div>
                            )
                          ) : (
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === 'bonuses' && (
                        <div className="text-sm text-gray-500">
                          {!isLoading ? (
                            selectedProduct?.warranty ? (
                              <div className="text-sm text-gray-500">
                                {selectedProduct.warranty.split('\n').filter(w => w.trim()).map((warrantyItem, index) => (
                                  <div key={index} className="flex items-start gap-2 mb-2">
                                    <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-1.5 flex-shrink-0 opacity-80"></span>
                                    <span>{warrantyItem.trim().replace(/<[^>]*>/g, '')}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                No warranty information available
                              </div>
                            )
                          ) : (
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Choose Model Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Model</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  connectionType === 'zigbee' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setConnectionType('zigbee')} style={connectionType === 'zigbee' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs flex items-center gap-2 ${
                      connectionType === 'zigbee' ? 'text-black font-bold' : 'text-gray-900 font-medium'
                    }`}>
                      <img src="/images/zigbee.svg" alt="Zigbee" className="w-4 h-4" />
                      Zigbee
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Wifi + Hub required</div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  connectionType === 'wifi' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setConnectionType('wifi')} style={connectionType === 'wifi' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs flex items-center gap-2 ${
                      connectionType === 'wifi' ? 'text-black font-bold' : 'text-gray-900 font-medium'
                    }`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                      </svg>
                      Wifi
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Only Wifi required</div>
                </div>
              </div>
            </div>



            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Installation and setup</h3>
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
            </>
            </div>
          </div>
          
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
        <DialogContent className="max-w-lg p-0 rounded-2xl bg-white shadow-2xl border-0">
          <button 
            onClick={() => setHelpModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl flex items-center justify-center">
            {(selectedProduct?.help_image_url || allImages[0]) ? (
              <img
                src={selectedProduct?.help_image_url || allImages[0]}
                alt={selectedProduct?.name || product.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            {selectedProduct?.help_text ? (
              <div className="text-sm text-gray-600 leading-relaxed">
                {selectedProduct.help_text?.replace(/<[^>]*>/g, '') || 'No help information available'}
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedProduct?.help_title || 'Need help deciding? We\'ve got you covered'}
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Installation Service</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Professional installation service available. Our team will contact you with pricing and scheduling details.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
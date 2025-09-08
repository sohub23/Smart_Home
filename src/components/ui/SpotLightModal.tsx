import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useSupabase, enhancedProductService } from '@/supabase';

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
  const { executeQuery } = useSupabase();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadSpotLightProducts();
      setQuantity(1);
      setSelectedProduct(product);
    }
  }, [open, product]);

  const loadSpotLightProducts = async () => {
    try {
      setDynamicLoading(true);
      
      const [categories, subcategories] = await Promise.all([
        executeQuery(() => enhancedProductService.getCategories()),
        executeQuery(() => enhancedProductService.getSubcategories())
      ]);
      
      const lightingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('lighting') || cat.name.toLowerCase().includes('light')
      );
      
      if (!lightingCategory) return;
      
      const spotLightSubcategory = subcategories.find(sub => 
        sub.category_id === lightingCategory.id && 
        sub.name.toLowerCase().includes('spot')
      );
      
      if (!spotLightSubcategory) return;
      
      const products = await executeQuery(() => 
        enhancedProductService.getProductsBySubcategory(spotLightSubcategory.id)
      );
      
      setDynamicProducts(products || []);
      
      if (products && products.length > 0) {
        setSelectedProduct(products[0]);
      }
      
    } catch (error) {
      console.error('Failed to load spot light products:', error);
    } finally {
      setDynamicLoading(false);
    }
  };

  const currentProductData = selectedProduct || product;
  
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
      const firstVariant = variants[0];
      return firstVariant.discount_price && firstVariant.discount_price > 0 
        ? firstVariant.discount_price 
        : firstVariant.price || 0;
    }
    
    // Fallback to original product price if currentProductData price is invalid
    const price = currentProductData.price || product.price || 0;
    return isNaN(price) ? 1000 : price; // Default price if NaN
  };
  
  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * quantity;
  
  let additionalImages = [];
  try {
    if (currentProductData?.additional_images) {
      additionalImages = typeof currentProductData.additional_images === 'string' 
        ? JSON.parse(currentProductData.additional_images)
        : currentProductData.additional_images;
    }
  } catch (e) {
    additionalImages = [];
  }
  
  const allImages = [
    currentProductData?.image,
    ...(Array.isArray(additionalImages) ? additionalImages : [])
  ].filter(Boolean);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await onAddToCart({
        productId: currentProductData.id || product.id,
        quantity: quantity,
        installationCharge: 0,
        totalPrice: totalPrice
      });
      
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
                      alt={currentProductData.name || product.name}
                      className="w-full h-full object-contain lg:object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
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
            <div className="mb-6">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">
                {currentProductData.title || currentProductData.name || product.name}
              </h1>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-base text-gray-900">
                    {totalPrice.toLocaleString()} BDT
                  </span>
                </div>
              </div>
              
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
                          {(currentProductData?.overview || currentProductData?.description) ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-1.5 [&_li]:before:flex-shrink-0 [&_li]:before:opacity-80"
                              dangerouslySetInnerHTML={{ 
                                __html: currentProductData.overview || currentProductData.description 
                              }}
                            />
                          ) : (
                            <p className="text-gray-400 italic">No overview available from admin portal</p>
                          )}
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          {currentProductData?.technical_details ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-1.5 [&_li]:before:flex-shrink-0 [&_li]:before:opacity-80"
                              dangerouslySetInnerHTML={{ 
                                __html: currentProductData.technical_details 
                              }}
                            />
                          ) : (
                            <p className="text-gray-400 italic">No technical details available from admin portal</p>
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
                            <p className="text-gray-400 italic">No warranty information available from admin portal</p>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
              <div 
                className="prose prose-sm max-w-none text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedProduct.help_text }}
              />
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedProduct?.help_title || 'Need help deciding? We\'ve got you covered'}
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Standard Installation (+0 BDT)</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Basic spot light installation with proper wiring and mounting. Perfect for single lights or small installations.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Premium Installation (+1,500 BDT)</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Complete professional service with electrical safety check, advanced wiring, and dimmer integration. Includes 1-year installation warranty.
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
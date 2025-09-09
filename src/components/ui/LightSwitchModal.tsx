import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useSupabase, enhancedProductService } from '@/supabase';
import { EngravingTrigger } from '@/components/ui/EngravingTrigger';
import { EngravingModal } from '@/components/ui/EngravingModal';
import { sanitizeForLog } from '@/utils/sanitize';

interface LightSwitchModalProps {
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
    subcategoryProducts?: any[];
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

export function LightSwitchModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: LightSwitchModalProps) {
  const { executeQuery } = useSupabase();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingModalOpen, setEngravingModalOpen] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedGang, setSelectedGang] = useState('one');
  const [gangImageIndex, setGangImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedProduct, setSelectedProduct] = useState(product.subcategoryProducts?.[0] || product);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Load dynamic products from admin portal
  useEffect(() => {
    if (open) {
      loadLightSwitchProducts();
      setQuantity(1);
      setSelectedProduct(product.subcategoryProducts?.[0] || product);
    }
  }, [open, product]);

  // Reset quantity when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setQuantity(1);
    }
  }, [selectedVariant]);

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedProduct]);

  const loadLightSwitchProducts = async () => {
    setDynamicLoading(false); // Show UI immediately
    
    try {
      const { supabase } = await import('@/supabase/client');
      
      const { data } = await supabase
        .from('products')
        .select('id, title, display_name, price, image, image2, image3, image4, image5, additional_images, variants, help_text, help_image_url')
        .ilike('title', '%gang%')
        .limit(10);
      
      if (data?.length) {
        setDynamicProducts(data);
        const oneGang = data.find(p => p.title?.includes('1 gang'));
        setSelectedProduct(oneGang || data[0]);
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const currentProductData = product;
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  const warranty = currentProductData.warranty ? currentProductData.warranty.split('\n').filter(w => w.trim()) : [];
  // Get current price from selected product variants or product price
  const getCurrentPrice = () => {
    if (!selectedProduct) return 0;
    
    // Check if variants exist and parse them
    let variants = selectedProduct.variants;
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        variants = [];
      }
    }
    
    // Get price from first variant or fallback to product price
    if (variants && variants.length > 0) {
      const firstVariant = variants[0];
      return firstVariant.discount_price && firstVariant.discount_price > 0 
        ? firstVariant.discount_price 
        : firstVariant.price || 0;
    }
    
    return selectedProduct.price || 0;
  };
  
  const currentPrice = getCurrentPrice();
  
  console.log('Price calculation:', {
    hasSelectedProduct: !!selectedProduct,
    hasVariants: !!(selectedProduct?.variants),
    calculatedPrice: currentPrice
  });
  
  const gangImages = [
    (selectedProduct as any)?.gang_1_image,
    (selectedProduct as any)?.gang_2_image, 
    (selectedProduct as any)?.gang_3_image,
    (selectedProduct as any)?.gang_4_image
  ].filter(Boolean);
  
  const getCurrentGangImage = () => {
    // Use the selected product's main image since we're switching products based on gang selection
    return selectedProduct?.image || selectedProduct?.image2 || selectedProduct?.image3 || selectedProduct?.image4 || selectedProduct?.image5;
  };
  

  
  // Get all available images from selected product (similar to SmartSecurityBoxModal)
  const getProductImages = (productData) => {
    if (!productData) return [];
    
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
  
  const allImages = getProductImages(selectedProduct);
  
  console.log('Image debug:', {
    selectedProductId: selectedProduct?.id,
    hasAdditionalImages: !!selectedProduct?.additional_images,
    additionalImagesRaw: selectedProduct?.additional_images,
    totalImages: allImages.length,
    allImages: allImages
  });

  const engravingPrice = engravingText && (selectedProduct?.engraving_price || currentProductData.engraving_price) ? (selectedProduct?.engraving_price || currentProductData.engraving_price) * quantity : 0;
  const totalPrice = (currentPrice * quantity) + engravingPrice;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      if (addToCart) {
        addToCart({
          id: product.id,
          name: `${product.name} - ${selectedGang.charAt(0).toUpperCase() + selectedGang.slice(1)} Gang${engravingText ? ` (Engraved: "${engravingText}")` : ''}`,
          price: totalPrice / quantity,
          category: product.category,
          image: getCurrentGangImage() || product.image || '',
          color: product.category,
          quantity: quantity,
          selectedGang: selectedGang,
          selectedColor: selectedColor
        });
      } else {
        await onAddToCart({
          productId: product.id,
          productName: `${product.name} - ${selectedGang.charAt(0).toUpperCase() + selectedGang.slice(1)} Gang${engravingText ? ` (Engraved: "${engravingText}")` : ''}`,
          quantity: quantity,
          installationCharge: 0,
          engravingText: engravingText || undefined,
          selectedGang: selectedGang,
          selectedColor: selectedColor,
          totalPrice: totalPrice / quantity
        });
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
      console.error('Add to cart failed:', sanitizeForLog(error));
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
                      alt={product.name}
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
                  
                  <div className="flex gap-3 overflow-x-auto max-w-xs">
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
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">
                {selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || currentProductData.title || currentProductData.display_name || currentProductData.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-base text-gray-900">
                    {totalPrice.toLocaleString()} BDT
                  </span>
                  {(() => {
                    // Check if variants exist and parse them
                    let variants = selectedProduct?.variants;
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
                {(selectedProduct?.engraving_available || currentProductData.engraving_available) && (selectedProduct?.engraving_price || currentProductData.engraving_price) && (
                  <p className="text-sm text-gray-600">+{selectedProduct?.engraving_price || currentProductData.engraving_price} BDT for customization</p>
                )}
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Details Accordion */}
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
                          {(selectedProduct?.overview || selectedProduct?.description) ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-1.5 [&_li]:before:flex-shrink-0 [&_li]:before:opacity-80"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedProduct.overview || selectedProduct.description 
                              }}
                            />
                          ) : (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Traditional mechanical switch with reliable tactile feedback
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Durable construction with premium materials for long-lasting performance
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Easy installation with standard wiring compatibility
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          {selectedProduct?.technical_details ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-1.5 [&_li]:before:flex-shrink-0 [&_li]:before:opacity-80"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedProduct.technical_details 
                              }}
                            />
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
                                AC 100-240V input with mechanical switching mechanism
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                Standard electrical box mounting with secure installation
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                High-quality plastic housing with smooth operation
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                      {activeTab === 'bonuses' && (
                        <div className="text-sm text-gray-500">
                          {selectedProduct?.warranty ? (
                            <div className="text-sm text-gray-500">
                              {selectedProduct.warranty.split('\n').filter(w => w.trim()).map((warrantyItem, index) => (
                                <div key={index} className="flex items-start gap-2 mb-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-1.5 flex-shrink-0 opacity-80"></span>
                                  <span dangerouslySetInnerHTML={{ __html: warrantyItem.trim() }} />
                                </div>
                              ))}
                            </div>
                          ) : warranty.length > 0 ? (
                            <ul className="space-y-2">
                              {warranty.map((warrantyItem, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {warrantyItem}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                1 Year Service Warranty
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

            {/* Product Variation Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Your Model</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['one', 'two', 'three', 'four'].map((gang) => {
                  const gangNumber = gang === 'one' ? '1' : gang === 'two' ? '2' : gang === 'three' ? '3' : '4';
                  const gangProduct = dynamicProducts.find(p => 
                    p.title?.toLowerCase().includes(`${gangNumber} gang`) || 
                    p.display_name?.toLowerCase().includes(`${gangNumber} gang`) ||
                    p.name?.toLowerCase().includes(`${gangNumber} gang`)
                  );
                  
                  // Get price from product variants
                  let gangPrice = 0;
                  if (gangProduct) {
                    // Check if variants exist and parse them
                    let variants = gangProduct.variants;
                    if (typeof variants === 'string') {
                      try {
                        variants = JSON.parse(variants);
                      } catch (e) {
                        variants = [];
                      }
                    }
                    
                    // Get price from first variant or fallback to product price
                    if (variants && variants.length > 0) {
                      const firstVariant = variants[0];
                      gangPrice = firstVariant.discount_price && firstVariant.discount_price > 0 
                        ? firstVariant.discount_price 
                        : firstVariant.price || 0;
                    } else {
                      gangPrice = gangProduct.price || gangProduct.base_price || gangProduct.unit_price || 0;
                    }
                  }
                  
                  console.log(`Gang ${gangNumber}:`, {
                    hasProduct: !!gangProduct,
                    hasVariants: !!(gangProduct?.variants),
                    finalPrice: gangPrice
                  });
                  
                  const isAvailable = !!gangProduct;
                  const isSelected = selectedGang === gang;
                  
                  return (
                    <div 
                      key={gang}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md' : 
                        isAvailable ? 'border-gray-200 hover:border-gray-300 bg-white' : 
                        'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => {
                        if (isAvailable && gangProduct) {
                          setSelectedGang(gang);
                          setSelectedProduct(gangProduct);
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className="mb-2 flex justify-center gap-0.5">
                          {Array.from({ length: parseInt(gangNumber) }).map((_, i) => (
                            <div key={i} className={`${gangNumber === '1' ? 'w-8' : gangNumber === '2' ? 'w-4' : gangNumber === '3' ? 'w-3' : 'w-2'} h-6 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#0a1d3a] bg-[#0a1d3a]/10' : 'border-gray-300'
                            }`}>
                              <div className={`${gangNumber === '1' ? 'w-2 h-2' : gangNumber === '4' ? 'w-0.5 h-1' : 'w-1 h-1'} rounded-full ${
                                isSelected ? 'bg-[#0a1d3a]' : 'bg-gray-400'
                              }`}></div>
                            </div>
                          ))}
                        </div>
                        <div className={`font-medium text-xs ${
                          isSelected ? 'text-[#0a1d3a]' : isAvailable ? 'text-gray-700' : 'text-gray-400'
                        }`}>{gangNumber} Gang</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {isAvailable ? `${gangPrice.toLocaleString()} BDT` : 'Not Available'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
              <div className="flex gap-4">
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    selectedColor === 'white' ? 'transform scale-105' : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedColor('white')}
                >
                  <div className={`w-10 h-10 rounded-full border-2 shadow-md transition-all duration-200 ${
                    selectedColor === 'white' ? 'border-[#0a1d3a] ring-2 ring-[#0a1d3a]/20' : 'border-gray-300 hover:border-gray-400'
                  } bg-white`} />
                  <span className={`text-xs mt-1 font-medium ${
                    selectedColor === 'white' ? 'text-[#0a1d3a]' : 'text-gray-600'
                  }`}>White</span>
                </div>
                
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    selectedColor === 'black' ? 'transform scale-105' : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedColor('black')}
                >
                  <div className={`w-10 h-10 rounded-full border-2 shadow-md transition-all duration-200 ${
                    selectedColor === 'black' ? 'border-[#0a1d3a] ring-2 ring-[#0a1d3a]/20' : 'border-gray-300 hover:border-gray-400'
                  } bg-black`} />
                  <span className={`text-xs mt-1 font-medium ${
                    selectedColor === 'black' ? 'text-[#0a1d3a]' : 'text-gray-600'
                  }`}>Black</span>
                </div>
              </div>
            </div>

            {/* Customization Section */}
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personalization</h3>
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
                        +{((selectedProduct?.engraving_price || currentProductData.engraving_price || 200) * quantity).toLocaleString()} BDT
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

            {/* Installation and setup */}
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
          
          {/* Fixed Bottom CTA - Right Side Only */}
          <div className="fixed bottom-0 left-0 right-0 lg:right-0 lg:left-auto lg:w-[600px] bg-white border-t lg:border-l border-gray-200 p-3 lg:p-4 z-[60] shadow-lg">
            <Button
              onClick={handleAddToCart}
              disabled={loading || (selectedVariant && selectedVariant.stock === 0)}
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
              ) : (selectedVariant && selectedVariant.stock === 0) ? 'Out of stock' : (
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
            {selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0 && (
              <p className="text-center text-sm text-black font-medium mt-2">
                Only {selectedVariant.stock} left in stock - order soon!
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
            {(selectedProduct?.help_image_url || allImages[0]) ? (
              <img
                src={selectedProduct?.help_image_url || allImages[0]}
                alt={selectedProduct?.name || currentProductData.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}
          </div>
          
          <div className="p-6">

            
            {/* Help Text from Database */}
            {selectedProduct?.help_text ? (
              <div 
                className="prose prose-sm max-w-none text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedProduct.help_text }}
              />
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Standard Installation (+0 BDT)</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Basic light switch installation with proper wiring and mounting. Perfect for single switches or small installations. Includes safety check and testing.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Premium Installation (+800 BDT)</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Complete professional service with electrical safety check, advanced wiring, and circuit testing. Includes 1-year installation warranty and priority support.
                  </p>
                </div>
              </div>
            )}
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
            productImage={allImages[selectedImage] || currentProductData.image || ''}
            engravingImage={selectedProduct?.engraving_image || currentProductData.engraving_image}
            productName={selectedProduct?.name || currentProductData.name}
            engravingTextColor={selectedProduct?.engraving_text_color || currentProductData.engraving_text_color}
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
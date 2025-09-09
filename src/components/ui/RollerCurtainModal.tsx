import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useSupabase, enhancedProductService } from '@/supabase';

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
    subcategoryProducts?: any[];
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

export function RollerCurtainModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: RollerCurtainModalProps) {
  const { executeQuery } = useSupabase();
  const [selectedImage, setSelectedImage] = useState(0);
  const [trackSizes, setTrackSizes] = useState([0]);
  const [trackQuantities, setTrackQuantities] = useState([1]);
  const [loading, setLoading] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [connectionType, setConnectionType] = useState('zigbee');
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Standard (up to 8 feet)');
  const [selectedProduct, setSelectedProduct] = useState(product.subcategoryProducts?.[0] || product);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Load dynamic products from admin portal
  useEffect(() => {
    if (open) {
      // Show modal immediately with existing product data
      setConnectionType('zigbee');
      setSelectedProduct(product.subcategoryProducts?.[0] || product);
      setDynamicLoading(false);
      setDataLoading(false); // Show content immediately
      
      // Load enhanced data progressively
      loadRollerCurtainProducts();
    }
  }, [open, product]);

  // Reset quantity when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setTrackQuantities([1]);
    }
  }, [selectedVariant]);

  const loadRollerCurtainProducts = async () => {
    try {
      // Stage 1: Load text content first (name, price, description)
      setTimeout(async () => {
        const { supabase } = await import('@/supabase/client');
        
        const { data } = await supabase
          .from('products')
          .select('id, title, display_name, price, overview, technical_details, variants')
          .ilike('title', '%roller%')
          .limit(10);
        
        if (data?.length) {
          setDynamicProducts(data);
          setSelectedProduct(prev => ({ ...prev, ...data[0] }));
          
          // Parse variants immediately for pricing
          let variants = data[0].variants;
          if (typeof variants === 'string') {
            try {
              variants = JSON.parse(variants);
            } catch (e) {
              variants = [];
            }
          }
          if (variants?.length > 0) {
            setSelectedVariant(variants[0]);
          }
        }
      }, 50);
      
      // Stage 2: Load images
      setTimeout(async () => {
        const { supabase } = await import('@/supabase/client');
        
        const { data } = await supabase
          .from('products')
          .select('image, additional_images')
          .ilike('title', '%roller%')
          .limit(10);
        
        if (data?.length) {
          setSelectedProduct(prev => ({ ...prev, ...data[0] }));
        }
      }, 200);
      
      // Stage 3: Load remaining data
      setTimeout(async () => {
        const { supabase } = await import('@/supabase/client');
        
        const { data } = await supabase
          .from('products')
          .select('warranty, help_text, help_image_url')
          .ilike('title', '%roller%')
          .limit(10);
        
        if (data?.length) {
          setSelectedProduct(prev => ({ ...prev, ...data[0] }));
        }
      }, 400);
      
    } catch (error) {
      console.error('Load error:', error);
    }
  };
  const [showInstallationSetup, setShowInstallationSetup] = useState(false);
  const [installationNotes, setInstallationNotes] = useState('');
  const [installationTBD, setInstallationTBD] = useState(false);



  const currentProductData = product;
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  const warranty = currentProductData.warranty ? currentProductData.warranty.split('\n').filter(w => w.trim()) : [];
  const currentPrice = (selectedVariant?.discount_price && selectedVariant.discount_price > 0 ? selectedVariant.discount_price : selectedVariant?.price) || selectedProduct?.price || currentProductData.price || product.price || 0;
  
  console.log('Current product data:', currentProductData);
  console.log('Selected product:', selectedProduct);
  console.log('Dynamic products:', dynamicProducts);
  console.log('Selected variant:', selectedVariant);
  console.log('Current price:', currentPrice);
  console.log('Product price:', currentProductData.price);
  console.log('Selected product price:', selectedProduct?.price);
  console.log('Selected product variants:', selectedProduct?.variants);
  // Parse additional images from database
  let additionalImages = [];
  try {
    if (selectedProduct?.additional_images) {
      additionalImages = typeof selectedProduct.additional_images === 'string' 
        ? JSON.parse(selectedProduct.additional_images)
        : selectedProduct.additional_images;
    }
  } catch (e) {
    console.log('Failed to parse additional images:', e);
    additionalImages = [];
  }
  
  const allImages = [
    selectedProduct?.image,
    ...(Array.isArray(additionalImages) ? additionalImages : [])
  ].filter(Boolean);

  const totalQuantity = trackQuantities.reduce((sum, qty) => sum + qty, 0);
  const smartCurtainInstallation = 0;
  const totalWithInstallation = (currentPrice * totalQuantity);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const quantity = trackQuantities[0] || 1;
      const basePrice = currentPrice * quantity;
      const totalPrice = connectionType === 'wifi' ? basePrice + 2000 : basePrice;
      
      const cartPayload = {
        productId: `${selectedProduct.id}_${Date.now()}`,
        productName: `${selectedProduct.name || product.name} (${connectionType.toUpperCase()})`,
        quantity: quantity,
        trackSize: selectedSize,
        connectionType: connectionType,
        installationCharge: 0,
        totalPrice: totalPrice,
        unitPrice: currentPrice
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
              {/* Main Product Image */}
              <div className="flex-1 flex items-center justify-center relative lg:min-h-0">
                <div className="w-full h-48 lg:h-auto lg:max-w-lg lg:max-h-[60vh] lg:aspect-square">
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center ${allImages.length > 0 ? 'hidden' : ''}`}>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                    <span className="text-gray-400 text-sm">Loading image...</span>
                  </div>
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
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200",
                          selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
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
            <div className="p-4 lg:p-8 bg-white lg:overflow-y-auto lg:max-h-[85vh] relative">
            {/* Top Section */}
            <div className="mb-6">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">
                {selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || currentProductData.title || currentProductData.display_name || currentProductData.name}
              </h1>
              

              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-base text-gray-900">
                    {currentPrice.toLocaleString()} BDT
                  </span>
                  {selectedVariant && selectedVariant.discount_price > 0 && selectedVariant.discount_price < selectedVariant.price && (
                    <>
                      <span className="text-xs text-gray-500 line-through">
                        {selectedVariant.price.toLocaleString()} BDT
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        Save {(selectedVariant.price - selectedVariant.discount_price).toLocaleString()} BDT
                      </span>
                    </>
                  )}
                </div>
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
                            <p className="text-gray-400 italic">No overview available from admin portal</p>
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
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-1.5 flex-shrink-0 opacity-80"></span>
                                  {spec}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 italic">No technical details available from admin portal</p>
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
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-1.5 flex-shrink-0 opacity-80"></span>
                                  {warrantyItem}
                                </li>
                              ))}
                            </ul>
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

            {/* Variations Selection */}
            <div className="mb-4">
              <Accordion type="single" collapsible className="w-full border-t border-b border-gray-200">
                <AccordionItem value="variations" className="border-none">
                  <AccordionTrigger className="text-left text-sm font-medium no-underline hover:no-underline py-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">
                        {(() => {
                          let variants = selectedProduct?.variants || [];
                          if (typeof variants === 'string') {
                            try {
                              variants = JSON.parse(variants);
                            } catch (e) {
                              variants = [];
                            }
                          }
                          return variants.length > 0 ? 
                            `Variant - ${selectedVariant?.name || 'Select variant'}` : 
                            `Size - ${selectedSize}`;
                        })()
                        }
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="grid grid-cols-1 gap-2">
                      {(() => {
                        let variants = selectedProduct?.variants || [];
                        if (typeof variants === 'string') {
                          try {
                            variants = JSON.parse(variants);
                          } catch (e) {
                            variants = [];
                          }
                        }
                        return variants.length > 0 ? (
                          variants.map((variant: any, index: number) => (
                            <button
                              key={variant.id || index}
                              onClick={() => {
                                setSelectedVariant(variant);
                                setSelectedSize(variant.name);
                              }}
                              className={`p-3 text-xs rounded-lg border-2 transition-all flex justify-between items-center ${
                                selectedVariant?.name === variant.name ? 'border-gray-400 bg-gray-100 font-bold' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span>{variant.name}</span>
                              <span className="font-bold">{(variant.discount_price && variant.discount_price > 0 ? variant.discount_price : variant.price)?.toLocaleString()} BDT</span>
                            </button>
                          ))
                        ) : (
                          ['Standard (up to 8 feet)', 'Large (8-12 feet) - Requires 2 motors', 'Extra Large (12+ feet) - Custom quote'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`p-3 text-xs rounded-lg border-2 transition-all ${
                                selectedSize === size ? 'border-gray-400 bg-gray-100 font-bold' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {size}
                            </button>
                          ))
                        );
                      })()}

                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Quantity Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.max(1, newQuantities[0] - 1);
                      setTrackQuantities(newQuantities);
                    }}
                    disabled={trackQuantities[0] <= 1}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                    {trackQuantities[0] || 1}
                  </span>
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      const maxStock = selectedVariant?.stock || 10;
                      newQuantities[0] = Math.min(maxStock, (newQuantities[0] || 1) + 1);
                      setTrackQuantities(newQuantities);
                    }}
                    disabled={trackQuantities[0] >= (selectedVariant?.stock || 10)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h3 className="font-bold text-gray-900 mb-2">Standard Track Setup (+0 BDT)</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Basic roller track installation with motor setup and app configuration. Perfect for standard windows. Includes mounting hardware and basic smart home integration.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Premium Track Installation (+3,500 BDT)</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Complete professional service with custom track measurements, advanced mounting solutions, and full smart home ecosystem integration. Includes 1-year service warranty and priority support.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
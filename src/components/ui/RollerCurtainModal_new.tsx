import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
// Removed database imports - using static data

interface RollerCurtainModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: {
    id: string;
    name: string;
    display_name?: string;
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [trackSizes, setTrackSizes] = useState([0]);
  const [trackQuantities, setTrackQuantities] = useState([1]);
  const [loading, setLoading] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [connectionType, setConnectionType] = useState('zigbee');
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('1-channel remote');
  const [selectedCapacity, setSelectedCapacity] = useState('Matter over Thread');
  
  // Price mapping for different variations
  const sizePricing = {
    '1-channel remote': 15000,
    'Only Motor (Remote is required to set the limit)': 13000
  };
  const [selectedProduct, setSelectedProduct] = useState(product.subcategoryProducts?.[0] || product);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Static product data
  const staticProductData = {
    id: 'roller-curtain-1',
    title: 'Smart Roller Curtain',
    display_name: 'Smart Roller Curtain',
    price: 13000,
    overview: '<ul><li>Motorized roller system with smooth, quiet up–down operation</li><li>Supports app, remote, voice, and scheduled automation</li><li>Ideal for modern homes, offices, and hotels with energy-saving design</li></ul>',
    technical_details: '<ul><li>Motor & Control: DC/AC motor (<35 dB), app, remote, voice, timer</li><li>Tube & Capacity: Up to 8 ft width, curtain fabric not included</li><li>Power: AC 100–220V, optional battery, 6–10 kg load</li></ul>',
    warranty: '1 year service warranty',
    help_text: 'Our smart roller curtains offer automated control with smartphone integration. Choose between Zigbee (requires hub) or WiFi models based on your smart home setup.',
    image: '/assets/hero-sliding-curtain.jpg',
    additional_images: [
      '/assets/hero-sliding-curtain.jpg',
      '/images/curtain-2.jpg',
      '/images/curtain-3.jpg'
    ],
    variants: [
      {
        id: 'slider-standard',
        name: 'Standard (up to 8 feet)',
        price: 25000,
        discount_price: 0,
        stock: 10
      },
      {
        id: 'slider-large',
        name: 'Large (8-12 feet)',
        price: 35000,
        discount_price: 32000,
        stock: 5
      },
      {
        id: 'slider-xl',
        name: 'Extra Large (12+ feet)',
        price: 45000,
        discount_price: 0,
        stock: 3
      }
    ]
  };

  // Initialize with static data
  useEffect(() => {
    if (open) {
      setConnectionType('zigbee');
      setSelectedProduct({ ...product, ...staticProductData });
      setDynamicProducts([staticProductData]);
      setDynamicLoading(false);
      
      // Set default variant
      if (staticProductData.variants?.length > 0) {
        setSelectedVariant(staticProductData.variants[0]);
      }
    }
  }, [open, product]);

  // Reset quantity when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setTrackQuantities([1]);
    }
  }, [selectedVariant]);

  // Reset image selection when product changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedProduct]);
  const [showInstallationSetup, setShowInstallationSetup] = useState(false);
  const [installationNotes, setInstallationNotes] = useState('');
  const [installationTBD, setInstallationTBD] = useState(false);

  const currentProductData = product;
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  const warranty = currentProductData.warranty ? currentProductData.warranty.split('\n').filter(w => w.trim()) : [];
  const currentPrice = sizePricing[selectedSize] || 15000;
  
  console.log('Current product data:', currentProductData);
  console.log('Selected product:', selectedProduct);
  console.log('Dynamic products:', dynamicProducts);
  console.log('Selected variant:', selectedVariant);
  console.log('Current price:', currentPrice);
  console.log('Product price:', currentProductData.price);
  console.log('Selected product price:', selectedProduct?.price);
  console.log('Selected product variants:', selectedProduct?.variants);
  // Video first, then roller curtain images
  const allImages = [
    'https://youtu.be/K0MZDn2Tw_4?si=lNusOrl2Drzkah-T', // Video first
    '/src/assets/roller_curtain/roller1.jpg',
    '/src/assets/roller_curtain/roller2.jpg',
    '/src/assets/roller_curtain/roller3.jpg',
    '/src/assets/roller_curtain/roller4.jpg',
    '/src/assets/roller_curtain/roller5.jpg',
    '/src/assets/roller_curtain/roller6.jpg'
  ];

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
                <div className="w-full h-full lg:max-w-lg">
                  {selectedImage === 0 && (allImages[0].includes('youtube.com') || allImages[0].includes('youtu.be')) ? (
                    <div className="w-full h-full rounded-lg overflow-hidden relative bg-white">
                      <iframe
                        key={`video-${open}-${selectedImage}`}
                        src={`https://www.youtube-nocookie.com/embed/K0MZDn2Tw_4?autoplay=1&mute=1&controls=0&loop=1&playlist=K0MZDn2Tw_4&vq=hd480&modestbranding=1&iv_load_policy=3`}
                        className="absolute inset-0 w-full h-full"
                        style={{ 
                          border: 'none',
                          width: '120%',
                          height: '120%',
                          left: '-10%',
                          top: '-10%',
                          transform: 'scale(1.1)'
                        }}
                        allow="autoplay; encrypted-media"
                        title="Smart Curtain Demo"
                      />
                    </div>
                  ) : (
                    <img
                      src={allImages[selectedImage]}
                      alt={selectedProduct?.title || selectedProduct?.display_name || product.name}
                      className="w-full h-full object-contain rounded-lg"
                      style={{ minHeight: '300px', maxHeight: '500px' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 relative",
                          selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {image.includes('youtube.com') || image.includes('youtu.be') ? (
                          <div className="w-full h-full relative">
                            <img 
                              src="https://img.youtube.com/vi/K0MZDn2Tw_4/maxresdefault.jpg" 
                              alt="Video Thumbnail" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={image} 
                            alt={`${product.name} ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
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
              {/* Main Title */}
              <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-5 leading-tight tracking-tight">
                {selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || currentProductData.title || currentProductData.display_name || currentProductData.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-5">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
                    {totalQuantity > 1 ? `${totalWithInstallation.toLocaleString()} BDT` : `${currentPrice.toLocaleString()} BDT`}
                  </span>
                  {totalQuantity > 1 && (
                    <span className="text-base text-gray-600 font-medium">
                      ({currentPrice.toLocaleString()} BDT × {totalQuantity})
                    </span>
                  )}
                  {selectedVariant && selectedVariant.discount_price > 0 && selectedVariant.discount_price < selectedVariant.price && (
                    <>
                      <span className="text-base text-gray-500 line-through font-medium">
                        {(selectedVariant.price * totalQuantity).toLocaleString()} BDT
                      </span>
                      <span className="text-base text-green-600 font-semibold">
                        Save {((selectedVariant.price - selectedVariant.discount_price) * totalQuantity).toLocaleString()} BDT
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-800 text-base font-medium mb-3">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <span>Ships within 3–7 business days | Free shipping</span>
                </div>
                <div className="text-sm text-gray-700 font-medium space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 font-bold">*</span>
                    <span className="font-bold">Tube pipe and curtain fabric not included</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 font-bold">*</span>
                    <span className="font-bold">Maximum supported length: 8 feet</span>
                  </div>
                </div>
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
                    <div className="pt-5">
                      {activeTab === 'benefits' && (
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {(selectedProduct?.overview || selectedProduct?.description) ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-1.5 [&_li]:text-sm [&_li]:text-gray-700 [&_li]:leading-relaxed [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-2 [&_li]:before:flex-shrink-0"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedProduct.overview || selectedProduct.description 
                              }}
                            />
                          ) : (
                            <p className="text-gray-500 italic text-sm">No overview available from admin portal</p>
                          )}
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {selectedProduct?.technical_details ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-1.5 [&_li]:text-sm [&_li]:text-gray-700 [&_li]:leading-relaxed [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-2 [&_li]:before:flex-shrink-0"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedProduct.technical_details 
                              }}
                            />
                          ) : specifications.length > 0 ? (
                            <ul className="space-y-3">
                              {specifications.map((spec, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {spec}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic text-sm">No technical details available from admin portal</p>
                          )}
                        </div>
                      )}
                      {activeTab === 'bonuses' && (
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {selectedProduct?.warranty ? (
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {selectedProduct.warranty.split('\n').filter(w => w.trim()).map((warrantyItem, index) => (
                                <div key={index} className="flex items-start gap-3 mb-3">
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                                  <span dangerouslySetInnerHTML={{ __html: warrantyItem.trim() }} />
                                </div>
                              ))}
                            </div>
                          ) : warranty.length > 0 ? (
                            <ul className="space-y-3">
                              {warranty.map((warrantyItem, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {warrantyItem}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic text-sm">No warranty information available from admin portal</p>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Variations Selection - Alibaba Style */}
            <div className="mb-4">
              <div className="border-t border-b border-gray-200 py-3">
                <div className="mb-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-base font-bold text-gray-900">Variations</h3>
                    <span className="text-sm text-gray-600">
                      option: <span className="font-semibold text-gray-900">
                        {selectedSize || '1-channel remote'}
                      </span>
                    </span>
                  </div>
                </div>
                
                {/* Variation Options - Horizontal Row */}
                <div className="flex gap-2">
                  {['1-channel remote', 'Only Motor (Remote is required to set the limit)'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedSize(option)}
                      className={`flex-1 py-1.5 text-sm rounded border-2 transition-all font-medium ${
                        selectedSize === option ? 'border-black bg-gray-100 text-black' : 'border-gray-200 hover:border-black text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
              </div>
            </div>

            {/* Capacity Section */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Capacity</h3>
              <div className="text-sm text-gray-700 flex gap-2 flex-wrap">
                {['Matter over Thread', 'Matter Over wifi', 'Zigbee'].map((capacity) => (
                  <button
                    key={capacity}
                    onClick={() => setSelectedCapacity(capacity)}
                    className={`border rounded px-3 py-2 transition-all cursor-pointer ${
                      selectedCapacity === capacity 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 bg-gray-100 hover:border-gray-400'
                    }`}
                  >
                    {capacity}
                  </button>
                ))}
              </div>

            </div>

            {/* Choose Variant Section - Hidden */}
            <div className="mb-6 hidden">
              <h3 className="text-base font-bold text-gray-900 mb-3">Choose Variant</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  connectionType === 'zigbee' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setConnectionType('zigbee')} style={connectionType === 'zigbee' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/src/assets/battary.png" alt="Battery" className="w-4 h-4" />
                    <span className={`text-sm ${
                      connectionType === 'zigbee' ? 'text-black font-bold' : 'text-gray-900 font-semibold'
                    }`}>With Battery</span>
                  </div>
                  <div className="text-xs text-gray-600">Backup power</div>
                </div>
                
                <div className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  connectionType === 'wifi' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setConnectionType('wifi')} style={connectionType === 'wifi' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/src/assets/without_battary.png" alt="Without Battery" className="w-4 h-4" />
                    <span className={`text-sm ${
                      connectionType === 'wifi' ? 'text-black font-bold' : 'text-gray-900 font-semibold'
                    }`}>Without Battery</span>
                  </div>
                  <div className="text-xs text-gray-600">Direct power</div>
                </div>
              </div>
            </div>


            {/* Quantity Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.max(1, newQuantities[0] - 1);
                      setTrackQuantities(newQuantities);
                    }}
                    className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="w-12 h-8 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {trackQuantities[0] || 1}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newQuantities = [...trackQuantities];
                      newQuantities[0] = Math.min(10, (newQuantities[0] || 1) + 1);
                      setTrackQuantities(newQuantities);
                    }}
                    className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Installation and setup */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Installation and setup</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="installation-service" 
                    name="installation" 
                    checked={installationSelected}
                    onChange={(e) => setInstallationSelected(e.target.checked)}
                    className="w-5 h-5 text-black border-gray-300 focus:ring-black mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="installation-service" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Professional Installation Service (TBD)
                    </label>
                    <p className="text-xs text-gray-600 mt-1 font-medium">Our team will contact you for installation services. <span className="text-xs">(To Be Determined)</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <div 
                  onClick={() => setHelpModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 font-medium"
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
              <p className="text-center text-sm text-gray-900 font-semibold mt-2">
                Only {selectedVariant.stock} left in stock - order soon!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-lg p-0 rounded-2xl bg-white shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div style={{ backgroundColor: '#7e8898' }} className="px-6 py-4 relative">
            <button 
              onClick={() => setHelpModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Need Help Deciding?</h2>
                <p className="text-white/80 text-xs">Smart Roller Curtain Features</p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              The Smart Roller Curtain combines convenience, style, and smart-home functionality:
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Automated Operation</h3>
                  <p className="text-xs text-gray-600">Control via app, voice, or remote</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Custom Fit</h3>
                  <p className="text-xs text-gray-600">Supports tube width up to 8 feet</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Smart Home Ready</h3>
                  <p className="text-xs text-gray-600">Works with HomeKit, Google Home, SmartThings</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 113 0v3m0 0V11" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Manual Override</h3>
                  <p className="text-xs text-gray-600">Easily move the curtain manually anytime</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Enhanced Ambience</h3>
                  <p className="text-xs text-gray-600">Smooth, quiet, and premium design</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      

    </Dialog>
  );
}
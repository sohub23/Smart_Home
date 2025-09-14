import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedGangImage, setSelectedGangImage] = useState('');
  const [selectedGangTitle, setSelectedGangTitle] = useState('');
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  // Static mechanical switch products data
  const staticProducts = [
    {
      id: '1-gang',
      title: '1 Gang Light Switch',
      display_name: '1 Gang Mechanical Switch',
      price: 3500,
      image: 'src/assets/light_switch/mechanical_switch/mechanical1.jpg',
      image2: 'src/assets/light_switch/mechanical_switch/mechanical2.jpg',
      image3: 'src/assets/light_switch/mechanical_switch/mechanical3.jpg',
      image4: 'src/assets/light_switch/mechanical_switch/mechanical4.jpg',
      image5: 'src/assets/light_switch/mechanical_switch/mechanical5.jpg',
      image6: 'src/assets/light_switch/mechanical_switch/mechanical6.jpg',
      variants: JSON.stringify([{ price: 3500, discount_price: 0 }]),
      help_text: 'Perfect for single light control',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '2-gang',
      title: '2 Gang Light Switch',
      display_name: '2 Gang Mechanical Switch',
      price: 3800,
      image: 'src/assets/light_switch/mechanical_switch/mechanical1.jpg',
      image2: 'src/assets/light_switch/mechanical_switch/mechanical2.jpg',
      image3: 'src/assets/light_switch/mechanical_switch/mechanical3.jpg',
      image4: 'src/assets/light_switch/mechanical_switch/mechanical4.jpg',
      image5: 'src/assets/light_switch/mechanical_switch/mechanical5.jpg',
      image6: 'src/assets/light_switch/mechanical_switch/mechanical6.jpg',
      variants: JSON.stringify([{ price: 3800, discount_price: 0 }]),
      help_text: 'Control two lights independently',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '3-gang',
      title: '3 Gang Light Switch',
      display_name: '3 Gang Mechanical Switch',
      price: 4000,
      image: 'src/assets/light_switch/mechanical_switch/mechanical1.jpg',
      image2: 'src/assets/light_switch/mechanical_switch/mechanical2.jpg',
      image3: 'src/assets/light_switch/mechanical_switch/mechanical3.jpg',
      image4: 'src/assets/light_switch/mechanical_switch/mechanical4.jpg',
      image5: 'src/assets/light_switch/mechanical_switch/mechanical5.jpg',
      image6: 'src/assets/light_switch/mechanical_switch/mechanical6.jpg',
      variants: JSON.stringify([{ price: 4000, discount_price: 0 }]),
      help_text: 'Control three lights independently',
      engraving_available: true,
      engraving_price: 200
    }
  ];

  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Initialize with static data
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedProduct(staticProducts[0]); // Default to 1 gang
    }
  }, [open]);

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedProduct]);

  const currentProductData = product;
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  const warranty = currentProductData.warranty ? currentProductData.warranty.split('\n').filter(w => w.trim()) : [];
  // Get current price from selected product
  const getCurrentPrice = () => {
    if (!selectedProduct) return 3500; // Default price
    return selectedProduct.price || 299;
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
  

  
  // Get all available images from selected product (using mechanical switch assets)
  const getProductImages = (productData) => {
    if (!productData) return [];
    
    const images = [productData.image, productData.image2, productData.image3, productData.image4, productData.image5, productData.image6].filter(Boolean);
    
    // Add mechanical switch video as first item
    images.unshift('src/assets/light_switch/mechanical_switch/video.mp4');
    
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
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 flex flex-col h-64 lg:h-full lg:max-h-[85vh] relative">
              {/* Main Product Video */}
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
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                
                {/* Mobile Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1)}
                      className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm z-10"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0)}
                      className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm z-10"
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
                    onClick={() => {
                      const newIndex = selectedImage > 0 ? selectedImage - 1 : allImages.length - 1;
                      setSelectedImage(newIndex);
                      if (thumbnailContainerRef.current) {
                        const thumbnail = thumbnailContainerRef.current.children[newIndex] as HTMLElement;
                        thumbnail?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <div ref={thumbnailContainerRef} className="flex gap-3 overflow-x-scroll max-w-xs px-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        onMouseEnter={() => setSelectedImage(index)}
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0 border-2",
                          selectedImage === index ? "border-black shadow-md" : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
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
                            alt={`${product.name} ${index + 1}`} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      const newIndex = selectedImage < allImages.length - 1 ? selectedImage + 1 : 0;
                      setSelectedImage(newIndex);
                      if (thumbnailContainerRef.current) {
                        const thumbnail = thumbnailContainerRef.current.children[newIndex] as HTMLElement;
                        thumbnail?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }
                    }}
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
                {selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || currentProductData.title || currentProductData.display_name || currentProductData.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
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
                              Traditional mechanical switching with reliable tactile feedback
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Available in 1, 2, and 3 gang configurations
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Durable construction for long-lasting performance
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Easy installation with standard wiring
                            </li>
                          </ul>
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Voltage Rating: 250V AC, 10A maximum load per gang
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Mechanical life: 40,000+ switching cycles
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Fire-resistant PC material housing
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Standard 86mm x 86mm wall box compatible
                            </li>
                          </ul>
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
              <h3 className="text-base font-bold text-gray-900 mb-3">Variations</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['one', 'two', 'three'].map((gang) => {
                  const gangNumber = gang === 'one' ? '1' : gang === 'two' ? '2' : gang === 'three' ? '3' : '4';
                  const gangProduct = staticProducts.find(p => 
                    p.id === `${gangNumber}-gang`
                  );
                  
                  const gangPrice = gangProduct?.price || 0;
                  const isAvailable = !!gangProduct;
                  const isSelected = selectedGang === gang;
                  
                  return (
                    <div key={gang} className="text-center">
                      <div 
                        className={`rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden relative ${
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
                        <img 
                          src={`src/assets/light_switch/mechanical_switch/${gangNumber === '1' ? '1gang' : gangNumber + ' gang'}.png`}
                          alt={`${gangNumber} Gang Switch`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGangImage(`src/assets/light_switch/mechanical_switch/${gangNumber === '1' ? '1gang' : gangNumber + ' gang'}.png`);
                            setSelectedGangTitle(`Variations: ${gangNumber} Gang`);
                            setImageModalOpen(true);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <div className={`mt-2 text-xs font-medium ${
                        isSelected ? 'text-[#0a1d3a]' : 'text-gray-700'
                      }`}>{gangNumber} Gang</div>
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
        <DialogContent className="max-w-md p-0 rounded-2xl bg-white shadow-2xl border-0">
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
            {/* Header with Icon */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛠️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Need Help Deciding?</h2>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Choosing the right smart switch can feel tricky — but we've made it simple for you:
            </p>
            
            {/* Switch Options */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">1-Gang Switch</h3>
                  <p className="text-sm text-gray-600">Best for controlling a single light or device.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">2-Gang Switch</h3>
                  <p className="text-sm text-gray-600">Perfect if you want to control two separate lights/devices from the same spot.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">3-Gang Switch</h3>
                  <p className="text-sm text-gray-600">Ideal for larger rooms or multiple circuits where you need more flexibility.</p>
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
            productImage={allImages[selectedImage] || currentProductData.image || ''}
            engravingImage="src/assets/light_switch/engreving.png"
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


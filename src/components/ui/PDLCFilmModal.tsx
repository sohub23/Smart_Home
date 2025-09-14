import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, ArrowLeft, Minus, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

// Progressive loading - text first
const loadPDLCTextData = async () => {
  const { supabase } = await import('@/supabase/client');
  const { data } = await supabase
    .from('products')
    .select('id, title, display_name, price, variants, overview, technical_details, warranty, help_text, help_image_url')
    .ilike('title', '%pdlc%')
    .limit(5);
  return data || [];
};

const loadPDLCImages = async () => {
  const { supabase } = await import('@/supabase/client');
  const { data } = await supabase
    .from('products')
    .select('id, image, additional_images')
    .ilike('title', '%pdlc%')
    .limit(5);
  return data || [];
};

interface PDLCFilmModalProps {
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

export function PDLCFilmModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: PDLCFilmModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [dimensions, setDimensions] = useState([{ height: 0, width: 0, quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const { data: pdlcProducts, isLoading } = useQuery({
    queryKey: ['pdlc-text-data'],
    queryFn: loadPDLCTextData,
    enabled: open
  });

  const { data: pdlcImages } = useQuery({
    queryKey: ['pdlc-images'],
    queryFn: loadPDLCImages,
    enabled: open && !!pdlcProducts?.length,
    staleTime: 10 * 60 * 1000
  });



  useEffect(() => {
    if (open && pdlcProducts?.length) {
      setSelectedImage(0);
      
      const textData = pdlcProducts[0];
      const imageData = pdlcImages?.find(img => img.id === textData.id);
      
      // Combine text and image data
      const combinedProduct = {
        ...textData,
        image: imageData?.image,
        additional_images: imageData?.additional_images
      };
      
      setSelectedProduct(combinedProduct);
      
      let variants = textData.variants;
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
  }, [open, pdlcProducts, pdlcImages]);

  const currentProductData = selectedProduct || product;
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  

  
  // Parse additional images from database
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
    'https://www.youtube.com/watch?v=iSN4hiNOeR8',
    selectedProduct?.image || currentProductData.image,
    ...(Array.isArray(additionalImages) ? additionalImages : [])
  ].filter(Boolean);

  const totalArea = dimensions.reduce((sum, dim) => sum + ((dim.height * dim.width) * (dim.quantity || 1)), 0);
  
  const getTransformer = (area: number) => {
    if (area <= 50) return { name: '30W Transformer', price: 9500, watt: '30W' };
    if (area <= 85) return { name: '50W Transformer', price: 12500, watt: '50W' };
    if (area <= 160) return { name: '100W Transformer', price: 23000, watt: '100W' };
    if (area <= 300) return { name: '200W Transformer', price: 30000, watt: '200W' };
    if (area <= 630) return { name: '500W Transformer', price: 40000, watt: '500W' };
    return { name: '500W+ Transformer', price: 40000, watt: '500W+' };
  };
  
  const getInstallationCharge = (filmAmount: number) => {
    if (filmAmount >= 150000) return 20000;
    if (filmAmount >= 100000) return 15000;
    if (filmAmount >= 50000) return 8000;
    return 5000;
  };
  
  const currentPrice = (selectedVariant?.discount_price && selectedVariant.discount_price > 0 ? selectedVariant.discount_price : selectedVariant?.price) || selectedProduct?.price || currentProductData.price || product.price || 0;
  const transformer = getTransformer(totalArea);
  const filmAmount = totalArea * currentPrice;
  const installationCharge = getInstallationCharge(filmAmount);
  const totalWithTransformer = filmAmount + transformer.price;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Add each glass panel configuration as separate cart item
      const validPanels = dimensions.filter(dim => dim.height > 0 && dim.width > 0 && dim.quantity > 0);
      
      for (let i = 0; i < dimensions.length; i++) {
        const dim = dimensions[i];
        if (dim.height > 0 && dim.width > 0 && dim.quantity > 0) {
          const panelArea = (dim.height * dim.width) * dim.quantity;
          const filmAmount = panelArea * currentPrice;
          const transformer = getTransformer(panelArea);
          const totalPrice = filmAmount + transformer.price;
          
          const cartPayload = {
            productId: `${product.id}_${dim.height}x${dim.width}_qty${dim.quantity}_${Date.now()}_${i}`,
            productName: `${product.name} (${dim.height}' x ${dim.width}' - Qty: ${dim.quantity})`,
            quantity: dim.quantity,
            height: dim.height,
            width: dim.width,
            totalArea: panelArea,
            totalPrice: totalPrice,
            transformer: transformer,
            unitPrice: product.price
          };
          
          await onAddToCart(cartPayload);
          // Small delay to ensure each item is processed
          await new Promise(resolve => setTimeout(resolve, 50));
        }
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
        description: `${validPanels.length} glass panel configuration(s) added to your bag.`,
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
                <div className="w-full h-48 lg:h-auto lg:max-w-lg lg:max-h-[60vh] lg:aspect-square p-2">
                  {allImages[selectedImage]?.includes('youtube.com') ? (
                    <div className="w-full h-full relative rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${allImages[selectedImage].split('v=')[1]?.split('&')[0]}?autoplay=1&mute=1`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : allImages.length > 0 ? (
                    <img
                      src={allImages[selectedImage]}
                      alt={selectedProduct?.title || selectedProduct?.display_name || product.name}
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
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 relative",
                          selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {image?.includes('youtube.com') ? (
                          <div className="w-full h-full bg-black flex items-center justify-center relative">
                            <iframe
                              src={`https://www.youtube.com/embed/${image.split('v=')[1]?.split('&')[0]}?autoplay=1&mute=1`}
                              className="w-full h-full scale-150"
                              frameBorder="0"
                              style={{ pointerEvents: 'none' }}
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={image} 
                            alt={`${selectedProduct?.title || selectedProduct?.name || product.name} ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/smart_switch/3 gang mechanical.webp';
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
              {!isLoading && selectedProduct ? (
                <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-5 leading-tight tracking-tight">
                  {selectedProduct.title || selectedProduct.display_name || selectedProduct.name}
                </h1>
              ) : (
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
              )}
              
              {/* Price Section */}
              {currentPrice && currentPrice > 0 && (
                <div className="mb-5">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-lg lg:text-xl font-bold text-black">
                      {currentPrice.toLocaleString()} BDT
                    </span>
                    <span className="text-base text-gray-600 font-medium">per sq ft</span>
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
              )}
              
              {/* Important Notes */}
              <div className="text-xs text-gray-700 font-medium space-y-1 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-bold">*</span>
                  <span className="font-bold">Requires transformer based on film size</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-bold">*</span>
                  <span className="font-bold">1-year warranty on transformer only</span>
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
                    <div className="pt-4">
                      {activeTab === 'benefits' && (
                        <div className="text-sm text-gray-500">
                          {!isLoading && selectedProduct?.overview ? (
                            <div 
                              className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-gradient-to-r [&_li]:before:from-black [&_li]:before:to-gray-600 [&_li]:before:rounded-full [&_li]:before:mt-1.5 [&_li]:before:flex-shrink-0 [&_li]:before:opacity-80"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedProduct.overview 
                              }}
                            />
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
                            <p className="text-gray-500">Loading technical details...</p>
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
                          ) : currentProductData.warranty ? (
                            <div className="text-sm text-gray-500">
                              {currentProductData.warranty.split('\n').filter(w => w.trim()).map((warrantyItem, index) => (
                                <div key={index} className="flex items-start gap-2 mb-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-black to-gray-600 rounded-full mt-1.5 flex-shrink-0 opacity-80"></span>
                                  <span>{warrantyItem}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">Loading warranty information...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Glass Panel Configuration */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Glass Panel Configuration</h3>
              <div className="space-y-4">
                {dimensions.map((dim, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Height (feet)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={dim.height || ''}
                          onChange={(e) => {
                            const newDimensions = [...dimensions];
                            newDimensions[index].height = parseFloat(e.target.value) || 0;
                            setDimensions(newDimensions);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Width (feet)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={dim.width || ''}
                          onChange={(e) => {
                            const newDimensions = [...dimensions];
                            newDimensions[index].width = parseFloat(e.target.value) || 0;
                            setDimensions(newDimensions);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Quantity
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newDimensions = [...dimensions];
                              newDimensions[index].quantity = Math.max(1, newDimensions[index].quantity - 1);
                              setDimensions(newDimensions);
                            }}
                            className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center">
                            {dim.quantity || 1}
                          </span>
                          <button
                            onClick={() => {
                              const newDimensions = [...dimensions];
                              newDimensions[index].quantity = Math.min(10, (newDimensions[index].quantity || 1) + 1);
                              setDimensions(newDimensions);
                            }}
                            className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {dim.height > 0 && dim.width > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                        <p className="text-xs text-blue-800">
                          <strong>Area:</strong> {((dim.height * dim.width) * (dim.quantity || 1)).toFixed(2)} sq ft
                        </p>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </div>

            {/* PDLC Film Price Breakdown */}
            {totalArea > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Configuration Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">PDLC Film</span>
                      <span className="text-xs text-gray-500">{totalArea.toFixed(2)} sq ft</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{filmAmount.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{transformer.name}</span>
                      <span className="text-xs text-gray-500">Required • {transformer.watt}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{transformer.price.toLocaleString()} BDT</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-bold text-gray-900">{totalWithTransformer.toLocaleString()} BDT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Installation and setup */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-4">Installation and setup</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="pdlc-installation-service" 
                    name="installation" 
                    checked={installationSelected}
                    onChange={(e) => setInstallationSelected(e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="pdlc-installation-service" className="text-sm font-medium text-gray-900 cursor-pointer">
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
              disabled={loading || (selectedVariant && selectedVariant.stock === 0) || totalArea === 0}
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
              ) : (selectedVariant && selectedVariant.stock === 0) ? 'Out of stock' : totalArea === 0 ? 'Configure panels first' : (
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
            {product.stock <= 3 && product.stock > 0 && (
              <p className="text-center text-sm text-black font-medium mt-2">
                Only {product.stock} left in stock - order soon!
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
                <p className="text-white/80 text-xs">PDLC Film Guide</p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              PDLC (Polymer Dispersed Liquid Crystal) film transforms regular glass into smart glass:
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Privacy Control</h3>
                  <p className="text-xs text-gray-600">Switch between transparent and opaque instantly</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Transformer Required</h3>
                  <p className="text-xs text-gray-600">Size depends on total film area</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Custom Sizing</h3>
                  <p className="text-xs text-gray-600">Measured in square feet for precise fit</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7e8898' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Professional Installation</h3>
                  <p className="text-xs text-gray-600">Expert setup for optimal performance</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
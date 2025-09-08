import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { enhancedProductService } from '@/supabase';

interface SmartSecurityBoxModalProps {
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
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

export function SmartSecurityBoxModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: SmartSecurityBoxModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('included');
  const [accessories, setAccessories] = useState<any[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const [accessoryQuantities, setAccessoryQuantities] = useState<{[key: number]: number}>({});
  const [installationSelected, setInstallationSelected] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('SP-01');
  const [sp05Product, setSp05Product] = useState(null);
  const [productDetails, setProductDetails] = useState(product);
  
  useEffect(() => {
    if (open) {
      const fetchProductData = async () => {
        try {
          const allProducts = await enhancedProductService.getProducts();
          
          const sp05 = allProducts?.find(p => 
            (p.title && p.title.toLowerCase().includes('sp-05')) || 
            (p.display_name && p.display_name.toLowerCase().includes('sp-05')) ||
            (p.name && p.name.toLowerCase().includes('sp-05'))
          );
          if (sp05) setSp05Product(sp05);
          
          const sp01Product = allProducts?.find(p => 
            (p.title && p.title.toLowerCase().includes('sp-01')) || 
            (p.display_name && p.display_name.toLowerCase().includes('sp-01')) ||
            (p.name && p.name.toLowerCase().includes('sp-01')) ||
            p.id === product.id
          );
          if (sp01Product) setProductDetails(sp01Product);
          
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };
      
      fetchProductData();
    }
  }, [open, product.id]);
  
  const getProductPrice = (productData) => {
    if (!productData) return 0;
    
    // Check variants first
    let variants = productData.variants;
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
    
    return productData.price || productData.base_price || 0;
  };
  
  const getProductStock = (productData) => {
    if (!productData) return 0;
    
    let variants = productData.variants;
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        variants = [];
      }
    }
    
    if (variants && variants.length > 0) {
      return variants[0].stock || 0;
    }
    
    return productData.stock || 0;
  };
  
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
  
  const modelData = {
    'SP-01': {
      price: getProductPrice(productDetails) || product.price || 0,
      images: getProductImages(productDetails).length > 0 ? getProductImages(productDetails) : [product.image, product.image2, product.image3, product.image4, product.image5].filter(Boolean)
    },
    'SP-05': {
      price: getProductPrice(sp05Product) || 0,
      images: getProductImages(sp05Product)
    }
  };
  
  const currentModel = modelData[selectedModel];
  const currentPrice = currentModel.price;
  const currentImages = currentModel.images;
  const currentStock = selectedModel === 'SP-01' ? getProductStock(productDetails) : getProductStock(sp05Product);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset to default when modal opens
  useEffect(() => {
    if (open) {
      setSelectedModel('SP-01');
      setActiveTab('benefits');
      fetchAccessories();
      setSelectedImage(0);
      console.log('Modal opened with product:', product);
      console.log('Product details state:', productDetails);
    }
  }, [open, productDetails]);

  const fetchAccessories = async () => {
    try {
      // Get categories and all products
      const [categories, allProducts] = await Promise.all([
        enhancedProductService.getCategories(),
        enhancedProductService.getProducts()
      ]);
      
      // Find Security category
      const securityCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('security')
      );
      
      if (!securityCategory) {
        console.log('Security category not found');
        return;
      }
      
      // Filter products in Security category excluding SP-01 and SP-05
      const accessoryProducts = allProducts?.filter(p => {
        const isSecurityCategory = p.category_id === securityCategory.id;
        const name = (p.title || p.display_name || p.name || '').toLowerCase();
        const isNotPanel = !name.includes('sp-01') && !name.includes('sp01') && !name.includes('sp-05') && !name.includes('sp05');
        
        return isSecurityCategory && isNotPanel;
      }) || [];
      
      console.log('Found security accessories:', accessoryProducts);
      
      setAccessories(accessoryProducts.map(p => {
        // Get price from variants or product price
        let productPrice = 0;
        if (p.variants) {
          let variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
          if (variants && variants.length > 0) {
            const firstVariant = variants[0];
            productPrice = firstVariant.discount_price && firstVariant.discount_price > 0 
              ? firstVariant.discount_price 
              : firstVariant.price || 0;
          }
        }
        if (!productPrice) {
          productPrice = p.price || p.base_price || 0;
        }
        
        return {
          id: p.id,
          name: p.title || p.display_name || p.name,
          desc: p.product_overview || p.overview || p.description || 'Security accessory',
          price: productPrice,
          image: p.image || p.main_image
        };
      }));
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setAccessories([]);
    }
  };

  const allImages = currentImages;
  const accessoryTotal = selectedAccessories.reduce((sum, index) => {
    const accessory = accessories[index];
    const qty = accessoryQuantities[index] || 1;
    return sum + (Number(accessory?.price) || 0) * qty;
  }, 0);
  const totalPrice = (currentPrice * quantity) + accessoryTotal;

  const toggleAccessory = (index: number) => {
    const currentQty = accessoryQuantities[index] || 0;
    if (currentQty === 0) {
      setAccessoryQuantities(prev => ({...prev, [index]: 1}));
      setSelectedAccessories(prev => [...prev, index]);
    } else {
      setAccessoryQuantities(prev => ({...prev, [index]: 0}));
      setSelectedAccessories(prev => prev.filter(i => i !== index));
    }
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const variationText = ` - ${selectedModel}`;
      
      const cartPayload = {
        productId: `${product.id}_${Date.now()}`,
        productName: `${product.name}${variationText}`,
        quantity: quantity,
        selectedModel: selectedModel,
        installationCharge: 0,
        totalPrice: currentPrice * quantity,
        unitPrice: currentPrice
      };
      
      // Add main product to cart instantly
      if (addToCart) {
        addToCart({
          id: `${product.id}_${selectedModel}_${Date.now()}`,
          name: `${product.name}${variationText}`,
          price: currentPrice,
          category: 'Security System',
          image: currentImages[0],
          color: `Model: ${selectedModel}`,
          model: selectedModel,
          quantity: quantity
        });
      }
      
      // Add each accessory as separate cart item instantly
      selectedAccessories.forEach(index => {
        const accessory = accessories[index];
        const qty = accessoryQuantities[index] || 1;
        if (addToCart) {
          addToCart({
            id: `${product.id}_accessory_${index}`,
            name: accessory.name,
            price: Number(accessory.price),
            category: 'Security Accessory',
            image: accessory.image,
            color: 'Accessory',
            quantity: qty
          });
        }
      });
      
      // Add installation instantly if selected
      if (installationSelected && addToCart) {
        addToCart({
          id: `${product.id}_installation`,
          name: 'Installation and setup',
          price: 0,
          category: 'Installation Service',
          image: null,
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
                  <img
                    src={currentImages[selectedImage] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                {/* Mobile Navigation Arrows */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : currentImages.length - 1)}
                      className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedImage(selectedImage < currentImages.length - 1 ? selectedImage + 1 : 0)}
                      className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop Thumbnails */}
              {currentImages.length > 1 && (
                <div className="hidden lg:flex items-center gap-3 justify-center mt-6">
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : currentImages.length - 1)}
                    className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <div className="flex gap-3">
                    {currentImages.map((image, index) => (
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
                    onClick={() => setSelectedImage(selectedImage < currentImages.length - 1 ? selectedImage + 1 : 0)}
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
                {selectedModel === 'SP-05' ? (sp05Product?.title || sp05Product?.display_name || sp05Product?.name) : (productDetails?.title || productDetails?.display_name || productDetails?.name)}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-base text-gray-900">
                    {totalPrice.toLocaleString()} BDT
                  </span>
                  {(() => {
                    const currentProductData = selectedModel === 'SP-01' ? productDetails : sp05Product;
                    if (!currentProductData) return null;
                    
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
                      if (firstVariant.discount_price > 0 && firstVariant.discount_price < firstVariant.price) {
                        const originalTotal = (firstVariant.price * quantity) + accessoryTotal;
                        const savings = (firstVariant.price - firstVariant.discount_price) * quantity;
                        
                        return (
                          <>
                            <span className="text-xs text-gray-500 line-through">
                              {originalTotal.toLocaleString()} BDT
                            </span>
                            <span className="text-xs text-green-600">
                              Save {savings.toLocaleString()} BDT
                            </span>
                          </>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="mb-6">
              <Accordion type="single" collapsible className="w-full border-t border-b border-gray-200">
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-left text-sm font-semibold no-underline hover:no-underline py-3">
                    {productDetails?.display_name || productDetails?.title || 'Product description'}
                  </AccordionTrigger>
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
                          onClick={() => setActiveTab('specs')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs ${
                            activeTab === 'specs' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Technical Details
                        </button>
                        <button 
                          onClick={() => setActiveTab('warranty')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs ${
                            activeTab === 'warranty' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Warranty
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      {activeTab === 'benefits' && (
                        <div className="text-sm text-gray-500">
                          <div dangerouslySetInnerHTML={{ __html: (selectedModel === 'SP-05' ? sp05Product : productDetails)?.overview || (selectedModel === 'SP-05' ? sp05Product : productDetails)?.product_overview || (selectedModel === 'SP-05' ? sp05Product : productDetails)?.description || '' }} />
                        </div>
                      )}
                      {activeTab === 'specs' && (
                        <div className="text-sm text-gray-500">
                          <div dangerouslySetInnerHTML={{ __html: (selectedModel === 'SP-05' ? sp05Product : productDetails)?.technical_details || (selectedModel === 'SP-05' ? sp05Product : productDetails)?.specifications || '' }} />
                        </div>
                      )}
                      {activeTab === 'warranty' && (
                        <div className="text-sm text-gray-500">
                          <div dangerouslySetInnerHTML={{ __html: (selectedModel === 'SP-05' ? sp05Product : productDetails)?.warranty || '' }} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedModel === 'SP-01' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedModel('SP-01')} style={selectedModel === 'SP-01' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={getProductImages(productDetails)[0] || product.image} 
                      alt="SP-01" 
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div>
                      <div className={`text-xs ${
                        selectedModel === 'SP-01' ? 'text-black font-bold' : 'text-gray-900 font-medium'
                      }`}>
                        SP-01
                      </div>
                      <div className="text-xs text-gray-600">Standard Security Kit</div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedModel === 'SP-05' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedModel('SP-05')} style={selectedModel === 'SP-05' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={getProductImages(sp05Product)[0] || product.image} 
                      alt="SP-05" 
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div>
                      <div className={`text-xs ${
                        selectedModel === 'SP-05' ? 'text-black font-bold' : 'text-gray-900 font-medium'
                      }`}>
                        SP-05
                      </div>
                      <div className="text-xs text-gray-600">Advanced Security Kit</div>
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
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add Accessories */}
            <div className="mb-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Add Accessories</h3>
                <p className="text-xs text-gray-500">(Optional)</p>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
                
                <div ref={scrollRef} className="overflow-x-auto scrollbar-hide pl-2 pr-10">
                  <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                    {accessories.map((accessory, index) => {
                      const isSelected = (accessoryQuantities[index] || 0) > 0;
                      return (
                        <div key={index} className={`bg-white rounded-lg border p-3 hover:shadow-md transition-all duration-200 relative flex-shrink-0 w-40 ${
                          isSelected ? 'border-black border-2 bg-gray-50' : 'border-gray-200'
                        }`}>
                          {!isSelected && (
                            <button 
                              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors text-white"
                              style={{backgroundColor: '#9ca3af'}}
                              onClick={() => toggleAccessory(index)}
                            >
                              +
                            </button>
                          )}
                          <div className="aspect-square bg-gray-50 rounded-md mb-2 flex items-center justify-center">
                            <img src={accessory.image} alt={accessory.name} className="w-20 h-20 object-contain" />
                          </div>
                          <h4 className="font-bold text-black text-sm mb-1">{accessory.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{accessory.desc.replace(/<[^>]*>/g, '').substring(0, 50)}...</p>
                          <p className="text-xs mb-2">+{Number(accessory.price).toLocaleString()} BDT</p>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-md border border-gray-200 p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentQty = accessoryQuantities[index] || 0;
                                  if (currentQty > 0) {
                                    const newQty = currentQty - 1;
                                    setAccessoryQuantities(prev => ({...prev, [index]: newQty}));
                                    if (newQty === 0 && isSelected) {
                                      setSelectedAccessories(prev => prev.filter(i => i !== index));
                                    }
                                  }
                                }}
                                className="w-5 h-5 rounded text-black flex items-center justify-center text-xs"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-semibold min-w-[1rem] text-center">
                                {accessoryQuantities[index] || 0}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentQty = accessoryQuantities[index] || 0;
                                  const newQty = currentQty + 1;
                                  setAccessoryQuantities(prev => ({...prev, [index]: newQty}));
                                }}
                                className="w-5 h-5 rounded text-black flex items-center justify-center text-xs"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Note: Accessories will be compatible with your selected security system
              </p>
            </div>

            {/* Installation and Setup */}
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
          
          {/* Product Image */}
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl flex items-center justify-center">
            <img
              src={(selectedModel === 'SP-05' ? sp05Product?.help_image_url : productDetails?.help_image_url) || currentImages[0] || product.image}
              alt={(selectedModel === 'SP-05' ? sp05Product?.title : productDetails?.title) || product.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
          
          <div className="p-6">

            
            {/* Help Text from Database */}
            <div 
              className="prose prose-sm max-w-none text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: (selectedModel === 'SP-05' ? sp05Product?.help_text : productDetails?.help_text) || '' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
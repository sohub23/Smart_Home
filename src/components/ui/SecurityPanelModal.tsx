import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useSupabase, enhancedProductService, supabase } from '@/supabase';
import { productService } from '@/supabase/products';

interface SecurityPanelModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    stock: number;
  };
  onAddToCart: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

export function SecurityPanelModal({ open, onOpenChange, product, onAddToCart, addToCart }: SecurityPanelModalProps) {
  const { executeQuery } = useSupabase();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [accessories, setAccessories] = useState<any[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const [accessoryQuantities, setAccessoryQuantities] = useState<{[key: number]: number}>({});
  const [installationSelected, setInstallationSelected] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setActiveTab('benefits');
      fetchAccessories();
      loadSecurityPanelProducts();
      setSelectedProduct(product);
    }
  }, [open, product]);

  const loadSecurityPanelProducts = async () => {
    try {
      // Direct supabase query
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        return;
      }
      
      console.log('All products from database:', allProducts);
      setDynamicProducts(allProducts || []);
      
      if (allProducts && allProducts.length > 0) {
        setSelectedProduct(allProducts[0]);
      }
      
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const fetchAccessories = async () => {
    try {
      // Direct supabase query for accessories
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Accessories fetch error:', error);
        setAccessories([]);
        return;
      }
      
      console.log('Fetched products for accessories:', allProducts);
      
      // Convert database products to accessory format
      const accessoryProducts = (allProducts || []).map(p => ({
        id: p.id,
        name: p.title || p.display_name || 'Unnamed Product',
        desc: p.product_overview || p.overview || 'Database product',
        price: p.base_price || 0,
        image: p.image || p.main_image || '/placeholder.png'
      }));
      
      setAccessories(accessoryProducts);
      
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setAccessories([]);
    }
  };

  const currentProductData = selectedProduct || product;
  
  const getCurrentStock = () => {
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
      return firstVariant.stock || 0;
    }
    
    return currentProductData.stock || product.stock || 0;
  };
  
  const getCurrentPrice = () => {
    if (!currentProductData) return 0;
    
    // Try database fields first
    if (currentProductData.discount_price && currentProductData.discount_price > 0) {
      return currentProductData.discount_price;
    }
    if (currentProductData.base_price) {
      return currentProductData.base_price;
    }
    
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
    
    return currentProductData.price || product.price || 0;
  };
  
  const currentStock = getCurrentStock();
  const currentPrice = getCurrentPrice();
  
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
    currentProductData?.image || currentProductData?.main_image,
    ...(Array.isArray(additionalImages) ? additionalImages : [])
  ].filter(Boolean);
  
  console.log('Current product data:', currentProductData);
  console.log('All images:', allImages);
  
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
      // Add main product
      await onAddToCart({
        productId: currentProductData.id || product.id,
        quantity: quantity,
        totalPrice: currentPrice,
        accessories: []
      });
      
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
          image: '/images/sohub_protect/installation-icon.png',
          color: 'Service',
          quantity: 1
        });
      }
      // Force cart update by triggering event
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }, 100);
      
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[45] bg-black/60" />
      <DialogContent className="max-w-[1200px] max-h-[95vh] overflow-hidden p-0 rounded-2xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid lg:grid-cols-2 gap-0">
          
          {/* Left: Hero Image Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex flex-col">
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full max-w-lg aspect-square">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[selectedImage]}
                    alt={currentProductData.name || product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
            </div>
            
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 justify-center">
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
                        selectedImage === index ? "ring-2 ring-purple-500" : "opacity-70 hover:opacity-100"
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

          {/* Right: Product Details */}
          <div className="p-8 overflow-y-auto max-h-[95vh] bg-white pb-24">
            {/* Product Selection Dropdown */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Product from Database:
              </label>
              <select 
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = dynamicProducts.find(p => p.id === e.target.value);
                  if (product) setSelectedProduct(product);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a product...</option>
                {dynamicProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title || product.display_name} - {product.id}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {currentProductData.title || currentProductData.display_name || currentProductData.name || product.name}
              </h1>
              
              {/* Product Description from Database */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Description</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  {currentProductData?.product_overview ? (
                    <div 
                      className="text-sm text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentProductData.product_overview }}
                    />
                  ) : currentProductData?.overview ? (
                    <div 
                      className="text-sm text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentProductData.overview }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 italic">No product description available in database</p>
                  )}
                </div>
              </div>
              
              {/* Database Debug Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
                <p><strong>DB ID:</strong> {currentProductData.id}</p>
                <p><strong>Category ID:</strong> {currentProductData.category_id || 'None'}</p>
                <p><strong>Subcategory ID:</strong> {currentProductData.subcategory_id || 'None'}</p>
                <p><strong>Status:</strong> {currentProductData.status || 'Unknown'}</p>
                <p><strong>Model:</strong> {currentProductData.model || 'Not specified'}</p>
                <p><strong>Created:</strong> {currentProductData.created_at ? new Date(currentProductData.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {totalPrice.toLocaleString()} BDT
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {Math.round(totalPrice * 1.3).toLocaleString()} BDT
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    Save {Math.round(totalPrice * 0.3).toLocaleString()} BDT
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Tab Section */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">

                  <button 
                    onClick={() => setActiveTab('benefits')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'benefits' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => setActiveTab('specs')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'specs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Specifications
                  </button>
                  <button 
                    onClick={() => setActiveTab('warranty')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'warranty' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Warranty
                  </button>
                </div>
              </div>
              <div className="pt-4">

                {activeTab === 'benefits' && (
                  <div className="text-sm text-gray-700">
                    {(currentProductData?.overview || currentProductData?.product_overview || currentProductData?.description) ? (
                      <div 
                        className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:bg-purple-500 [&_li]:before:rounded-full [&_li]:before:mt-2 [&_li]:before:flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: currentProductData.overview || currentProductData.product_overview || currentProductData.description }}
                      />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-500">No overview/description data</p>
                        <div className="text-xs bg-blue-50 p-2 rounded">
                          <p><strong>Overview:</strong> {currentProductData?.overview || 'Empty'}</p>
                          <p><strong>Product Overview:</strong> {currentProductData?.product_overview || 'Empty'}</p>
                          <p><strong>Description:</strong> {currentProductData?.description || 'Empty'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'specs' && (
                  <div className="text-sm text-gray-700">
                    {currentProductData?.technical_details ? (
                      <div 
                        className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:bg-green-500 [&_li]:before:rounded-full [&_li]:before:mt-2 [&_li]:before:flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: currentProductData.technical_details }}
                      />
                    ) : (
                      <p className="text-center py-4 text-gray-500">No information available</p>
                    )}
                  </div>
                )}
                {activeTab === 'warranty' && (
                  <div className="text-sm text-gray-700">
                    {currentProductData?.warranty ? (
                      <div 
                        className="prose prose-sm max-w-none [&_ul]:list-none [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-2 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:bg-green-500 [&_li]:before:rounded-full [&_li]:before:mt-2 [&_li]:before:flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: currentProductData.warranty }}
                      />
                    ) : (
                      <p className="text-center py-4 text-gray-500">No information available</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
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

            {/* Database Products List */}
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">All Database Products ({dynamicProducts.length})</h3>
                <p className="text-sm text-gray-500">Click to select different products</p>
              </div>
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {dynamicProducts.map((dbProduct, index) => (
                  <div 
                    key={dbProduct.id}
                    onClick={() => setSelectedProduct(dbProduct)}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedProduct?.id === dbProduct.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {dbProduct.title || dbProduct.display_name || 'Untitled'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {dbProduct.id} | Status: {dbProduct.status || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Price: {dbProduct.base_price || dbProduct.price || 0} BDT
                        </p>
                      </div>
                      {selectedProduct?.id === dbProduct.id && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Add Accessories */}
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Accessories</h3>
                <p className="text-sm text-gray-500">(Optional)</p>
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
                              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => toggleAccessory(index)}
                            >
                              +
                            </button>
                          )}
                          <div className="aspect-square bg-gray-50 rounded-md mb-2 flex items-center justify-center">
                            <img src={accessory.image} alt={accessory.name} className="w-20 h-20 object-contain" />
                          </div>
                          <h4 className="font-bold text-blue-600 text-sm mb-1">{accessory.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{accessory.desc}</p>
                          <p className="font-bold text-sm mb-2">+{Number(accessory.price).toLocaleString()} BDT</p>
                          
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
                                className="w-5 h-5 rounded text-white flex items-center justify-center text-xs"
                                style={{backgroundColor: 'rgb(59 130 246)'}}
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
                                className="w-5 h-5 rounded text-white flex items-center justify-center text-xs"
                                style={{backgroundColor: 'rgb(59 130 246)'}}
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
                Note: Accessories will be compatible with your selected security panel
              </p>
            </div>

            {/* Installation and Setup */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Installation and setup
              </label>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="installation-service" 
                    name="installation" 
                    checked={installationSelected}
                    onChange={(e) => setInstallationSelected(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="installation-service" className="font-medium text-gray-900 cursor-pointer">
                      Professional Installation Service (TBD)
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Our team will contact you for installation services. <span className="text-xs">(To Be Determined)</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div 
                  onClick={() => setHelpModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Need help deciding?</span>
                </div>
              </div>
            </div>


          </div>
          
          {/* Fixed Bottom CTA */}
          <div className="fixed bottom-0 right-0 w-[600px] bg-white border-t border-l border-gray-200 p-4 z-[60] shadow-lg">
            <Button
              onClick={handleAddToCart}
              disabled={loading || currentStock === 0}
              className="w-full h-12 text-base font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wide"
            >
              {loading ? 'Adding to cart...' : currentStock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>
            
            {currentStock <= 3 && currentStock > 0 && (
              <p className="text-center text-sm text-orange-600 font-medium mt-2">
                Only {currentStock} left in stock - order soon!
              </p>
            )}
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
          
          <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-2xl flex items-center justify-center">
            {selectedProduct?.help_image_url ? (
              <img
                src={selectedProduct.help_image_url}
                alt={currentProductData.name || product.name}
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
              <p className="text-sm text-gray-600 text-center py-4">
                No help information available for this product.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
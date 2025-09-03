import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { productService } from '@/supabase/products';

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
  
  useEffect(() => {
    const fetchSp05Product = async () => {
      try {
        const products = await productService.getProducts();
        const sp05 = products.find(p => p.name.toLowerCase().includes('sp-05') || p.name.toLowerCase().includes('sp05'));
        setSp05Product(sp05);
      } catch (error) {
        console.error('Error fetching SP-05 product:', error);
      }
    };
    if (open) {
      fetchSp05Product();
    }
  }, [open]);
  
  const modelData = {
    'SP-01': {
      price: 7490,
      images: [product.image, product.image2, product.image3, product.image4, product.image5].filter(Boolean)
    },
    'SP-05': {
      price: 15990,
      images: sp05Product ? [sp05Product.image, sp05Product.image2, sp05Product.image3, sp05Product.image4, sp05Product.image5].filter(Boolean) : []
    }
  };
  
  const currentModel = modelData[selectedModel];
  const currentPrice = currentModel.price;
  const currentImages = currentModel.images;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset to default when modal opens
  useEffect(() => {
    if (open) {
      setSelectedModel('SP-01');
      setActiveTab('included');
      fetchAccessories();
      setSelectedImage(0);
    }
  }, [open]);

  const fetchAccessories = async () => {
    try {
      const products = await productService.getProducts();
      const accessoryProducts = products.filter(p => 
        ['SOS Band', 'Doorbell Button', 'Signal Extender', 'Indoor AI Camera', 'Smoke Detector', 'Gas Detector', 'Shutter Sensor', 'Motion Sensor', 'Door Sensor', 'Vibration Sensor', 'Wireless Siren'].some(name => 
          p.name.toLowerCase().includes(name.toLowerCase())
        )
      );
      
      if (accessoryProducts.length > 0) {
        setAccessories(accessoryProducts.map(p => ({
          name: p.name,
          desc: p.description || 'Security accessory',
          price: p.price,
          image: p.image || '/images/sohub_protect/accesories/default.png'
        })));
      } else {
        // Fallback data if no products found in database
        setAccessories([
          { name: 'SOS Band', desc: 'Emergency panic button', price: 3999, image: '/images/sohub_protect/accesories/B020-SOS-SOS-Band.png' },
          { name: 'Doorbell Button', desc: 'Smart doorbell system', price: 4999, image: '/images/sohub_protect/accesories/doorbell-b100.png' },
          { name: 'Signal Extender', desc: 'Extend wireless range', price: 3499, image: '/images/sohub_protect/accesories/EX010-Signal-extender.png' },
          { name: 'Indoor AI Camera 2.4G/5G', desc: 'HD AI surveillance', price: 8999, image: '/images/sohub_protect/accesories/camera-c11.png' },
          { name: 'Smoke Detector Fire Alarm Sensor', desc: 'Fire safety monitoring', price: 3999, image: '/images/sohub_protect/accesories/smoke-detector.png' },
          { name: 'Gas Detector', desc: 'Gas leak detection', price: 4499, image: '/images/sohub_protect/accesories/GS020-Gas-Detector.png' },
          { name: 'Shutter Sensor', desc: 'Window shutter monitoring', price: 2999, image: '/images/sohub_protect/accesories/shutter_sensor_ss010.png' },
          { name: 'Motion Sensor', desc: 'Advanced motion detection', price: 2999, image: '/images/sohub_protect/accesories/Motion_pr200.png' },
          { name: 'Door Sensor', desc: 'Smart door monitoring', price: 2499, image: '/images/sohub_protect/accesories/door_Sensor_DS200.png' },
          { name: 'Vibration Sensor', desc: 'Vibration detection', price: 3299, image: '/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png' },
          { name: 'Wireless Siren', desc: 'Loud security alert', price: 4999, image: '/images/sohub_protect/accesories/WSR101-Wireless_siren.png' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
      // Use fallback data on error
      setAccessories([
        { name: 'SOS Band', desc: 'Emergency panic button', price: 3999, image: '/images/sohub_protect/accesories/B020-SOS-SOS-Band.png' },
        { name: 'Doorbell Button', desc: 'Smart doorbell system', price: 4999, image: '/images/sohub_protect/accesories/doorbell-b100.png' },
        { name: 'Signal Extender', desc: 'Extend wireless range', price: 3499, image: '/images/sohub_protect/accesories/EX010-Signal-extender.png' },
        { name: 'Indoor AI Camera 2.4G/5G', desc: 'HD AI surveillance', price: 8999, image: '/images/sohub_protect/accesories/camera-c11.png' },
        { name: 'Smoke Detector Fire Alarm Sensor', desc: 'Fire safety monitoring', price: 3999, image: '/images/sohub_protect/accesories/smoke-detector.png' },
        { name: 'Gas Detector', desc: 'Gas leak detection', price: 4499, image: '/images/sohub_protect/accesories/GS020-Gas-Detector.png' },
        { name: 'Shutter Sensor', desc: 'Window shutter monitoring', price: 2999, image: '/images/sohub_protect/accesories/shutter_sensor_ss010.png' },
        { name: 'Motion Sensor', desc: 'Advanced motion detection', price: 2999, image: '/images/sohub_protect/accesories/Motion_pr200.png' },
        { name: 'Door Sensor', desc: 'Smart door monitoring', price: 2499, image: '/images/sohub_protect/accesories/door_Sensor_DS200.png' },
        { name: 'Vibration Sensor', desc: 'Vibration detection', price: 3299, image: '/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png' },
        { name: 'Wireless Siren', desc: 'Loud security alert', price: 4999, image: '/images/sohub_protect/accesories/WSR101-Wireless_siren.png' }
      ]);
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
      const variationText = selectedModel !== 'SP-01' ? ` - ${selectedModel}` : '';
      
      const cartPayload = {
        productId: `${product.id}_${Date.now()}`,
        productName: `${product.name}${variationText}`,
        quantity: quantity,
        selectedModel: selectedModel,
        installationCharge: 0,
        totalPrice: currentPrice * quantity,
        unitPrice: currentPrice
      };
      
      await onAddToCart(cartPayload);
      
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
                    src={currentImages[selectedImage] || '/images/sohub_protect/smart-security-box.png'}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/sohub_protect/smart-security-box.png';
                    }}
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/sohub_protect/smart-security-box.png';
                          }}
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
                {product.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-base text-gray-900">
                    {totalPrice.toLocaleString()} BDT
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {Math.round(totalPrice * 1.3).toLocaleString()} BDT
                  </span>
                  <span className="text-xs text-gray-500">
                    Save {Math.round(totalPrice * 0.3).toLocaleString()} BDT
                  </span>
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
                  <AccordionTrigger className="text-left text-sm font-semibold no-underline hover:no-underline py-3">Product description</AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="border-b border-gray-200">
                      <div className="flex space-x-8">
                        <button 
                          onClick={() => setActiveTab('included')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs ${
                            activeTab === 'included' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          What's Included
                        </button>
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
                      {activeTab === 'included' && (
                        <ul className="space-y-2 text-sm text-gray-500">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Smart Security Hub Unit
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Power Adapter & Backup Battery
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Quick Setup Guide
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Mobile App Access
                          </li>
                        </ul>
                      )}
                      {activeTab === 'benefits' && (
                        <ul className="space-y-2 text-sm text-gray-500">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Complete security hub with central control unit and smart home integration
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Supports up to 50 connected security devices with wireless connectivity
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Built-in backup battery for 24/7 operation and voice control support
                          </li>
                        </ul>
                      )}
                      {activeTab === 'specs' && (
                        <ul className="space-y-2 text-sm text-gray-500">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Connectivity: WiFi 6, Zigbee 3.0, Bluetooth 5.0 with 100m outdoor range
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Power: AC adapter with 8-hour backup battery and low power consumption
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            Dimensions: 200mm x 150mm x 50mm with wall mounting hardware included
                          </li>
                        </ul>
                      )}
                      {activeTab === 'warranty' && (
                        <ul className="space-y-2 text-sm text-gray-500">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            2 Year Service Warranty
                          </li>
                        </ul>
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
                  selectedModel === 'SP-01' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedModel('SP-01')} style={selectedModel === 'SP-01' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs flex items-center gap-2 ${
                      selectedModel === 'SP-01' ? 'text-black font-bold' : 'text-gray-900 font-medium'
                    }`}>
                      SP-01
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Standard Security Kit</div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedModel === 'SP-05' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedModel('SP-05')} style={selectedModel === 'SP-05' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs flex items-center gap-2 ${
                      selectedModel === 'SP-05' ? 'text-black font-bold' : 'text-gray-900 font-medium'
                    }`}>
                      SP-05
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Advanced Security Kit</div>
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
                          <p className="text-xs text-gray-500 mb-2">{accessory.desc}</p>
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
              disabled={loading || product.stock === 0}
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
              ) : product.stock === 0 ? 'Out of stock' : (
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
              src={currentImages[0] || '/images/sohub_protect/smart-security-box.png'}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/sohub_protect/smart-security-box.png';
              }}
            />
          </div>
          
          <div className="p-6">
            {/* Headline */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Need help deciding? We've got you covered</h2>
            </div>
            
            {/* Options */}
            <div className="space-y-6">
              {/* Option 1 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Standard Installation (TBD)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Basic setup with panel installation and system configuration. Perfect for standard security control. Includes wall mounting and basic smart home integration.
                </p>
              </div>
              
              {/* Option 2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Premium Installation (TBD)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Complete professional service with custom security assessment, advanced panel placement, and full smart home ecosystem integration. Includes 3-year service warranty.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
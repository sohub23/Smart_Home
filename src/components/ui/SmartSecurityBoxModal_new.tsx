import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Static data
const staticAccessories = [
  { id: '1', name: 'Shutter Sensor', desc: 'Window and door shutter monitoring sensor', price: 1550, image: '/assets/Security/Accesories/shutter sensor.jpeg' },
  { id: '2', name: 'Wireless Siren', desc: 'High-decibel wireless alarm siren', price: 2600, image: '/assets/Security/Accesories/vivration_sensor.jpeg' },
  { id: '3', name: 'Door Sensor', desc: 'Magnetic door and window sensor', price: 850, image: '/assets/Security/Accesories/door_sensor.jpeg' },
  { id: '4', name: 'Smoke Detector', desc: 'Advanced smoke detection sensor', price: 4500, image: '/assets/Security/Accesories/fire_alarm.jpeg' },
  { id: '5', name: 'Gas Detector', desc: 'LPG and natural gas leak detector', price: 1850, image: '/assets/Security/Accesories/gas_sensor.jpeg' },
  { id: '6', name: 'Motion Sensor', desc: 'PIR motion detection sensor', price: 1200, image: '/assets/Security/Accesories/motion_sensor.jpeg' },
  { id: '7', name: 'Signal Extender', desc: 'Wireless signal range extender', price: 4500, image: '/assets/Security/Accesories/signal_extender.jpeg' },
  { id: '8', name: 'AI Camera', desc: 'Smart AI-powered security camera', price: 3500, image: '/assets/Security/Accesories/ai_camera.jpeg' },
  { id: '9', name: 'SOS Band', desc: 'Emergency panic button wristband', price: 1200, image: '/assets/Security/Accesories/sos_band.jpeg' }
];

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
  const [selectedModel, setSelectedModel] = useState('');
  
  useEffect(() => {
    if (open) {
      setSelectedModel('');
      setAccessories(staticAccessories);
    }
  }, [open]);
  

  
  // Static model data - use database price as base
  const basePrice = product.price || 7490;
  const modelData = {
    'SP-01': {
      price: basePrice,
      images: [
        'https://www.youtube.com/watch?v=XKjPvhZcSWA',
        '/assets/Security/Panel/SP01/model.jpeg',
        '/assets/Security/Panel/SP01/image3.jpeg',
        '/assets/Security/Panel/SP01/sp01.jpeg'
      ],
      name: 'Smart Security Panel SP-01',
      subtitle: 'Standard Security Kit',
      data: {
        overview: '<p><strong>•</strong> Entry-level/home starter kit. Remote control via app, supports many sensors, built-in battery backup.</p>',
        technical_details: '<ul><li><strong>•</strong> Supports up to 96 accessories (sensors, detectors etc.)</li><li><strong>•</strong> Standby ≧ 12 hours on battery during outage</li><li><strong>•</strong> OTA firmware upgrades</li><li><strong>•</strong> Price ~ ৳ 7,490</li></ul>',
        warranty: '<p><strong>•</strong> 1 year service warranty.</p>',
        help_text: '<div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 mb-3">SP-01 Smart Security Box</h3><p class="text-gray-700 mb-3">Ideal for <strong>small to medium homes</strong> looking for reliable security monitoring.</p><div class="bg-blue-50 p-4 rounded-lg mb-4"><h4 class="font-semibold text-blue-900 mb-2">Best suited for:</h4><ul class="text-blue-800 space-y-1"><li>• Apartments and small houses</li><li>• First-time security system users</li><li>• Budget-conscious homeowners</li><li>• Basic monitoring needs</li></ul></div><div class="bg-green-50 p-4 rounded-lg"><h4 class="font-semibold text-green-900 mb-2">Key Benefits:</h4><ul class="text-green-800 space-y-1"><li>• Easy DIY installation</li><li>• Supports up to 96 accessories</li><li>• 12+ hours battery backup</li><li>• Remote app control</li></ul></div></div>'
      }
    },
    'SP-05': {
      price: basePrice + 8500,
      images: [
        'https://www.youtube.com/watch?v=2jh58viBn2g',
        '/assets/Security/Panel/SP05/panel_1.jpeg',
        '/assets/Security/Panel/SP05/panel2.jpeg',
        '/assets/Security/Panel/SP05/sp05.jpeg'
      ],
      name: 'Smart Security Panel SP-05',
      subtitle: 'Advanced Security Kit',
      data: {
        overview: '<p><strong>•</strong> More advanced panel: touchscreen, louder siren, more notifications & phone support, better display.</p>',
        technical_details: '<ul><li><strong>•</strong> 4.3-inch capacitive IPS touch screen</li><li><strong>•</strong> Built-in 115 dB siren & buzzer</li><li><strong>•</strong> Supports setting up 5 phone numbers for alarm SMS/calls</li><li><strong>•</strong> Real-time monitoring & app control; accessory naming etc.</li></ul>',
        warranty: '<p><strong>•</strong> 1 year service warranty.</p>',
        help_text: '<div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 mb-3">SP-05 Security Panel Kit</h3><p class="text-gray-700 mb-3">Perfect for <strong>large homes and commercial spaces</strong> requiring advanced security features.</p><div class="bg-blue-50 p-4 rounded-lg mb-4"><h4 class="font-semibold text-blue-900 mb-2">Best suited for:</h4><ul class="text-blue-800 space-y-1"><li>• Large houses and villas</li><li>• Commercial properties</li><li>• Tech-savvy users</li><li>• Comprehensive security needs</li></ul></div><div class="bg-green-50 p-4 rounded-lg"><h4 class="font-semibold text-green-900 mb-2">Advanced Features:</h4><ul class="text-green-800 space-y-1"><li>• 4.3" touchscreen display</li><li>• 115 dB loud siren</li><li>• 5 phone number alerts</li><li>• Real-time monitoring</li></ul></div></div>'
      }
    }
  };
  
  const defaultImages = [
    product.image,
    product.image2,
    product.image3,
    product.image4,
    product.image5
  ].filter(Boolean);
  
  const currentModel = selectedModel ? modelData[selectedModel] : null;
  const currentPrice = selectedModel ? currentModel.price : basePrice;
  const currentImages = selectedModel ? currentModel.images : defaultImages;
  const currentStock = 10;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset to default when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('benefits');
      setSelectedImage(0);
    }
  }, [open]);

  // Reset image when model changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedModel]);



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
    if (!selectedModel) {
      toast({
        title: "Model Required",
        description: "Please select a model before adding to bag.",
        variant: "destructive"
      });
      return;
    }
    
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
      
      // Get the specific model image for the bag
      const modelSpecificImage = selectedModel && currentImages.length > 0 ? 
        (currentImages.find(img => !img.includes('youtube.com')) || currentImages[0]) : 
        (currentImages[selectedImage] || currentImages[0] || product.image);
      
      const productImage = modelSpecificImage;
      
      // Add main product to cart instantly
      if (addToCart) {
        addToCart({
          id: `${product.id}_${selectedModel}_${Date.now()}`,
          name: `${product.name}${variationText}`,
          price: currentPrice,
          category: product.category || 'Security System',
          image: productImage,
          allImages: currentImages,
          color: `Model: ${selectedModel}`,
          model: selectedModel,
          quantity: quantity,
          selectedImages: currentImages,
          productName: product.name,
          selectedModel: selectedModel,
          basePrice: basePrice,
          totalPrice: currentPrice * quantity
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
          id: `${product.id}_installation_${Date.now()}`,
          name: 'Installation and setup',
          price: 0,
          category: 'Installation Service',
          image: productImage,
          color: 'Service',
          quantity: 1,
          selectedImages: currentImages,
          selectedModel: selectedModel,
          selectedAccessories: selectedAccessories.map(index => accessories[index]),
          productName: product.name,
          installationFor: `${product.name} - ${selectedModel}`
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
                  {currentImages.length > 0 && currentImages[selectedImage] ? (
                    currentImages[selectedImage].includes('youtube.com') ? (
                      <iframe
                        src={currentImages[selectedImage].replace('https://www.youtube.com/watch?v=', 'https://www.youtube.com/embed/')}
                        title={`${selectedModel ? modelData[selectedModel].name : 'Product'} Video`}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={currentImages[selectedImage]}
                        alt={`${selectedModel ? modelData[selectedModel].name : 'Product'} ${selectedImage + 1}`}
                        className="w-full h-full object-contain lg:object-cover rounded-lg"
                      />
                    )
                  ) : null}
                  <div className={`w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center ${currentImages.length > 0 ? 'hidden' : ''}`}>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
                    <span className="text-gray-400 text-sm">{selectedModel ? 'No image' : 'Select a model'}</span>
                  </div>
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
                <div className="flex items-center gap-3 justify-center mt-6">
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
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 relative",
                          selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {image && image.includes('youtube.com') ? (
                          <div className="w-full h-full bg-red-600 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        ) : (
                          <img 
                            src={image} 
                            alt={`${selectedModel ? modelData[selectedModel].name : 'Product'} ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        )}
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
              <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-5 leading-tight tracking-tight">
                {product.name || 'Smart Security System'}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
                    {selectedModel ? (
                      accessoryTotal > 0 || quantity > 1 ? `${totalPrice.toLocaleString()} BDT` : `${currentPrice.toLocaleString()} BDT`
                    ) : (
                      `Starting From ${basePrice.toLocaleString()} BDT`
                    )}
                  </span>
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-gray-800 text-base font-medium mb-6">
                <Truck className="w-5 h-5 text-gray-700" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="mb-6">
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
                          onClick={() => setActiveTab('specs')}
                          className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === 'specs' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          Technical Details
                        </button>
                        <button 
                          onClick={() => setActiveTab('warranty')}
                          className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === 'warranty' ? 'border-black text-black' : 'border-transparent text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          Warranty
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      {activeTab === 'benefits' && (
                        <div className="text-sm text-gray-500">
                          {selectedModel ? (
                            <div dangerouslySetInnerHTML={{ __html: modelData[selectedModel].data.overview }} />
                          ) : (
                            <p>Please select a model to view details.</p>
                          )}
                        </div>
                      )}
                      {activeTab === 'specs' && (
                        <div className="text-sm text-gray-500">
                          {selectedModel ? (
                            <div dangerouslySetInnerHTML={{ __html: modelData[selectedModel].data.technical_details }} />
                          ) : (
                            <p>Please select a model to view technical details.</p>
                          )}
                        </div>
                      )}
                      {activeTab === 'warranty' && (
                        <div className="text-sm text-gray-500">
                          {selectedModel ? (
                            <div dangerouslySetInnerHTML={{ __html: modelData[selectedModel].data.warranty }} />
                          ) : (
                            <p>Please select a model to view warranty information.</p>
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
              <h3 className="text-base font-bold text-gray-900 mb-3">Choose Model</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedModel === 'SP-01' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedModel('SP-01')} style={selectedModel === 'SP-01' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src="/assets/Security/Panel/SP01/model.jpeg" 
                        alt="SP-01" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${
                        selectedModel === 'SP-01' ? 'text-black' : 'text-gray-900'
                      }`}>
                        SP-01
                      </div>
                      <div className="text-xs text-gray-600">Standard Security Kit</div>
                      <div className="text-xs text-gray-500 mt-1">৳ {basePrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedModel === 'SP-05' ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedModel('SP-05')} style={selectedModel === 'SP-05' ? {backgroundColor: '#e8e8ed'} : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src="/assets/Security/Panel/SP05/panel2.jpeg" 
                        alt="SP-05" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${
                        selectedModel === 'SP-05' ? 'text-black' : 'text-gray-900'
                      }`}>
                        SP-05
                      </div>
                      <div className="text-xs text-gray-600">Advanced Security Kit</div>
                      <div className="text-xs text-gray-500 mt-1">৳ {(basePrice + 8500).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-semibold text-gray-900 min-w-[1.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add Accessories */}
            <div className={`mb-4 transition-opacity duration-300 ${!selectedModel ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="mb-3">
                <h3 className="text-base font-bold text-gray-900">Add Accessories</h3>
                <p className="text-xs text-gray-500">{!selectedModel ? 'Select a model first' : '(Optional)'}</p>
              </div>
              
              {accessories.length > 0 ? (
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
                          <div className="aspect-square bg-white rounded-md mb-2 flex items-center justify-center border border-gray-100">
                            {accessory.image ? (
                              <img 
                                src={accessory.image} 
                                alt={accessory.name} 
                                className="w-full h-full object-contain p-2 rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-white rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
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
              ) : (
                <div className="text-center py-8">
                  <span className="text-gray-400">No accessories available</span>
                </div>
              )}
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Note: Accessories will be compatible with your selected security system
              </p>
            </div>

            {/* Installation and Setup */}
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
        <DialogContent className="max-w-2xl p-0 rounded-2xl bg-white shadow-2xl border-0">
          {/* Close Button */}
          <button 
            onClick={() => setHelpModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security System Guide</h2>
                <p className="text-blue-100 text-sm">Choose the right system for your needs</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div 
              className="prose prose-sm max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedModel ? modelData[selectedModel].data.help_text : '<p>Please select a model first.</p>' }}
            />
            
            {/* Contact Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Still need help?
              </h4>
              <p className="text-gray-600 text-sm mb-3">Our security experts are here to help you choose the perfect system.</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Chat with Expert
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Call Us
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
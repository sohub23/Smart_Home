import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Static sensor data
const staticSensors = [
  { id: '1', name: 'Shutter Sensor', desc: 'Window and door shutter monitoring sensor', price: 1550, image: '/assets/Security/Accesories/shutter sensor.jpeg' },
  { id: '2', name: 'Wireless Siren', desc: 'High-decibel wireless alarm siren', price: 2600, image: '/assets/Security/Accesories/vivration_sensor.jpeg' },
  { id: '3', name: 'Door Sensor', desc: 'Magnetic door and window sensor', price: 850, image: '/assets/Security/Accesories/door_sensor.jpeg' },
  { id: '4', name: 'Smoke Detector', desc: 'Advanced smoke detection sensor', price: 4500, image: '/assets/Security/Accesories/fire_alarm.jpeg' },
  { id: '5', name: 'Gas Detector', desc: 'LPG and natural gas leak detector', price: 1850, image: '/assets/Security/Accesories/gas_sensor.jpeg' },
  { id: '6', name: 'Motion Sensor', desc: 'PIR motion detection sensor', price: 1200, image: '/assets/Security/Accesories/motion_sensor.jpeg' },
  { id: '7', name: 'Signal Extender', desc: 'Wireless signal range extender', price: 4500, image: '/assets/Security/Accesories/signal_extender.jpeg' },
  { id: '8', name: 'SOS Band', desc: 'Emergency panic button wristband', price: 1200, image: '/assets/Security/Accesories/sos_band.jpeg' }
];

interface SensorsSelectionModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: any;
  addToCart?: (item: any) => void;
  onAddToCart?: (payload: any) => Promise<void>;
}

export function SensorsSelectionModal({ open, onOpenChange, product, addToCart, onAddToCart }: SensorsSelectionModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('included');
  const [accessories, setAccessories] = useState<any[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const [accessoryQuantities, setAccessoryQuantities] = useState<{[key: number]: number}>({});
  const [installationSelected, setInstallationSelected] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [productDetailModal, setProductDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Static sensor images
  const sensorImages = staticSensors.map(sensor => sensor.image).filter(Boolean);

  // Reset to default when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('overview');
      setSelectedImage(0);
      setAccessories(staticSensors);
    }
  }, [open]);

  const accessoryTotal = selectedAccessories.reduce((sum, index) => {
    const accessory = accessories[index];
    const qty = accessoryQuantities[index] || 1;
    return sum + (Number(accessory?.price) || 0) * qty;
  }, 0);
  const installationPrice = installationSelected ? 0 : 0; // TBD price
  const totalPrice = accessoryTotal + installationPrice;

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
    if (selectedAccessories.length === 0 && !installationSelected) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one sensor or installation service.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Add each accessory as separate cart item instantly
      selectedAccessories.forEach(index => {
        const accessory = accessories[index];
        const qty = accessoryQuantities[index] || 1;
        if (addToCart) {
          addToCart({
            id: accessory.id || `sensor_${index}_${Date.now()}`,
            name: accessory.name,
            price: Number(accessory.price),
            category: 'Security Sensor',
            image: accessory.image,
            color: 'Sensor',
            quantity: qty
          });
        }
      });
      
      // Add installation service if selected
      if (installationSelected && addToCart) {
        addToCart({
          id: `installation_${Date.now()}`,
          name: 'Professional Installation Service',
          price: 0, // TBD price
          category: 'Installation Service',
          image: '/images/services/services.png',
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
      
      const itemCount = selectedAccessories.length + (installationSelected ? 1 : 0);
      toast({
        title: "Added to Bag",
        description: `${itemCount} item(s) added to your bag.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to bag. Please try again.",
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
                    src={accessories[selectedImage]?.image || '/assets/Security/Accesories/motion_sensor.jpeg'}
                    alt={accessories[selectedImage]?.name || "Security Sensors"}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                
                {/* Mobile Navigation Arrows */}
                {accessories.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : accessories.length - 1)}
                      className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedImage(selectedImage < accessories.length - 1 ? selectedImage + 1 : 0)}
                      className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop Thumbnails with Slider */}
              {accessories.length > 1 && (
                <div className="hidden lg:flex justify-center mt-6">
                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-8" id="main-thumbnails" style={{maxWidth: '400px'}}>
                      {accessories.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0",
                            selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                          )}
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        const container = document.getElementById('main-thumbnails');
                        container?.scrollBy({ left: -100, behavior: 'smooth' });
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors border"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const container = document.getElementById('main-thumbnails');
                        container?.scrollBy({ left: 100, behavior: 'smooth' });
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors border"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Product Purchase Panel */}
            <div className="p-4 lg:p-8 bg-white lg:overflow-y-auto lg:max-h-[85vh]">
            {/* Top Section */}
            <div className="mb-6">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">
                Security Sensors
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-base text-gray-900">
                    {totalPrice > 0 || installationSelected ? `${totalPrice.toLocaleString()} BDT` : 'Select items'}
                  </span>
                  {(totalPrice > 0 || installationSelected) && (
                    <span className="text-sm text-green-600 font-semibold">
                      {selectedAccessories.length + (installationSelected ? 1 : 0)} item(s) selected
                    </span>
                  )}
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>



            {/* Add Sensors */}
            <div className="mb-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Select Sensors</h3>
                <p className="text-xs text-gray-500">Choose the sensors you need for your security system</p>
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
                        <div key={index} className={`bg-white rounded-lg border p-3 hover:shadow-md transition-all duration-200 relative flex-shrink-0 w-40 cursor-pointer ${
                          isSelected ? 'border-black border-2 bg-gray-50' : 'border-gray-200'
                        }`} onClick={() => {
                          setSelectedProductDetail(accessory);
                          setDetailImageIndex(0);
                          setProductDetailModal(true);
                        }}>
                          {!isSelected && (
                            <button 
                              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors text-white"
                              style={{backgroundColor: '#9ca3af'}}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAccessory(index);
                              }}
                            >
                              +
                            </button>
                          )}
                          <div className="aspect-square bg-gray-50 rounded-md mb-2 flex items-center justify-center">
                            <img src={accessory.image} alt={accessory.name} className="w-20 h-20 object-contain" />
                          </div>
                          <h4 className="font-bold text-black text-sm mb-1">{accessory.name}</h4>
                          <p className="text-xs mb-2">{Number(accessory.price).toLocaleString()} BDT</p>
                          
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
                Note: Sensors are compatible with most security systems
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
              disabled={loading || (selectedAccessories.length === 0 && !installationSelected)}
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
              ) : (selectedAccessories.length === 0 && !installationSelected) ? 'Add to bag' : (
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
      
      {/* Product Detail Modal */}
      <Dialog open={productDetailModal} onOpenChange={setProductDetailModal}>
        <DialogContent className="max-w-lg p-0 rounded-2xl bg-white shadow-2xl border-0">
          <button 
            onClick={() => setProductDetailModal(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl flex flex-col">
            <div className="flex-1 flex items-center justify-center relative">
              <img
                src={(() => {
                  const images = [selectedProductDetail?.image].filter(Boolean);
                  if (selectedProductDetail?.additional_images) {
                    try {
                      const additional = typeof selectedProductDetail.additional_images === 'string' 
                        ? JSON.parse(selectedProductDetail.additional_images) 
                        : selectedProductDetail.additional_images;
                      if (Array.isArray(additional)) {
                        images.push(...additional.filter(Boolean));
                      }
                    } catch (e) {}
                  }
                  
                  // Add fallback images for testing
                  if (images.length === 1) {
                    images.push(
                      '/images/sohub_protect/accesories/door_Sensor_DS200.png',
                      '/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png'
                    );
                  }
                  
                  return images[detailImageIndex] || '/images/sohub_protect/accesories/Motion_pr200.png';
                })()}
                alt={selectedProductDetail?.name}
                className="w-48 h-48 object-contain rounded-lg"
              />
              
              {(() => {
                const images = [selectedProductDetail?.image].filter(Boolean);
                if (selectedProductDetail?.additional_images) {
                  try {
                    const additional = typeof selectedProductDetail.additional_images === 'string' 
                      ? JSON.parse(selectedProductDetail.additional_images) 
                      : selectedProductDetail.additional_images;
                    if (Array.isArray(additional)) {
                      images.push(...additional.filter(Boolean));
                    }
                  } catch (e) {}
                }
                
                // Add fallback images for testing
                if (images.length === 1) {
                  images.push(
                    '/images/sohub_protect/accesories/door_Sensor_DS200.png',
                    '/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png'
                  );
                }
                
                if (images.length > 1) {
                  return (
                    <>
                      <button
                        onClick={() => setDetailImageIndex(detailImageIndex > 0 ? detailImageIndex - 1 : images.length - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <button
                        onClick={() => setDetailImageIndex(detailImageIndex < images.length - 1 ? detailImageIndex + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </>
                  );
                }
                return null;
              })()}
            </div>
            
            {(() => {
              const images = [selectedProductDetail?.image].filter(Boolean);
              if (selectedProductDetail?.additional_images) {
                try {
                  const additional = typeof selectedProductDetail.additional_images === 'string' 
                    ? JSON.parse(selectedProductDetail.additional_images) 
                    : selectedProductDetail.additional_images;
                  if (Array.isArray(additional)) {
                    images.push(...additional.filter(Boolean));
                  }
                } catch (e) {}
              }
              
              // Add fallback images for testing
              if (images.length === 1) {
                images.push(
                  '/images/sohub_protect/accesories/door_Sensor_DS200.png',
                  '/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png'
                );
              }
              
              if (images.length > 1) {
                return (
                  <div className="flex gap-2 justify-center p-4">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setDetailImageIndex(index)}
                        className={`w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                          detailImageIndex === index ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`${selectedProductDetail?.name} ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedProductDetail?.name}</h2>
            <p className="text-lg font-semibold text-gray-900 mb-4">{selectedProductDetail?.price?.toLocaleString()} BDT</p>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>{selectedProductDetail?.desc}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              src={'/assets/Security/Accesories/motion_sensor.jpeg'}
              alt="Security Sensors"
              className="w-32 h-32 object-cover rounded-lg"
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
                <h3 className="font-bold text-gray-900 mb-2">Basic Sensor Package</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Essential sensors for home security including motion, door, and smoke detectors. Perfect for standard home protection with basic monitoring capabilities.
                </p>
              </div>
              
              {/* Option 2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Complete Sensor Package</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Comprehensive security coverage with all sensor types including gas detection, vibration monitoring, and advanced motion sensors. Ideal for complete home security.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
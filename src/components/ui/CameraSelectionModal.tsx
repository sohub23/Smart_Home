import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Static camera data
const staticCameras = [
  { 
    id: '1', 
    name: 'AI Camera', 
    desc: 'Smart AI-powered security camera with motion detection', 
    price: 3500, 
    image: '/assets/Security/Camera/ai_camera.jpeg',
    additionalImages: [
      '/assets/Security/Camera/camera_1.jpeg',
      '/assets/Security/Camera/camera2.jpeg'
    ]
  }
];

// Add custom styles for text truncation
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

interface CameraSelectionModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: any;
  addToCart?: (item: any) => void;
  onAddToCart?: (payload: any) => Promise<void>;
}

export function CameraSelectionModal({ open, onOpenChange, product, addToCart, onAddToCart }: CameraSelectionModalProps) {
  // Inject styles
  if (typeof document !== 'undefined' && !document.getElementById('camera-modal-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'camera-modal-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
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

  // Static camera images including additional images
  const getAllCameraImages = () => {
    const allImages = [];
    staticCameras.forEach(camera => {
      if (camera.image) allImages.push(camera.image);
      if (camera.additionalImages) {
        allImages.push(...camera.additionalImages);
      }
    });
    return allImages;
  };
  const allCameraImages = getAllCameraImages();

  // Reset to default when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('included');
      setSelectedImage(0);
      setAccessories(staticCameras);
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
        description: "Please select at least one camera or installation service.",
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
        if (addToCart && accessories[index]) {
          addToCart({
            id: accessory.id || `camera_${index}_${Date.now()}`,
            name: accessory.name,
            price: Number(accessory.price),
            category: 'Security Camera',
            image: accessory.image,
            color: 'Camera',
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
                    src={allCameraImages[selectedImage] || '/assets/Security/Accesories/ai_camera.jpeg'}
                    alt="Security Cameras"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                
                {/* Mobile Navigation Arrows */}
                {allCameraImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allCameraImages.length - 1)}
                      className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedImage(selectedImage < allCameraImages.length - 1 ? selectedImage + 1 : 0)}
                      className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop Thumbnails with Slider */}
              {allCameraImages.length > 1 && (
                <div className="hidden lg:flex justify-center mt-6">
                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-8" id="camera-thumbnails" style={{maxWidth: '400px'}}>
                      {allCameraImages.map((image, index) => (
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
                            alt={`Camera ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        const container = document.getElementById('camera-thumbnails');
                        container?.scrollBy({ left: -100, behavior: 'smooth' });
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors border"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const container = document.getElementById('camera-thumbnails');
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
                Security Cameras
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

            {/* Add Cameras */}
            <div className="mb-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Select Cameras</h3>
                <p className="text-xs text-gray-500">Choose the cameras you need for your security system</p>
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
                          <div className="aspect-square bg-gray-50 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                            <img 
                              src={accessory.image} 
                              alt={accessory.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-bold text-black text-sm mb-1 line-clamp-2">{accessory.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{accessory.desc}</p>
                          <div className="mb-2">
                            <span className="text-xs font-bold">{Number(accessory.price).toLocaleString()} BDT</span>
                          </div>
                          
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
                {accessories.length > 0 
                  ? 'Note: Cameras are compatible with most security systems'
                  : `Found ${accessories.length} camera products`
                }
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
                  const images = [selectedProductDetail?.image];
                  if (selectedProductDetail?.additionalImages) {
                    images.push(...selectedProductDetail.additionalImages);
                  }
                  return images[detailImageIndex] || '/assets/Security/Camera/ai_camera.jpeg';
                })()}
                alt={selectedProductDetail?.name}
                className="w-48 h-48 object-contain rounded-lg"
              />
              
              {(() => {
                const images = [selectedProductDetail?.image];
                if (selectedProductDetail?.additionalImages) {
                  images.push(...selectedProductDetail.additionalImages);
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
              const images = [selectedProductDetail?.image];
              if (selectedProductDetail?.additionalImages) {
                images.push(...selectedProductDetail.additionalImages);
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Camera Selection Guide</h2>
                <p className="text-blue-100 text-sm">Choose the right camera for your security needs</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* AI Camera Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Camera Features</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Smart Detection Capabilities:</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• Motion detection with AI recognition</li>
                  <li>• Person and vehicle identification</li>
                  <li>• Real-time alerts and notifications</li>
                  <li>• Night vision with infrared technology</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-green-900 mb-2">Installation Benefits:</h4>
                <ul className="text-green-800 space-y-1">
                  <li>• Easy wireless setup</li>
                  <li>• Mobile app integration</li>
                  <li>• Cloud storage compatibility</li>
                  <li>• Weather-resistant design</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">Best Use Cases:</h4>
                <ul className="text-amber-800 space-y-1">
                  <li>• Home entrance monitoring</li>
                  <li>• Driveway and parking surveillance</li>
                  <li>• Garden and backyard security</li>
                  <li>• Business perimeter protection</li>
                </ul>
              </div>
            </div>
            
            {/* Contact Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Still need help?
              </h4>
              <p className="text-gray-600 text-sm mb-3">Our security experts are here to help you choose the perfect camera system.</p>
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
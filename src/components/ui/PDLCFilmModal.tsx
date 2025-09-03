import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, ArrowLeft, Minus, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

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
  const [showInstallationSetup, setShowInstallationSetup] = useState(false);
  const [installationNotes, setInstallationNotes] = useState('');
  const [installationTBD, setInstallationTBD] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);

  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');



  const features = product.features ? product.features.split('\n').filter(f => f.trim()) : [];
  const specifications = product.specifications ? product.specifications.split('\n').filter(s => s.trim()) : [];
  const allImages = [product.image, product.image2, product.image3, product.image4, product.image5].filter(Boolean);

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
  
  const transformer = getTransformer(totalArea);
  const filmAmount = totalArea * product.price;
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
          const filmAmount = panelArea * product.price;
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
        title: "Added to Cart",
        description: `${validPanels.length} glass panel configuration(s) added to your cart.`,
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col">
            {/* Main Product Image */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full max-w-lg aspect-square">
                <img
                  src={allImages[selectedImage] || '/images/smart_switch/3 gang mechanical.webp'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/smart_switch/3 gang mechanical.webp';
                  }}
                />
              </div>
            </div>
            
            {/* Image Thumbnails */}
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
                        selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                      )}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/smart_switch/3 gang mechanical.webp';
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
          <div className="p-8 overflow-y-auto max-h-[95vh] bg-white">
            {/* Top Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {product.price.toLocaleString()} BDT
                  </span>
                  <span className="text-xs text-gray-500">per sq ft</span>
                  <span className="text-xs text-gray-500 line-through">
                    {Math.round(product.price * 1.3).toLocaleString()} BDT
                  </span>
                  <span className="text-xs text-black font-semibold">
                    Save {Math.round(product.price * 0.3).toLocaleString()} BDT
                  </span>
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-black text-sm font-medium mb-6">
                <Truck className="w-4 h-4" />
                <span>Ships within 3–7 business days | Free shipping</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="mb-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-left font-medium no-underline hover:no-underline">Product description</AccordionTrigger>
                  <AccordionContent>
                    <div className="border-b border-gray-200">
                      <div className="flex space-x-8">
                        <button 
                          onClick={() => setActiveTab('benefits')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'benefits' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Overview
                        </button>
                        <button 
                          onClick={() => setActiveTab('bestfor')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'bestfor' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Technical Details
                        </button>
                        <button 
                          onClick={() => setActiveTab('bonuses')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'bonuses' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Warranty
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      {activeTab === 'benefits' && (
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Smart glass technology with instant opacity control for privacy and light management
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Energy-efficient solution that reduces cooling costs by blocking heat
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Easy installation on existing glass surfaces without replacement
                          </li>
                        </ul>
                      )}
                      {activeTab === 'bestfor' && (
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Voltage: 65V AC (transformer required for safe operation)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Power consumption: 5-7W per sq ft for optimal performance
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Operating temperature: -10°C to +60°C for all weather conditions
                          </li>
                        </ul>
                      )}
                      {activeTab === 'bonuses' && (
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            1 Year Transformer Warranty
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                            Film has no warranty - once applied, cannot be reused
                          </li>
                        </ul>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* PDLC Film Price Breakdown */}
            {totalArea > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Configuration Summary</h4>
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
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-bold text-gray-900">{totalWithTransformer.toLocaleString()} BDT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Glass Panel Configuration */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Glass Panel Configuration</h3>
              <div className="space-y-4">
                {dimensions.map((dim, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Panel {index + 1}</h4>
                      {index > 0 && (
                        <button
                          onClick={() => {
                            setDimensions(dimensions.filter((_, i) => i !== index));
                          }}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
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
                            className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
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
                            className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
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
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setDimensions([...dimensions, { height: 0, width: 0, quantity: 1 }]);
                  }}
                  className="w-full h-10 font-medium border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Glass Panel
                </Button>
              </div>
            </div>

            {/* Installation and setup */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Installation and setup
              </label>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="pdlc-installation-service" 
                    name="installation" 
                    checked={installationSelected}
                    onChange={(e) => setInstallationSelected(e.target.checked)}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="pdlc-installation-service" className="font-medium text-gray-900 cursor-pointer">
                      Professional Installation Service (TBD)
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Our team will contact you for installation services. <span className="text-xs">(To Be Determined)</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div 
                  onClick={() => setHelpModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Need help deciding?</span>
                </div>
              </div>
            </div>



            {/* Collapsed Details */}
            <details className="mb-20">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                View full specifications
              </summary>
              <div className="mt-3 text-sm text-gray-700 space-y-2">
                <p><strong>Specifications:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Smart glass technology with instant opacity control</li>
                  <li>Voltage: 65V AC (transformer required)</li>
                  <li>Power consumption: 5-7W per sq ft</li>
                  <li>Operating temperature: -10°C to +60°C</li>
                  <li>1-year transformer warranty</li>
                </ul>
              </div>
            </details>
          </div>
          
          {/* Fixed Bottom CTA - Right Side Only */}
          <div className="fixed bottom-0 right-0 w-[600px] bg-white border-t border-l border-gray-200 p-4 z-[60] shadow-lg">
            <Button
              onClick={handleAddToCart}
              disabled={loading || product.stock === 0 || totalArea === 0}
              className="w-full h-12 text-base font-bold bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wide"
            >
              {loading ? 'Adding to bag...' : product.stock === 0 ? 'Out of stock' : totalArea === 0 ? 'Configure panels first' : 'Add to bag'}
            </Button>
            
            {/* Stock Status */}
            {product.stock <= 3 && product.stock > 0 && (
              <p className="text-center text-sm text-gray-600 font-medium mt-2">
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
              src={allImages[0] || '/images/smart_switch/3 gang mechanical.webp'}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/smart_switch/3 gang mechanical.webp';
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
                <h3 className="font-bold text-gray-900 mb-2">Standard Installation (+0 BDT)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Basic PDLC film installation with transformer setup. Perfect for small glass panels or single room applications. Includes basic wiring and testing.
                </p>
              </div>
              
              {/* Option 2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Premium Installation (+5,000 BDT)</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Complete professional service with electrical safety check, advanced wiring, and smart home integration. Includes 1-year installation warranty and priority support.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
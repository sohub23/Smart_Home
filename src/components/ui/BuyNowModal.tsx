import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Heart, Star, ArrowLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { EngravingTrigger } from '@/components/ui/EngravingTrigger';
import { EngravingModal } from '@/components/ui/EngravingModal';

interface BuyNowModalProps {
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
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
  onToggleFavorite?: () => void;
}

export function BuyNowModal({ open, onOpenChange, product, onAddToCart, onBuyNow, onToggleFavorite }: BuyNowModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [trackSizes, setTrackSizes] = useState([0]);
  const [dimensions, setDimensions] = useState([{ height: 0, width: 0 }]);
  const [loading, setLoading] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingModalOpen, setEngravingModalOpen] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);

  // Parse features, specifications, and images
  const features = product.features ? product.features.split('\n').filter(f => f.trim()) : [];
  const specifications = product.specifications ? product.specifications.split('\n').filter(s => s.trim()) : [];
  const allImages = [product.image, product.image2, product.image3, product.image4, product.image5].filter(Boolean);

  const totalArea = dimensions.reduce((sum, dim) => sum + (dim.height * dim.width), 0);
  const firstDimension = dimensions[0] || { height: 0, width: 0 };
  
  // Transformer logic for PDLC Film
  const getTransformer = (area: number) => {
    if (area <= 50) return { name: '30W Transformer', price: 9500, watt: '30W' };
    if (area <= 85) return { name: '50W Transformer', price: 12500, watt: '50W' };
    if (area <= 160) return { name: '100W Transformer', price: 23000, watt: '100W' };
    if (area <= 300) return { name: '200W Transformer', price: 30000, watt: '200W' };
    if (area <= 630) return { name: '500W Transformer', price: 40000, watt: '500W' };
    return { name: '500W+ Transformer', price: 40000, watt: '500W+' };
  };
  
  // Installation charge logic
  const getInstallationCharge = (filmAmount: number) => {
    if (filmAmount >= 200000) return 'Site visit required for proposal';
    if (filmAmount >= 150000) return 20000;
    if (filmAmount >= 100000) return 15000;
    if (filmAmount >= 50000) return 8000;
    return 5000; // Minimum installation charge for under 50k
  };
  
  const transformer = (product.category === 'PDLC Film' || product.category === 'Film') ? getTransformer(totalArea) : null;
  const filmAmount = totalArea * product.price;
  const installationCharge = (product.category === 'PDLC Film' || product.category === 'Film') ? getInstallationCharge(filmAmount) : 0;
  
  // Smart Switch installation charge
  const smartSwitchInstallation = (product.category === 'Smart Switch' && includeInstallation && quantity >= 1 && quantity <= 3) ? 2000 : 0;
  
  // Smart Curtain installation charge
  const smartCurtainInstallation = (product.category === 'Smart Curtain' && includeInstallation && trackSizes.length > 0) ? trackSizes.length * 3500 : 0;
  
  const totalWithTransformer = filmAmount + (transformer?.price || 0) + (typeof installationCharge === 'number' ? installationCharge : 0);
  const totalWithInstallation = (product.price * quantity) + smartSwitchInstallation + smartCurtainInstallation;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      if (product.category === 'PDLC Film' || product.category === 'Film') {
        // Add PDLC Film with transformer and installation
        const filmAmount = totalArea * product.price;
        const transformer = getTransformer(totalArea);
        const installationCharge = getInstallationCharge(filmAmount);
        const totalPrice = filmAmount + transformer.price + (typeof installationCharge === 'number' ? installationCharge : 0);
        
        await onAddToCart({
          productId: product.id,
          quantity: 1,
          height: firstDimension.height,
          width: firstDimension.width,
          totalArea: totalArea,
          totalPrice: totalPrice,
          transformer: transformer,
          installationCharge: installationCharge,
          engravingText: engravingText || undefined
        });
      } else {
        await onAddToCart({
          productId: product.id,
          quantity: quantity,
          trackSizes: product.category === 'Smart Curtain' ? trackSizes : undefined,
          installationCharge: product.category === 'Smart Switch' ? smartSwitchInstallation : product.category === 'Smart Curtain' ? smartCurtainInstallation : undefined,
          totalPrice: (product.category === 'Smart Switch' || product.category === 'Smart Curtain') ? totalWithInstallation : undefined,
          engravingText: engravingText || undefined
        });
      }
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Add to cart failed:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      if (product.category === 'PDLC Film' || product.category === 'Film') {
        // Add each dimension as separate item
        for (const dim of dimensions) {
          if (dim.height > 0 && dim.width > 0) {
            await onBuyNow({
              productId: product.id,
              quantity: 1,
              height: dim.height,
              width: dim.width,
              totalArea: dim.height * dim.width,
              engravingText: engravingText || undefined
            });
          }
        }
      } else {
        await onBuyNow({
          productId: product.id,
          quantity: quantity,
          trackSizes: product.category === 'Smart Curtain' ? trackSizes : undefined,
          installationCharge: product.category === 'Smart Switch' ? smartSwitchInstallation : product.category === 'Smart Curtain' ? smartCurtainInstallation : undefined,
          engravingText: engravingText || undefined
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Buy now failed:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[45] bg-black/50" />
      <DialogContent className="max-w-[1100px] max-h-[90vh] overflow-y-auto p-0 rounded-3xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid md:grid-cols-[1fr,1fr] gap-8 p-8">
          {/* Back Button */}
          <div className="md:col-span-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                // Trigger product list modal to reopen
                setTimeout(() => {
                  const event = new CustomEvent('openProductList');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-white hover:bg-gray-600 transition-all duration-300 px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          {/* Left: Images */}
          <div className="flex gap-4 items-start">
            {/* Thumbnail Column */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 w-20 justify-center items-center h-full">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0",
                      selectedImage === index ? "border-black" : "border-gray-200"
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
            )}
            
            {/* Main Image */}
            <div className="flex-1">
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={allImages[selectedImage] || '/images/smart_switch/3 gang mechanical.webp'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/smart_switch/3 gang mechanical.webp';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-4">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">{product.category}</span>
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary" className="text-xs">Low Stock</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price - Apple Style */}
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {(product.category === 'PDLC Film' || product.category === 'Film') ? (
                <>
                  ৳{totalArea > 0 ? totalWithTransformer.toLocaleString() : product.price.toLocaleString()}
                  <span className="text-base font-normal text-gray-500 ml-2">Total</span>
                </>
              ) : (product.category === 'Smart Switch' || product.category === 'Smart Curtain') ? (
                <>
                  ৳{totalWithInstallation.toLocaleString()}
                  <span className="text-base font-normal text-gray-500 ml-2">Total</span>
                </>
              ) : (
                <>৳{(product.price * quantity).toLocaleString()}</>
              )}
              {product.engraving_available && product.engraving_price && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (+৳{product.engraving_price} per switch for customization)
                </span>
              )}
            </div>
            
            {/* PDLC Film Price Breakdown - Apple Style */}
            {(product.category === 'PDLC Film' || product.category === 'Film') && totalArea > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">PDLC Film</span>
                      <span className="text-xs text-gray-500">{totalArea.toFixed(2)} sq ft</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">৳{filmAmount.toLocaleString()}</span>
                  </div>
                  {transformer && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{transformer.name}</span>
                        <span className="text-xs text-gray-500">Required for PDLC control • {transformer.watt}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">৳{transformer.price.toLocaleString()}</span>
                    </div>
                  )}
                  {typeof installationCharge === 'number' && installationCharge > 0 && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Installation</span>
                        <span className="text-xs text-gray-500">Inside Dhaka</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">৳{installationCharge.toLocaleString()}</span>
                    </div>
                  )}
                  {typeof installationCharge === 'string' && (
                    <div className="py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-orange-600">{installationCharge}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">৳{totalWithTransformer.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details Accordion */}
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              {/* Description */}
              {(product.description || product.detailed_description) && (
                <AccordionItem value="description" className="border rounded-lg px-4 mb-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 whitespace-pre-line pb-4">
                    {product.description && (
                      <p className="mb-3">{product.description}</p>
                    )}
                    {product.detailed_description && (
                      <div>{product.detailed_description}</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Features */}
              {features.length > 0 && (
                <AccordionItem value="features" className="border rounded-lg px-4 mt-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Features
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Specifications */}
              {specifications.length > 0 && (
                <AccordionItem value="specifications" className="border rounded-lg px-4 mt-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Specifications
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="text-sm text-gray-700 space-y-2">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          {spec}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Warranty & Installation */}
            <div className="flex gap-3">
              {(product.category === 'PDLC Film' || product.category === 'Film') ? (
                <div className="flex-1 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-900">Warranty</div>
                  <div className="text-sm text-blue-700">1 Year (Transformer only)</div>
                  <div className="text-xs text-blue-600 mt-1">*Film has no warranty - once applied, cannot be reused</div>
                </div>
              ) : (
                product.warranty && (
                  <div className="flex-1 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900">Warranty</div>
                    <div className="text-sm text-blue-700">{product.warranty}</div>
                  </div>
                )
              )}
              {product.installation_included && (
                <div className="flex-1 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-sm font-semibold text-green-900">Installation</div>
                  <div className="text-sm text-green-700">Included</div>
                </div>
              )}
            </div>

            {/* Track Size for Smart Curtains */}
            {product.category === 'Smart Curtain' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p><strong>Important Notes:</strong></p>
                    <p>• Must need 38mm tube pipe</p>
                    <p>• Rail size standard 8 feet or less requires 1 motor</p>
                    <p>• More than 8 feet requires 2 motors</p>
                  </div>
                </div>
                {trackSizes.map((size, index) => (
                  <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Track {index + 1}</h4>
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newSizes = trackSizes.filter((_, i) => i !== index);
                            setTrackSizes(newSizes);
                            setQuantity(newSizes.length);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Curtain Track Size (feet)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        step="0.5"
                        value={size || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const newSizes = [...trackSizes];
                          newSizes[index] = value > 8 ? 8 : value;
                          setTrackSizes(newSizes);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter track size in feet (max 8)"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setTrackSizes([...trackSizes, 0]);
                    setQuantity(trackSizes.length + 1);
                  }}
                  className="w-full h-10 font-medium border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Track
                </Button>
              </div>
            )}

            {/* Height and Width for PDLC Film */}
            {(product.category === 'PDLC Film' || product.category === 'Film') && (
              <div className="space-y-4">
                {dimensions.map((dim, index) => (
                  <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                      {index > 0 && (
                        <button
                          onClick={() => {
                            setDimensions(dimensions.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Height"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Width"
                        />
                      </div>
                    </div>
                    {dim.height > 0 && dim.width > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Area:</strong> {(dim.height * dim.width).toFixed(2)} sq ft
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setDimensions([...dimensions, { height: 0, width: 0 }]);
                  }}
                  className="w-full h-10 font-medium border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            )}

            {/* Quantity - Hide for PDLC Film */}
            {!(product.category === 'PDLC Film' || product.category === 'Film') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Installation Service for Smart Switch */}
            {product.category === 'Smart Switch' && quantity >= 1 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="installation"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    disabled={quantity > 3}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label htmlFor="installation" className={`text-sm font-medium ${quantity > 3 ? 'text-gray-500' : 'text-blue-900'}`}>
                    {quantity <= 3 ? 'Add Installation Service (+৳2,000)' : 'Site visit required for 4+ switches'}
                  </label>
                </div>
                <p className="text-xs text-blue-700 mt-2 ml-7">
                  {quantity <= 3 ? 'Professional installation service inside Dhaka (1-3 switches)' : 'Please contact us for installation of 4 or more switches'}
                </p>
              </div>
            )}

            {/* Installation Service for Smart Curtain */}
            {product.category === 'Smart Curtain' && trackSizes.length > 0 && trackSizes[0] > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="curtain-installation"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="curtain-installation" className="text-sm font-medium text-blue-900">
                    Add Installation Service (+৳{(trackSizes.length * 3500).toLocaleString()})
                  </label>
                </div>
                <p className="text-xs text-blue-700 mt-2 ml-7">
                  Professional installation service inside Dhaka (৳3,500 per curtain)
                </p>
              </div>
            )}



            {/* Actions */}
            <div className="space-y-4 pt-6 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t mt-6 -mx-6 px-6 py-6">
              {/* Engraving - Show only if available */}
              {product.engraving_available && (
                <EngravingTrigger
                  currentText={engravingText}
                  productName={product.name}
                  onClick={() => setEngravingModalOpen(true)}
                />
              )}
              
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0 || (product.category === 'Smart Curtain' && trackSizes[0] === 0) || ((product.category === 'PDLC Film' || product.category === 'Film') && totalArea === 0)}
                className="w-full h-12 font-semibold border-2 border-black bg-black text-white hover:bg-gray-900 hover:border-gray-900 hover:shadow-lg transition-all duration-300 shadow-md"
              >
                {loading ? 'ADDING...' : product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </Button>
              

            </div>
            
            {/* Engraving Modal - Show only if available */}
            {product.engraving_available && engravingModalOpen && (
              <EngravingModal
                open={engravingModalOpen}
                onOpenChange={setEngravingModalOpen}
                productImage={allImages[selectedImage] || product.image || ''}
                engravingImage={product.engraving_image}
                productName={product.name}
                engravingTextColor={product.engraving_text_color}
                initialText={engravingText}
                currentQuantity={quantity}
                onSave={({ text }) => {
                  setEngravingText(text);
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, ArrowLeft, Minus } from 'lucide-react';
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
}

export function PDLCFilmModal({ open, onOpenChange, product, onAddToCart, onBuyNow }: PDLCFilmModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [dimensions, setDimensions] = useState([{ height: 0, width: 0, quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [showInstallationSetup, setShowInstallationSetup] = useState(false);
  const [installationNotes, setInstallationNotes] = useState('');
  const [installationTBD, setInstallationTBD] = useState(false);

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
      <div className="fixed inset-0 z-[45] bg-black/50" />
      <DialogContent className="max-w-[1100px] max-h-[90vh] overflow-hidden p-0 rounded-3xl fixed left-[50%] top-[50%] z-[50] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl border-0">
        <div className="grid md:grid-cols-[1fr,1fr] gap-8 p-8">

          {/* Left: Images */}
          <div className="flex gap-4 items-start">
            {/* Additional Images on Left */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
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
          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-hide">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">PDLC Film</span>
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary" className="text-xs">Low Stock</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {product.price.toLocaleString()} BDT
              <span className="text-base font-normal text-gray-500 ml-2">per sq ft</span>
            </div>
            
            {/* PDLC Film Price Breakdown */}
            {totalArea > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">PDLC Film</span>
                      <span className="text-xs text-gray-500">{totalArea.toFixed(2)} sq ft</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{filmAmount.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{transformer.name}</span>
                      <span className="text-xs text-gray-500">Required for PDLC control • {transformer.watt}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{transformer.price.toLocaleString()} BDT</span>
                  </div>


                  <div className="flex items-center justify-between pt-4">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{totalWithTransformer.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details Accordion */}
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              {(product.description || product.detailed_description) && (
                <AccordionItem value="description" className="border rounded-lg px-4 mb-2">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 whitespace-pre-line pb-4">
                    {product.description && <p className="mb-3">{product.description}</p>}
                    {product.detailed_description && <div>{product.detailed_description}</div>}
                  </AccordionContent>
                </AccordionItem>
              )}

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

              <AccordionItem value="specifications" className="border rounded-lg px-4 mt-2">
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                  Specifications
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Smart glass technology with instant opacity control
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Voltage: 65V AC (transformer required)
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Power consumption: 5-7W per sq ft
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      Operating temperature: -10°C to +60°C
                    </div>
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {spec}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Warranty and Manual in one row */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <AccordionItem value="warranty" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Warranty
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 pb-4">
                    <div className="space-y-2">
                      <p>1 Year (Transformer only)</p>
                      <p className="text-xs text-gray-600">*Film has no warranty - once applied, cannot be reused</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="manual" className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                    Instruction Manual
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      <a 
                        href="/user_manual/Sohub_Protect_Brochure.pdf" 
                        target="_blank" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Manual
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            </Accordion>

            {/* Height and Width Configuration */}
            <div className="space-y-4">
              {dimensions.map((dim, index) => (
                <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Glass Panel {index + 1}</h4>
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
                  <div className="grid grid-cols-3 gap-4">
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
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newDimensions = [...dimensions];
                            newDimensions[index].quantity = Math.max(1, newDimensions[index].quantity - 1);
                            setDimensions(newDimensions);
                          }}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {dim.quantity || 1}
                        </span>
                        <button
                          onClick={() => {
                            const newDimensions = [...dimensions];
                            newDimensions[index].quantity = Math.min(10, (newDimensions[index].quantity || 1) + 1);
                            setDimensions(newDimensions);
                          }}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {dim.height > 0 && dim.width > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Area per panel:</strong> {(dim.height * dim.width).toFixed(2)} sq ft
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Total area:</strong> {((dim.height * dim.width) * (dim.quantity || 1)).toFixed(2)} sq ft
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
                className="w-full h-12 font-semibold border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Glass Panel
              </Button>
              
              <div className="border-4 border-gray-800 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="pdlc-installation-service"
                    checked={showInstallationSetup}
                    onChange={(e) => setShowInstallationSetup(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label htmlFor="pdlc-installation-service" className="text-base font-bold text-gray-900">
                    Installation and Setup (TBD)
                  </label>
                </div>
                {showInstallationSetup && (
                  <p className="text-sm text-gray-700 mt-3 font-semibold leading-relaxed">
                    <strong className="text-gray-900">Note:</strong> Our technical person will contact you for installation service.
                  </p>
                )}
              </div>
            </div>

            {/* Warranty */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="warranty" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                  Warranty
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-700 pb-4">
                  <div className="space-y-2">
                    <p>1 Year (Transformer only)</p>
                    <p className="text-xs text-gray-600">*Film has no warranty - once applied, cannot be reused</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Instruction Manual */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="manual" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline">
                  Instruction Manual
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">Download or view the instruction manual:</p>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <iframe
                        src="/pdfs/pdlc-film-manual.pdf"
                        width="100%"
                        height="300"
                        className="border rounded"
                        title="PDLC Film Manual"
                      >
                        <p className="text-sm text-gray-600">
                          Your browser does not support PDFs. 
                          <a href="/pdfs/pdlc-film-manual.pdf" target="_blank" className="text-blue-600 hover:underline">
                            Download the PDF
                          </a>
                        </p>
                      </iframe>
                    </div>
                    <a 
                      href="/pdfs/pdlc-film-manual.pdf" 
                      target="_blank" 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF Manual
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Actions */}
            <div className="space-y-4 pt-6 sticky bottom-0 bg-white border-t mt-6 -mx-6 px-6 py-6">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0 || totalArea === 0}
                className="w-full h-12 font-semibold border-2 border-black bg-black text-white hover:bg-gray-900 hover:border-gray-900 hover:shadow-lg transition-all duration-300 shadow-md"
              >
                {loading ? 'ADDING...' : product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
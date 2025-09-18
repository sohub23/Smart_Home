import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Minus, Plus, Star, Shield, Truck, Award, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useSupabase, enhancedProductService } from '@/supabase';
import { EngravingTrigger } from '@/components/ui/EngravingTrigger';
import { EngravingModal } from '@/components/ui/EngravingModal';
import { sanitizeForLog } from '@/utils/sanitize';

interface LightSwitchModalProps {
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
    subcategoryProducts?: any[];
  };
  onAddToCart: (payload: any) => Promise<void>;
  onBuyNow: (payload: any) => Promise<void>;
  addToCart?: (item: any) => void;
}

export function LightSwitchModal({ open, onOpenChange, product, onAddToCart, onBuyNow, addToCart }: LightSwitchModalProps) {
  const { executeQuery } = useSupabase();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingModalOpen, setEngravingModalOpen] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedGang, setSelectedGang] = useState('');
  const [gangImageIndex, setGangImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(product.subcategoryProducts?.[0] || product);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedGangImage, setSelectedGangImage] = useState('');
  const [selectedGangTitle, setSelectedGangTitle] = useState('');
  const [selectedSwitchType, setSelectedSwitchType] = useState('');
  // Static light switch products data
  const lightSwitchProducts = [
    {
      id: '1-gang',
      title: '1 Gang Light Switch (Lw1)',
      display_name: '1 Gang Touch Light Switch (Lw1)',
      price: 3600,
      image: '/assets/Mechanical_series/light/white_1gang.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/light/add1.png',
        '/assets/Mechanical_series/light/add2.png',
        '/assets/Mechanical_series/light/add3.png',
        '/assets/Mechanical_series/light/add4.png',
        '/assets/Mechanical_series/light/add5.jpg',
        '/assets/Mechanical_series/light/add6.jpg'
      ]),
      variants: JSON.stringify([{ price: 3600, discount_price: 0 }]),
      help_text: 'Perfect for single light control',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '2-gang',
      title: '2 Gang Light Switch (Lw2)',
      display_name: '2 Gang Touch Light Switch (Lw2)',
      price: 3750,
      image: '/assets/Mechanical_series/light/white_2gang.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/light/add1.png',
        '/assets/Mechanical_series/light/add2.png',
        '/assets/Mechanical_series/light/add3.png',
        '/assets/Mechanical_series/light/add4.png',
        '/assets/Mechanical_series/light/add5.jpg',
        '/assets/Mechanical_series/light/add6.jpg'
      ]),
      variants: JSON.stringify([{ price: 3750, discount_price: 0 }]),
      help_text: 'Control two lights independently',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '3-gang',
      title: '3 Gang Light Switch (Lw3)',
      display_name: '3 Gang Touch Light Switch (Lw3)',
      price: 3900,
      image: '/assets/Mechanical_series/light/whtie_3gang.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/light/add1.png',
        '/assets/Mechanical_series/light/add2.png',
        '/assets/Mechanical_series/light/add3.png',
        '/assets/Mechanical_series/light/add4.png',
        '/assets/Mechanical_series/light/add5.jpg',
        '/assets/Mechanical_series/light/add6.jpg'
      ]),
      variants: JSON.stringify([{ price: 3900, discount_price: 0 }]),
      help_text: 'Control three lights independently',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '4-gang',
      title: '4 Gang Light Switch (Lw4)',
      display_name: '4 Gang Touch Light Switch (Lw4)',
      price: 4050,
      image: '/assets/Mechanical_series/light/white_4gang.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/light/add1.png',
        '/assets/Mechanical_series/light/add2.png',
        '/assets/Mechanical_series/light/add3.png',
        '/assets/Mechanical_series/light/add4.png',
        '/assets/Mechanical_series/light/add5.jpg',
        '/assets/Mechanical_series/light/add6.jpg'
      ]),
      variants: JSON.stringify([{ price: 4050, discount_price: 0 }]),
      help_text: 'Control four lights independently',
      engraving_available: true,
      engraving_price: 200
    }
  ];

  // Static boiler switch products data
  const boilerSwitchProducts = [
    {
      id: '1-gang-boiler',
      title: '1 Gang Boiler Switch (Touch)',
      display_name: '1 Gang Boiler Switch (Touch)',
      price: 3700,
      discount_price: 0,
      image: '/assets/Mechanical_series/boiler/boiler.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/boiler/boiler1.jpg',
        '/assets/Mechanical_series/boiler/boiler2.jpg',
        '/assets/Mechanical_series/boiler/boiler3.jpg',
        '/assets/Mechanical_series/boiler/boiler4.jpg',
        '/assets/Mechanical_series/boiler/boiler5.jpg',
        '/assets/Mechanical_series/boiler/boiler6.jpg'
      ]),
      variants: JSON.stringify([
        { name: 'White', price: 3700, discount_price: 0, color: 'White' }
      ]),
      help_text: 'Perfect for boiler control with safety features',
      engraving_available: true,
      engraving_price: 200
    }
  ];

  // Static fan switch products data
  const fanSwitchProducts = [
    {
      id: '1-gang-fan',
      title: '1 Gang Fan Switch (Touch)',
      display_name: '1 Gang Fan Switch (Touch)',
      price: 3700,
      discount_price: 0,
      image: '/assets/Mechanical_series/fan/white.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/fan/fan1.png',
        '/assets/Mechanical_series/fan/fan2.png',
        '/assets/Mechanical_series/fan/fan3.png',
        '/assets/Mechanical_series/fan/fan4.png'
      ]),
      variants: JSON.stringify([
        { name: 'White', price: 3700, discount_price: 0, color: 'White' },
        { name: 'Gold', price: 3700, discount_price: 0, color: 'Gold' },
        { name: 'Black', price: 3700, discount_price: 0, color: 'Black' }
      ]),
      help_text: 'Perfect for single fan control with variable speed',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '2-gang-fan',
      title: '2 Gang Fan Speed Controller',
      display_name: '2 Gang Fan Speed Controller',
      price: 3850,
      discount_price: 0,
      image: '/assets/Mechanical_series/fan/white.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/fan/fan1.png',
        '/assets/Mechanical_series/fan/fan2.png',
        '/assets/Mechanical_series/fan/fan3.png',
        '/assets/Mechanical_series/fan/fan4.png'
      ]),
      variants: JSON.stringify([
        { name: 'White', price: 3850, discount_price: 0, color: 'White' },
        { name: 'Gold', price: 3850, discount_price: 0, color: 'Gold' },
        { name: 'Black', price: 3850, discount_price: 0, color: 'Black' }
      ]),
      help_text: 'Control two fans independently or fan with light',
      engraving_available: true,
      engraving_price: 200
    },
    {
      id: '3-gang-fan',
      title: '3 Gang Fan Speed Controller',
      display_name: '3 Gang Fan Speed Controller',
      price: 3900,
      discount_price: 3600,
      image: '/assets/Mechanical_series/fan/white.png',
      additional_images: JSON.stringify([
        '/assets/Mechanical_series/fan/fan1.png',
        '/assets/Mechanical_series/fan/fan2.png',
        '/assets/Mechanical_series/fan/fan3.png',
        '/assets/Mechanical_series/fan/fan4.png'
      ]),
      variants: JSON.stringify([
        { name: 'White', price: 3900, discount_price: 3600, color: 'White' },
        { name: 'Gold', price: 4050, discount_price: 3750, color: 'Gold' },
        { name: 'Black', price: 3950, discount_price: 3650, color: 'Black' }
      ]),
      help_text: 'Control three fans independently with advanced features',
      engraving_available: true,
      engraving_price: 200
    }
  ];

  // Get current products based on selected switch type
  const getCurrentProducts = () => {
    switch (selectedSwitchType) {
      case 'fan':
        return fanSwitchProducts;
      case 'boiler':
        return boilerSwitchProducts;
      default:
        return lightSwitchProducts;
    }
  };

  const currentProducts = getCurrentProducts();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Initialize with static data
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedSwitchType('');
      setSelectedColor('');
      setSelectedGang('');
      setSelectedProduct(null);
      setSelectedImage(0);
    }
  }, [open]);

  // Update selected product when switch type changes or gang changes
  useEffect(() => {
    if (selectedSwitchType) {
      const products = getCurrentProducts();
      if (selectedSwitchType === 'boiler' || selectedSwitchType === 'fan') {
        // For boiler and fan switches, just use the first product
        setSelectedProduct(products[0]);
      } else if (selectedSwitchType === 'light') {
        // For light switches, use first product initially, then update based on gang selection
        if (selectedGang) {
          const gangNumber = selectedGang === 'one' ? '1' : selectedGang === 'two' ? '2' : selectedGang === 'three' ? '3' : '4';
          const newProduct = products.find(p => p.id.includes(`${gangNumber}-gang`)) || products[0];
          setSelectedProduct(newProduct);
        } else {
          // Set first product when light switch is selected but no gang is chosen yet
          setSelectedProduct(products[0]);
        }
      }
    }
  }, [selectedSwitchType, selectedGang]);

  // Reset image index when product changes or switch type changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedProduct, selectedSwitchType]);

  const currentProductData = product;
  const features = currentProductData.features ? currentProductData.features.split('\n').filter(f => f.trim()) : [];
  const specifications = currentProductData.specifications ? currentProductData.specifications.split('\n').filter(s => s.trim()) : [];
  const warranty = currentProductData.warranty ? currentProductData.warranty.split('\n').filter(w => w.trim()) : [];
  // Get current price from selected product or starting price
  const getCurrentPrice = () => {
    if (selectedProduct) {
      return selectedProduct.price || 3500;
    }
    // Show starting price from light switch products when modal first opens
    const startingPrice = Math.min(...lightSwitchProducts.map(p => p.price));
    return startingPrice;
  };
  
  // Get starting price for display
  const getStartingPrice = () => {
    const allPrices = [...lightSwitchProducts, ...boilerSwitchProducts, ...fanSwitchProducts].map(p => p.price);
    return Math.min(...allPrices);
  };
  
  const currentPrice = getCurrentPrice();
  
  console.log('Price calculation:', {
    hasSelectedProduct: !!selectedProduct,
    hasVariants: !!(selectedProduct?.variants),
    calculatedPrice: currentPrice
  });
  
  const gangImages = [
    (selectedProduct as any)?.gang_1_image,
    (selectedProduct as any)?.gang_2_image, 
    (selectedProduct as any)?.gang_3_image,
    (selectedProduct as any)?.gang_4_image
  ].filter(Boolean);
  
  const getCurrentGangImage = () => {
    // Use the selected product's main image since we're switching products based on gang selection
    return selectedProduct?.image || selectedProduct?.image2 || selectedProduct?.image3 || selectedProduct?.image4 || selectedProduct?.image5;
  };
  

  
  // Get all available images from selected product (similar to SmartSecurityBoxModal)
  const getProductImages = (productData) => {
    if (!productData) return [];
    
    const images = [];
    
    // No video for any switches, just images
    
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
    
    // Add main product images (image, image2, etc.) after additional images
    const mainImages = [productData.image, productData.image2, productData.image3, productData.image4, productData.image5].filter(Boolean);
    images.push(...mainImages);
    
    return images;
  };
  
  // Get all switch images when no switch is selected, specific images when selected
  const getAllSwitchImages = () => {
    if (selectedSwitchType) {
      return getProductImages(selectedProduct);
    } else {
      // Show all switch images when no switch is selected
      const allSwitchImages = [];
      
      // Add light switch images
      lightSwitchProducts.forEach(product => {
        const images = getProductImages(product);
        allSwitchImages.push(...images);
      });
      
      // Add boiler switch images
      boilerSwitchProducts.forEach(product => {
        const images = getProductImages(product);
        allSwitchImages.push(...images);
      });
      
      // Add fan switch images
      fanSwitchProducts.forEach(product => {
        const images = getProductImages(product);
        allSwitchImages.push(...images);
      });
      
      // Remove duplicates
      return [...new Set(allSwitchImages)];
    }
  };
  
  const allImages = getAllSwitchImages();
  
  console.log('Image debug:', {
    selectedProductId: selectedProduct?.id,
    hasAdditionalImages: !!selectedProduct?.additional_images,
    additionalImagesRaw: selectedProduct?.additional_images,
    totalImages: allImages.length,
    allImages: allImages
  });

  const engravingPrice = engravingText && (selectedProduct?.engraving_price || currentProductData.engraving_price) ? (selectedProduct?.engraving_price || currentProductData.engraving_price) * quantity : 0;
  const totalPrice = (currentPrice * quantity) + engravingPrice;

  const handleAddToCart = async () => {
    // Validation checks
    if (!selectedSwitchType) {
      toast({
        title: "Selection Required",
        description: "Please select a switch type first.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSwitchType === 'light' && !selectedColor) {
      toast({
        title: "Color Selection Required",
        description: "Please select a color for the light switch.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSwitchType === 'light' && selectedColor && !selectedGang) {
      toast({
        title: "Variation Selection Required",
        description: "Please select a variation (gang) for the light switch.",
        variant: "destructive"
      });
      return;
    }

    if ((selectedSwitchType === 'fan' || selectedSwitchType === 'boiler') && !selectedColor) {
      toast({
        title: "Color Selection Required",
        description: `Please select a color for the ${selectedSwitchType} switch.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const switchTypeDisplay = selectedSwitchType === 'light' ? 'Light Switch' : selectedSwitchType === 'fan' ? 'Fan Switch' : selectedSwitchType === 'boiler' ? 'Boiler Switch' : 'Touch Switch';
      
      // Handle different naming for different switch types
      let productName = '';
      if (selectedSwitchType === 'light') {
        const gangDisplay = selectedGang === 'one' ? '1' : selectedGang === 'two' ? '2' : selectedGang === 'three' ? '3' : '4';
        productName = `${switchTypeDisplay} - ${gangDisplay} Gang${selectedColor ? ` (${selectedColor})` : ''}${engravingText ? ` - Engraved: "${engravingText}"` : ''}`;
      } else if (selectedSwitchType === 'boiler') {
        productName = `${switchTypeDisplay}${selectedColor ? ` (${selectedColor})` : ''}${engravingText ? ` - Engraved: "${engravingText}"` : ''}`;
      } else if (selectedSwitchType === 'fan') {
        productName = `${switchTypeDisplay}${selectedColor ? ` (${selectedColor})` : ''}${engravingText ? ` - Engraved: "${engravingText}"` : ''}`;
      }
      
      if (addToCart) {
        addToCart({
          id: `${selectedProduct?.id || product.id}_${selectedSwitchType}_${selectedColor}_${selectedGang || 'single'}`,
          name: productName,
          price: currentPrice,
          category: product.category,
          image: selectedProduct?.image || getCurrentGangImage() || product.image || '',
          color: selectedColor || 'Default',
          quantity: quantity,
          selectedSwitchType: selectedSwitchType,
          selectedGang: selectedGang || (selectedSwitchType === 'boiler' || selectedSwitchType === 'fan' ? 'single' : ''),
          selectedColor: selectedColor,
          engravingText: engravingText,
          switchTypeDisplay: switchTypeDisplay,
          totalPrice: totalPrice
        });
      } else {
        await onAddToCart({
          productId: selectedProduct?.id || product.id,
          productName: productName,
          quantity: quantity,
          installationCharge: 0,
          engravingText: engravingText || undefined,
          selectedSwitchType: selectedSwitchType,
          selectedGang: selectedGang || (selectedSwitchType === 'boiler' || selectedSwitchType === 'fan' ? 'single' : ''),
          selectedColor: selectedColor,
          switchTypeDisplay: switchTypeDisplay,
          totalPrice: currentPrice
        });
      }
      
      // Add installation service if selected
      if (installationSelected && addToCart) {
        addToCart({
          id: `${product.id}_installation`,
          name: 'Installation and setup',
          price: 0,
          category: 'Installation Service',
          image: selectedProduct?.image || getCurrentGangImage() || allImages[selectedImage] || '/images/sohub_protect/installation-icon.png',
          color: 'Service',
          quantity: 1,
          selectedImages: allImages,
          selectedSwitchType: selectedSwitchType,
          selectedColor: selectedColor,
          selectedGang: selectedGang
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
      console.error('Add to cart failed:', sanitizeForLog(error));
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
              {/* Main Product Video */}
              <div className="flex-1 flex items-center justify-center relative lg:min-h-0">
                <div className="w-full h-48 lg:h-auto lg:max-w-lg lg:max-h-[60vh] lg:aspect-square">
                  {allImages[selectedImage]?.endsWith('.mp4') ? (
                    <video
                      src={allImages[selectedImage]}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain lg:object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={allImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
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
                  
                  <div className="flex gap-3 overflow-x-auto max-w-md scrollbar-hide">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        onMouseEnter={() => setSelectedImage(index)}
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0",
                          selectedImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {image.endsWith('.mp4') ? (
                          <video 
                            src={image} 
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                            onMouseEnter={(e) => e.target.play()}
                            onMouseLeave={(e) => e.target.pause()}
                          />
                        ) : (
                          <img 
                            src={image} 
                            alt={`${product.name} ${index + 1}`} 
                            className="w-full h-full object-cover"
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
              <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-5 leading-tight tracking-tight">
                {selectedSwitchType === 'light' ? 'Light Switch' : 
                 selectedSwitchType === 'fan' ? 'Fan Switch' : 
                 selectedSwitchType === 'boiler' ? 'Boiler Switch' : 
                 selectedProduct?.title || selectedProduct?.display_name || selectedProduct?.name || currentProductData.title || currentProductData.display_name || currentProductData.name}
              </h1>
              
              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-lg lg:text-xl font-bold text-black">
                    {!selectedProduct ? `Starting from ${currentProductData.price?.toLocaleString() || '3,500'}` : totalPrice.toLocaleString()} BDT
                  </span>
                  {(() => {
                    // Check if variants exist and parse them
                    let variants = selectedProduct?.variants;
                    if (typeof variants === 'string') {
                      try {
                        variants = JSON.parse(variants);
                      } catch (e) {
                        variants = [];
                      }
                    }
                    
                    // Get first variant for discount calculation
                    const firstVariant = variants && variants.length > 0 ? variants[0] : null;
                    
                    if (firstVariant && firstVariant.discount_price > 0 && firstVariant.discount_price < firstVariant.price) {
                      const originalTotal = (firstVariant.price * quantity) + engravingPrice;
                      const savings = (firstVariant.price - firstVariant.discount_price) * quantity;
                      
                      return (
                        <>
                          <span className="text-xs text-gray-500 line-through">
                            {originalTotal.toLocaleString()} BDT
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            Save {savings.toLocaleString()} BDT
                          </span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
                {(selectedProduct?.engraving_available || currentProductData.engraving_available) && (selectedProduct?.engraving_price || currentProductData.engraving_price) && (
                  <p className="text-sm text-gray-600">+{selectedProduct?.engraving_price || currentProductData.engraving_price} BDT for customization</p>
                )}
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-gray-800 text-base font-medium mb-6">
                <Truck className="w-5 h-5 text-gray-700" />
                <span>Ships within 3–7 business days | Free shipping</span>
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
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Works with all smart home systems
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Available in 1, 2, and 3 gang options
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Sleek glass design with touch control
                            </li>
                          </ul>
                        </div>
                      )}
                      {activeTab === 'bestfor' && (
                        <div className="text-sm text-gray-500">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              110-240V AC, up to 10A per gang
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              IP35 rated, tempered glass front
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              Tested for 100,000+ operations
                            </li>
                          </ul>
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
                          ) : warranty.length > 0 ? (
                            <ul className="space-y-2">
                              {warranty.map((warrantyItem, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {warrantyItem}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                1 Year Service Warranty
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Switches Section */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Switches</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSelectedSwitchType('light')}
                    className={`w-24 h-24 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden flex items-center justify-center ${
                      selectedSwitchType === 'light' ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <img 
                      src="/assets/Mechanical_series/light/light_switch.png"
                      alt="Touch Light Switch"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`mt-2 text-xs font-medium text-center ${
                    selectedSwitchType === 'light' ? 'text-[#0a1d3a]' : 'text-gray-700'
                  }`}>Light Switch</div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSelectedSwitchType('fan')}
                    className={`w-24 h-24 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden flex items-center justify-center ${
                      selectedSwitchType === 'fan' ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <img 
                      src="/assets/Mechanical_series/fan/white.png"
                      alt="Touch Fan Switch"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className={`mt-2 text-xs font-medium text-center ${
                    selectedSwitchType === 'fan' ? 'text-[#0a1d3a]' : 'text-gray-700'
                  }`}>Fan Switch</div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSelectedSwitchType('boiler')}
                    className={`w-24 h-24 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden flex items-center justify-center ${
                      selectedSwitchType === 'boiler' ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <img 
                      src="/assets/Mechanical_series/boiler/boiler.png"
                      alt="Boiler Switch"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`mt-2 text-xs font-medium text-center ${
                    selectedSwitchType === 'boiler' ? 'text-[#0a1d3a]' : 'text-gray-700'
                  }`}>Boiler Switch</div>
                </div>
                <div></div>
              </div>
            </div>

            {/* Color Section */}
            {selectedSwitchType && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Colors</h3>
                <div className="flex gap-4">
                  {(selectedSwitchType === 'light' ? ['White', 'Golden', 'Black', 'Silver'] : 
                   selectedSwitchType === 'fan' ? ['White', 'Gold', 'Black', 'Silver'] : 
                   ['White']).map((color) => {
                    const isSelected = selectedColor === color;
                    const getColorStyle = (colorName) => {
                      switch (colorName) {
                        case 'White': return 'bg-white border-2 border-gray-300';
                        case 'Golden': return 'bg-gradient-to-br from-yellow-300 to-yellow-500';
                        case 'Gold': return 'bg-gradient-to-br from-yellow-300 to-yellow-500';
                        case 'Black': return 'bg-black';
                        case 'Silver': return 'bg-gradient-to-br from-gray-300 to-gray-500';
                        default: return 'bg-gray-200';
                      }
                    };
                    
                    return (
                      <div key={color} className="flex flex-col items-center gap-2">
                        <div 
                          className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${getColorStyle(color)} ${
                            isSelected ? 'ring-2 ring-[#0a1d3a] ring-offset-2' : 'hover:scale-110'
                          }`}
                          onClick={() => setSelectedColor(color)}
                        ></div>
                        <div className={`text-xs font-medium ${
                          isSelected ? 'text-[#0a1d3a]' : 'text-gray-700'
                        }`}>{color}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variation Section - Show when light switch is selected but inactive until color is selected */}
            {selectedSwitchType === 'light' && (
              <div className="mb-4">
                <h3 className={`text-base font-bold mb-3 ${!selectedColor ? 'text-gray-400' : 'text-gray-900'}`}>Variations</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['one', 'two', 'three', 'four'].map((gang) => {
                    const gangNumber = gang === 'one' ? '1' : gang === 'two' ? '2' : gang === 'three' ? '3' : '4';
                    const gangProduct = currentProducts.find(p => 
                      p.id.includes(`${gangNumber}-gang`)
                    );
                    
                    const gangPrice = gangProduct?.price || 0;
                    const isAvailable = !!gangProduct;
                    const isSelected = selectedGang === gang && selectedGang !== '';
                    
                    return (
                      <div key={gang} className="flex flex-col items-center">
                        <div 
                          className={`w-24 h-24 rounded-xl border-2 transition-all duration-200 overflow-hidden relative flex items-center justify-center ${
                            !selectedColor ? 'border-gray-200 bg-white cursor-not-allowed' :
                            isSelected ? 'border-[#0a1d3a] bg-[#0a1d3a]/5 shadow-md cursor-pointer' : 
                            isAvailable ? 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer hover:shadow-md' : 
                            'border-gray-100 bg-gray-50 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (selectedColor && isAvailable && gangProduct) {
                              setSelectedGang(gang);
                              setSelectedProduct(gangProduct);
                            }
                          }}
                        >
                          <img 
                            src={`/assets/Mechanical_series/light/${gangNumber === '3' && (selectedColor?.toLowerCase() === 'white' || !selectedColor) ? 'whtie' : selectedColor ? (selectedColor === 'Golden' ? 'golden' : selectedColor.toLowerCase()) : 'white'}_${gangNumber}gang.png`}
                            alt={`${gangNumber} Gang Switch`}
                            className="w-full h-full object-contain"
                          />
                          {!selectedColor && (
                            <div className="absolute inset-0 bg-gray-200/50">


                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />

                            </div>
                          )}
                          {selectedColor && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGangImage(`/assets/Mechanical_series/light/${gangNumber === '3' && selectedColor?.toLowerCase() === 'white' ? 'whtie' : selectedColor === 'Golden' ? 'golden' : selectedColor.toLowerCase()}_${gangNumber}gang.png`);
                                setSelectedGangTitle(`Variations: ${gangNumber} Gang`);
                                setImageModalOpen(true);
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                            >
                              <Eye className="w-3 h-3 text-gray-600" />
                            </button>
                          )}
                        </div>
                        <div className={`mt-2 text-xs font-medium text-center ${
                          !selectedColor ? 'text-gray-400' :
                          isSelected ? 'text-[#0a1d3a]' : 'text-gray-700'
                        }`}>{gangNumber} Gang</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}




            {/* Quantity Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Installation and setup */}
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
              disabled={loading || (selectedVariant && selectedVariant.stock === 0)}
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
              ) : (selectedVariant && selectedVariant.stock === 0) ? 'Out of stock' : (
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
            {selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0 && (
              <p className="text-center text-sm text-black font-medium mt-2">
                Only {selectedVariant.stock} left in stock - order soon!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl bg-white shadow-2xl border-0">
          {/* Close Button */}
          <button 
            onClick={() => setHelpModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            {/* Header with Icon */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛠️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Need Help Deciding?</h2>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Choosing the right smart switch can feel tricky — but we've made it simple for you:
            </p>
            
            {/* Switch Options */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">1-Gang Switch</h3>
                  <p className="text-sm text-gray-600">Best for controlling a single light or device.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">2-Gang Switch</h3>
                  <p className="text-sm text-gray-600">Perfect if you want to control two separate lights/devices from the same spot.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">3-Gang Switch</h3>
                  <p className="text-sm text-gray-600">Ideal for larger rooms or multiple circuits where you need more flexibility.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl bg-white shadow-2xl border-0">
          <button 
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedGangTitle}</h2>
            <img
              src={selectedGangImage}
              alt="Gang Switch"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Engraving Modal */}
      {engravingModalOpen && (
        <>
          <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" />
          <EngravingModal
            open={engravingModalOpen}
            onOpenChange={setEngravingModalOpen}
            productImage={allImages[selectedImage] || currentProductData.image || ''}
            engravingImage={selectedSwitchType === 'fan' ? '/assets/Fan_switch/touch/fan_engreving.png' : selectedSwitchType === 'boiler' ? '/assets/Boiler_switch/boiler_engreving.png' : '/assets/light_switch/touch_switch/light_engreving.png'}
            productName={selectedProduct?.name || currentProductData.name}
            engravingTextColor={selectedProduct?.engraving_text_color || currentProductData.engraving_text_color}
            initialText={engravingText}
            currentQuantity={quantity}
            onSave={({ text }) => {
              setEngravingText(text);
            }}
          />
        </>
      )}
    </Dialog>
  );
}

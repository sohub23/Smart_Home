"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { BuyNowModal } from "@/components/ui/BuyNowModal";
import { SliderCurtainModal } from "@/components/ui/SliderCurtainModal";
import { RollerCurtainModal } from "@/components/ui/RollerCurtainModal";
import { PDLCFilmModal } from "@/components/ui/PDLCFilmModal";
import { SohubProtectModal } from "@/components/ui/SohubProtectModal";
import { SmartSecurityBoxModal } from "@/components/ui/SmartSecurityBoxModal";
import { SecurityPanelModal } from "@/components/ui/SecurityPanelModal";
import { SmartSwitchModal } from "@/components/ui/SmartSwitchModal";
import { productData } from "@/lib/productData";

import { ServicesModal } from "@/components/ui/ServicesModal";
import { InstallationModal } from "@/components/ui/InstallationModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Truck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSupabase, productService, categoryService } from "@/supabase";
import { orderService } from "@/supabase/orders";
import { useNavigate } from "react-router-dom";
import { SaveEmailModal } from "@/components/ui/SaveEmailModal";
import { Mail, Printer } from "lucide-react";
import { sanitizeLogInput, sanitizeDbInput } from "@/utils/sanitize";
import { useMemo, useCallback } from "react";

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    color: string;
}

interface CartItem extends Product {
    quantity: number;
    trackSize?: number;
    trackSizes?: number[];
    height?: number;
    width?: number;
    installationCharge?: number;
    accessories?: any[];
}

interface InteractiveCheckoutProps {
    products?: Product[];
}

const defaultProducts: Product[] = [
    {
        id: "1",
        name: "Smart Switch",
        price: 2500,
        category: "Switch",
        image: "/images/smart_switch/3 gang mechanical.webp",
        color: "White",
    },
    {
        id: "2",
        name: "Smart Curtain",
        price: 25000,
        category: "Curtain",
        image: "/assets/hero-sliding-curtain.jpg",
        color: "Gray",
    },
    {
        id: "3",
        name: "Security",
        price: 8500,
        category: "Security",
        image: "/assets/gallery-1.jpg",
        color: "Black",
    },
    {
        id: "4",
        name: "PDLC Film",
        price: 15000,
        category: "Film",
        image: "/assets/window.jpeg",
        color: "Clear",
    },
];

// Helper function to safely parse price
const safeParsePrice = (priceString: string): number => {
    const parsed = parseInt(priceString.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
};

// Helper function to transform product data for modals
const transformProductForModal = (selectedVariant: any, dbProducts: any[]) => {
    const sanitizedId = sanitizeDbInput(selectedVariant.id);
    const productData = dbProducts.find(p => p.id === sanitizedId);
    return {
        id: sanitizedId,
        name: selectedVariant.name,
        category: selectedVariant.gangType || 'Product',
        price: safeParsePrice(selectedVariant.price),
        description: productData?.description || '',
        detailed_description: productData?.detailed_description || '',
        features: productData?.features || '',
        specifications: productData?.specifications || '',
        warranty: productData?.warranty || '',
        installation_included: productData?.installation_included || false,
        image: selectedVariant.imageUrl,
        image2: productData?.image2 || '',
        image3: productData?.image3 || '',
        image4: productData?.image4 || '',
        image5: productData?.image5 || '',
        stock: productData?.stock || 0
    };
};

// Helper function to determine modal type
const getModalType = (category: string, productName: string) => {
    if (category === 'Curtain') {
        return productName.toLowerCase().includes('roller') ? 'roller' : 'slider';
    }
    if (category === 'Security') {
        if (productName.includes('Smart Security Box') || productName.includes('SP-01')) return 'securityBox';
        if (productName.includes('Security Panel') || productName.includes('SP-05')) return 'securityPanel';
        return 'sohubProtect';
    }
    return category.toLowerCase();
};

const getCategoryProducts = (dbProducts: any[], categoryImages: any[]) => {
    const categories = ['Curtain', 'Switch', 'Security', 'PDLC Film', 'Services'];
    return categories.map((category, index) => {
        // Handle both 'Film' and 'PDLC Film' for category images
        const categoryImagesForCategory = categoryImages.filter(img => 
            img.category === category || 
            (category === 'PDLC Film' && (img.category === 'Film' || img.category === 'PDLC Film')) ||
            (category === 'Curtain' && (img.category === 'Smart Curtain' || img.category === 'Curtain')) ||
            (category === 'Switch' && (img.category === 'Smart Switch' || img.category === 'Switch')) ||
            (category === 'Security' && img.category === 'Security')
        );
        const firstCategoryImage = categoryImagesForCategory[0];
        
        // Handle both 'Film' and 'PDLC Film' for products
        const categoryFilter = category === 'PDLC Film' ? ['Film', 'PDLC Film'] : 
                             category === 'Curtain' ? ['Smart Curtain', 'Curtain'] : 
                             category === 'Switch' ? ['Smart Switch', 'Switch'] : [category];
        const categoryProducts = dbProducts.filter(p => categoryFilter.includes(p.category));
        const firstProduct = categoryProducts[0];
        
        const getImageForCategory = () => {
            if (category === 'Services') return '/images/services/services.png';
            return firstCategoryImage?.image_url || firstProduct?.image || '/images/smart_switch/3 gang mechanical.webp';
        };
        
        return {
            id: (index + 1).toString(),
            name: category,
            price: category === 'Services' ? 0 : (firstProduct?.price || 0),
            category: category,
            image: getImageForCategory(),
            color: category === 'Services' ? 'Available' : 'Available'
        };
    });
};



function InteractiveCheckout({
    products = defaultProducts,
}: InteractiveCheckoutProps) {
    const { loading, executeQuery } = useSupabase();
    const navigate = useNavigate();
    const [dbProducts, setDbProducts] = useState<any[]>([]);
    const [categoryImages, setCategoryImages] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [sliderCurtainModalOpen, setSliderCurtainModalOpen] = useState(false);
    const [rollerCurtainModalOpen, setRollerCurtainModalOpen] = useState(false);
    const [pdlcFilmModalOpen, setPdlcFilmModalOpen] = useState(false);
    const [sohubProtectModalOpen, setSohubProtectModalOpen] = useState(false);
    const [smartSecurityBoxModalOpen, setSmartSecurityBoxModalOpen] = useState(false);
    const [securityPanelModalOpen, setSecurityPanelModalOpen] = useState(false);
    const [smartSwitchModalOpen, setSmartSwitchModalOpen] = useState(false);
    const [servicesModalOpen, setServicesModalOpen] = useState(false);
    const [installationModalOpen, setInstallationModalOpen] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [orderLoading, setOrderLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Curtain');
    const [isManualSelection, setIsManualSelection] = useState(false);
    const [activeField, setActiveField] = useState('name');
    const [saveEmailModalOpen, setSaveEmailModalOpen] = useState(false);
    const [showMobileCart, setShowMobileCart] = useState(false);

    const categoryToIdMap: { [key: string]: string } = {
        'Curtain': '1',
        'Switch': '2',
        'Security': '3',
        'PDLC Film': '4'
    };

    const calculateItemPrice = (selectedVariant: any, payload: any, dbProducts: any[]) => {
        const basePrice = parseInt(selectedVariant.price.replace(/[^0-9]/g, ''), 10) || 0;
        const productData = dbProducts.find(p => p.id === selectedVariant.id);
        const engravingPrice = payload.engravingText && productData?.engraving_price ? productData.engraving_price : 0;
        return { basePrice, engravingPrice, totalPrice: basePrice + engravingPrice, productData };
    };

    const createCartItem = (selectedVariant: any, payload: any, totalPrice: number): CartItem => {
        return {
            id: selectedVariant.id,
            name: payload.engravingText ? `${selectedVariant.name} (Engraved: "${payload.engravingText}")` : selectedVariant.name,
            price: totalPrice,
            category: selectedVariant.gangType || 'Product',
            image: selectedVariant.imageUrl,
            color: selectedVariant.gangType || 'Default',
            quantity: payload.quantity || 1
        };
    };

    const handleOrderSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Validate form data
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }
        
        if (cart.length === 0) {
            toast({
                title: "Empty Cart",
                description: "Please add items to your cart before checkout.",
                variant: "destructive"
            });
            return;
        }
        
        setOrderLoading(true);
        try {
            const orderData = {
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                customer_address: formData.address,
                items: cart.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    category: item.category,
                    track_size: item.trackSize,
                    track_sizes: item.trackSizes
                })),
                total_amount: totalPrice,
                payment_method: totalPrice > 0 ? paymentMethod : 'free'
            };
            
            // Validate order data before submission
            const validatedOrderData = {
                ...orderData,
                customer_name: sanitizeDbInput(orderData.customer_name),
                customer_email: sanitizeDbInput(orderData.customer_email),
                customer_phone: sanitizeDbInput(orderData.customer_phone),
                customer_address: sanitizeDbInput(orderData.customer_address)
            };
            
            console.log('Submitting order:', sanitizeLogInput(validatedOrderData));
            const createdOrder = await orderService.createOrder(validatedOrderData);
            console.log('Order created:', sanitizeLogInput(createdOrder));
            
            if (!createdOrder) {
                throw new Error('Order creation failed - no data returned');
            }
            
            // Clear form and cart
            setCart([]);
            setShowCheckout(false);
            setShowMobileCart(false);
            setFormData({ name: '', email: '', phone: '', address: '' });
            
            // Navigate to thank you page with sanitized data
            const sanitizedOrderNumber = sanitizeDbInput(createdOrder.order_number || '');
            const safeOrderData = {
                customer_name: sanitizeDbInput(validatedOrderData.customer_name),
                customer_email: sanitizeDbInput(validatedOrderData.customer_email),
                customer_phone: sanitizeDbInput(validatedOrderData.customer_phone),
                customer_address: sanitizeDbInput(validatedOrderData.customer_address),
                total_amount: Math.max(0, Number(validatedOrderData.total_amount) || 0),
                order_number: sanitizedOrderNumber,
                payment_method: validatedOrderData.payment_method,
                items: validatedOrderData.items
            };
            const safeNavigationData = encodeURIComponent(JSON.stringify(safeOrderData));
            
            // Use window.location.href for more reliable navigation
            window.location.href = `/thank-you?data=${safeNavigationData}`;
            
            // Don't show toast here as we're navigating away
            console.log('Order confirmed, navigating to thank you page');
        } catch (error) {
            console.error('Order submission failed:', sanitizeLogInput(error));
            toast({
                title: "Order Failed",
                description: error instanceof Error ? error.message : "Failed to submit order. Please try again.",
                variant: "destructive"
            });
            setOrderLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
        loadCategoryImages();
        
        // Listen for cart updates to force re-render
        const handleCartUpdate = () => {
            setCart(prevCart => [...prevCart]);
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const loadProducts = async () => {
        try {
            const data = await executeQuery(() => productService.getProducts());
            // Validate and sanitize product data
            const sanitizedProducts = (data || []).map((product: any) => ({
                ...product,
                id: sanitizeDbInput(product.id || ''),
                name: sanitizeDbInput(product.name || ''),
                category: sanitizeDbInput(product.category || ''),
                price: Math.max(0, Number(product.price) || 0),
                stock: Math.max(0, Number(product.stock) || 0)
            }));
            setDbProducts(sanitizedProducts);
        } catch (err) {
            console.error('Failed to load products:', sanitizeLogInput(err));
        }
    };

    const loadCategoryImages = async () => {
        try {
            const data = await executeQuery(() => categoryService.getCategoryImages());
            setCategoryImages(data || []);
        } catch (err) {
            console.error('Failed to load category images:', sanitizeLogInput(err));
        }
    };

    const getProductsByCategory = (category: string) => {
        const sanitizedCategory = sanitizeDbInput(category);
        // Handle Services category separately
        if (sanitizedCategory === 'Services') {
            return [
                {
                    id: 'service-1',
                    name: 'Consultancy Services',
                    price: 'Free',
                    gangType: 'Consultancy',
                    imageUrl: '/images/services/services.png',
                    isSoldOut: false
                }
            ];
        }
        
        // If we have database products, use them
        if (dbProducts.length > 0) {
            const categoryFilter = sanitizedCategory === 'PDLC Film' ? ['Film', 'PDLC Film'] : 
                                 sanitizedCategory === 'Curtain' ? ['Smart Curtain'] : 
                                 sanitizedCategory === 'Switch' ? ['Smart Switch'] : [sanitizedCategory];
            const filteredProducts = dbProducts.filter(p => categoryFilter.includes(p.category) && p.stock > 0);
            
            // Sort Security products by serial_order, others by default
            const sortedProducts = sanitizedCategory === 'Security' 
                ? filteredProducts.sort((a, b) => {
                    const aOrder = a.serial_order || 999;
                    const bOrder = b.serial_order || 999;
                    return aOrder - bOrder;
                })
                : filteredProducts;
                
            return sortedProducts.map(p => ({
                id: p.id,
                name: p.name,
                price: `${p.price.toLocaleString()} BDT`,
                gangType: p.category,
                imageUrl: p.image || '/images/smart_switch/one gang.webp',
                isSoldOut: p.stock === 0
            }));
        }
        
        // No fallback products - only show admin panel products
        return [];
    };

    // Listen for back button event from BuyNowModal
    useEffect(() => {
        const handleOpenProductList = () => {
            // Handle back navigation if needed
        };
        window.addEventListener('openProductList', handleOpenProductList);
        return () => window.removeEventListener('openProductList', handleOpenProductList);
    }, []);

    const addToCart = (product: Product | CartItem) => {
        console.log('addToCart called with:', sanitizeLogInput(product));
        setCart((currentCart) => {
            console.log('Current cart before adding:', sanitizeLogInput(currentCart));
            
            // For Smart Curtain with specific track sizes, use the provided ID (already unique)
            if (product.category === 'Smart Curtain' && product.id.includes('_') && product.id.includes('ft')) {
                const newCart = [...currentCart, { ...product, quantity: 'quantity' in product ? product.quantity : 1 }];
                console.log('New cart after adding Smart Curtain:', sanitizeLogInput(newCart));
                return newCart;
            }
            
            // For PDLC Film and other Smart Curtain, always add as new item with unique ID
            if (product.category === 'PDLC Film' || product.category === 'Film' || product.category === 'Smart Curtain') {
                const uniqueId = `${sanitizeDbInput(product.id)}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                return [...currentCart, { ...product, id: uniqueId, quantity: 'quantity' in product ? product.quantity : 1 }];
            }
            
            // For Security products with accessories, always add as new item with unique ID
            if (product.category === 'Security' && 'accessories' in product && product.accessories && product.accessories.length > 0) {
                const uniqueId = `${sanitizeDbInput(product.id)}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                return [...currentCart, { ...product, id: uniqueId, quantity: 'quantity' in product ? product.quantity : 1 }];
            }
            
            // For other products, check for existing items
            const sanitizedProductId = sanitizeDbInput(product.id);
            const existingItem = currentCart.find(
                (item) => item.id === sanitizedProductId
            );
            const quantityToAdd = 'quantity' in product ? product.quantity : 1;
            if (existingItem) {
                return currentCart.map((item) =>
                    item.id === sanitizedProductId
                        ? { ...item, quantity: item.quantity + quantityToAdd }
                        : item
                );
            }
            return [...currentCart, { ...product, id: sanitizedProductId, quantity: quantityToAdd }];
        });
        setShowMobileCart(true);
    };

    const removeFromCart = (productId: string) => {
        const sanitizedId = sanitizeDbInput(productId);
        setCart((currentCart) =>
            currentCart.filter((item) => item.id !== sanitizedId)
        );
    };

    const updateQuantity = (productId: string, delta: number) => {
        const sanitizedId = sanitizeDbInput(productId);
        setCart((currentCart) =>
            currentCart.map((item) => {
                if (item.id === sanitizedId) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity > 0) {
                        // For items with installation, recalculate price based on new quantity
                        if (item.installationCharge && (item.category === 'Smart Switch' || item.category === 'Smart Curtain')) {
                            const basePrice = item.category === 'Smart Switch' ? 
                                (item.price - item.installationCharge) / item.quantity :
                                item.category === 'Smart Curtain' && item.trackSizes ? 
                                (item.price - item.installationCharge) / item.quantity : item.price / item.quantity;
                            const newPrice = (basePrice * newQuantity) + item.installationCharge;
                            return { ...item, quantity: newQuantity, price: newPrice };
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                }
                return item;
            })
        );
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => {
            let itemTotal = 0;
            
            // For items with pre-calculated totals (Smart Curtains with tracks or Smart Switches with installation)
            if ((item.category === 'Smart Curtain' && item.trackSizes) || (item.category === 'Smart Switch' && item.installationCharge)) {
                itemTotal = item.price;
            } else {
                itemTotal = item.price * item.quantity;
            }
            
            // Add accessories price if they exist (only once, not multiplied by quantity)
            if (item.accessories && item.accessories.length > 0) {
                const accessoriesTotal = item.accessories.reduce((accSum, acc) => accSum + (Number(acc.price) || 0), 0);
                itemTotal += accessoriesTotal;
            }
            
            return sum + itemTotal;
        },
        0
    );

    const categories = dbProducts.length > 0 ? getCategoryProducts(dbProducts, categoryImages) : products;
    
    // Memoize products by category for better performance
    const allProductsByCategory = useMemo(() => {
        return categories.map(category => {
            const products = getProductsByCategory(category.category);
            return {
                category: category.category,
                products: products
            };
        });
    }, [categories, dbProducts]);

    // Memoize selected product data
    const selectedProductData = useMemo(() => {
        if (!selectedVariant || !dbProducts.length) return null;
        return transformProductForModal(selectedVariant, dbProducts);
    }, [selectedVariant, dbProducts]);





    // Auto-select category based on scroll position
    useEffect(() => {
        let throttleTimer: NodeJS.Timeout | null = null;
        
        const handleScroll = () => {
            if (throttleTimer || isManualSelection) return;
            
            throttleTimer = setTimeout(() => {
                const container = document.querySelector('.products-scroll-container');
                if (!container) {
                    throttleTimer = null;
                    return;
                }
                
                const containerRect = container.getBoundingClientRect();
                const headerOffset = 200;
                
                let visibleCategory = activeCategory;
                let maxVisibility = 0;
                
                allProductsByCategory.forEach(group => {
                    const element = document.getElementById(`category-${group.category.replace(/\s+/g, '-')}`);
                    if (element) {
                        const elementRect = element.getBoundingClientRect();
                        const relativeTop = elementRect.top - containerRect.top - headerOffset;
                        
                        if (relativeTop <= 50 && relativeTop > -element.offsetHeight + 100) {
                            const visibility = Math.max(0, Math.min(100, 100 - Math.abs(relativeTop)));
                            if (visibility > maxVisibility) {
                                maxVisibility = visibility;
                                visibleCategory = group.category;
                            }
                        }
                    }
                });
                
                if (visibleCategory !== activeCategory) {
                    setActiveCategory(visibleCategory);
                }
                
                throttleTimer = null;
            }, 100);
        };

        const scrollContainer = document.querySelector('.products-scroll-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                scrollContainer.removeEventListener('scroll', handleScroll);
                if (throttleTimer) clearTimeout(throttleTimer);
            };
        }
    }, [allProductsByCategory, activeCategory, isManualSelection]);

    // Add CSS styles via useEffect for proper lifecycle management
    useEffect(() => {
        if (typeof document !== 'undefined' && !document.head.querySelector('style[data-category-bar]')) {
            const style = document.createElement('style');
            style.textContent = `
                .category-bar-container::-webkit-scrollbar { display: none; }
                .category-bar-container { -ms-overflow-style: none; scrollbar-width: none; }
                .sticky-checkout-section { position: relative; }
                .scroll-lock-container { overscroll-behavior: contain; }
                .products-scroll-container { overscroll-behavior: auto; }
                .products-scroll-container::-webkit-scrollbar { display: none; }
                .cart-scroll-through { overscroll-behavior: none; }
                .font-apple { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .cart-scroll::-webkit-scrollbar {
                  width: 6px;
                }
                .cart-scroll::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 3px;
                }
                .cart-scroll::-webkit-scrollbar-thumb {
                  background: #0a1d3a;
                  border-radius: 3px;
                }
                .cart-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(10, 29, 58, 0.8);
                }
            `;
            style.setAttribute('data-category-bar', 'true');
            document.head.appendChild(style);
        }
    }, []);

    return (
        <>
            <div className="w-full max-w-7xl mx-auto min-h-screen grid lg:grid-cols-5 gap-6 lg:gap-8 sticky-checkout-section">
            {/* Product Selection Section */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden h-[calc(100vh-120px)]">
                <div className="overflow-y-auto products-scroll-container h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Category Tabs */}
                <div className="mb-6 lg:mb-8 sticky top-0 lg:top-0 bg-white/95 backdrop-blur-md z-40 pt-4 pb-3 lg:pt-6 lg:pb-3 shadow-lg border-b border-gray-100">
                    <div className="flex overflow-x-auto gap-3 lg:gap-4 px-4 lg:px-6 category-bar-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {categories.map((category) => (
                            <motion.button
                                key={category.id}
                                data-category={category.category}
                                onClick={() => {
                                    setIsManualSelection(true);
                                    setActiveCategory(category.category);
                                    
                                    // Scroll to the category section
                                    setTimeout(() => {
                                        const targetId = `category-${category.category.replace(/\s+/g, '-')}`;
                                        const element = document.getElementById(targetId);
                                        const container = document.querySelector('.products-scroll-container');
                                        
                                        if (element && container) {
                                            const stickyHeader = container.querySelector('.sticky');
                                            const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 140;
                                            const elementPosition = element.offsetTop;
                                            const scrollPosition = elementPosition - headerHeight - 20;
                                            container.scrollTo({
                                                top: Math.max(0, scrollPosition),
                                                behavior: 'smooth'
                                            });
                                        }
                                        
                                        setTimeout(() => setIsManualSelection(false), 800);
                                    }, 10);
                                }}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-3 px-4 py-1 rounded-[5px] transition-all duration-300 min-w-fit border-2 group relative overflow-hidden",
                                    activeCategory === category.category
                                        ? "bg-[#0a1d3a] text-white border-transparent shadow-lg"
                                        : "bg-white text-gray-700 border-gray-200"
                                )}

                                whileHover={{ y: -2, scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: category.id * 0.1, duration: 0.15 }}
                            >
                                {/* Animated background */}
                                {activeCategory === category.category && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-[5px]"
                                        layoutId="activeTab"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                

                                
                                <span className="text-sm lg:text-base font-medium whitespace-nowrap relative z-10">
                                    {category.name}
                                </span>
                                
                                {/* Pulse effect for active */}
                                {activeCategory === category.category && (
                                    <motion.div
                                        className="absolute inset-0 rounded-[5px] border-2 border-white/30"
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* All Products by Category */}
                <div className="pb-8">
                    {allProductsByCategory.map((categoryGroup, index) => (
                        <div key={categoryGroup.category} id={`category-${categoryGroup.category.replace(/\s+/g, '-')}`} className="mb-8">
                            {/* Section Title - Always Show */}
                            <div className="mb-4 lg:mb-6 px-3 lg:px-4">
                                <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-green-500 pb-2 inline-block">
                                    {categoryGroup.category}
                                </h2>
                                <p className="text-sm text-gray-600 mt-2">
                                    {categoryGroup.products.length} products available
                                </p>
                            </div>

                            {/* Product Grid or No Products Message */}
                            {categoryGroup.products.length > 0 ? (
                                <div className="grid grid-cols-4 gap-1.5 lg:gap-2 px-3 lg:px-4 relative z-0">
                                    {categoryGroup.products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 p-1.5 relative cursor-pointer border border-gray-100 hover:border-green-200 group aspect-square flex flex-col"
                            whileHover={{ y: -2, scale: 1.01 }}
                            onWheel={(e) => {
                                const container = document.querySelector('.products-scroll-container');
                                if (container) {
                                    const isAtTop = container.scrollTop === 0;
                                    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
                                    
                                    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
                                        return; // Allow page scroll
                                    }
                                    
                                    e.preventDefault();
                                    container.scrollTop += e.deltaY;
                                }
                            }}
                            onClick={() => {
                                if (product.id === 'service-1') {
                                    setServicesModalOpen(true);
                                    return;
                                }
                                if (product.id === 'service-2') {
                                    setInstallationModalOpen(true);
                                    return;
                                }
                                const variant = categoryGroup.products.find(p => p.id === product.id);
                                setSelectedVariant(variant);
                                setSelectedProduct(categoryToIdMap[categoryGroup.category] || '3');
                                
                                // Open appropriate modal based on category and product
                                const modalType = getModalType(categoryGroup.category, product.name);
                                switch (modalType) {
                                    case 'slider': setSliderCurtainModalOpen(true); break;
                                    case 'roller': setRollerCurtainModalOpen(true); break;
                                    case 'pdlc film': setPdlcFilmModalOpen(true); break;
                                    case 'securityBox': setSmartSecurityBoxModalOpen(true); break;
                                    case 'securityPanel': setSecurityPanelModalOpen(true); break;
                                    case 'sohubProtect': setSohubProtectModalOpen(true); break;
                                    case 'switch': setSmartSwitchModalOpen(true); break;
                                    default: setModalOpen(true);
                                }
                            }}
                        >
                            {/* Badge */}
                            {product.isSoldOut && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-medium z-10">
                                    Sold Out
                                </div>
                            )}
                            
                            {/* Product Image */}
                            <div className="flex-1 flex items-center justify-center bg-white rounded-sm overflow-hidden transition-all duration-300 p-0.5 mb-1">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/smart_switch/3 gang mechanical.webp';
                                    }}
                                />
                            </div>
                            
                            {/* Product Info */}
                            <div className="space-y-0 mt-auto">
                                <h3 className="font-medium text-gray-900 text-sm leading-tight truncate font-apple">
                                    {product.name}
                                </h3>
                                <p className="text-black text-sm font-semibold font-apple">
                                    {typeof product.price === 'string' ? product.price : `${product.price} BDT`}
                                </p>
                            </div>
                            
                            {/* Add Button */}
                            <motion.button
                                className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (product.id === 'service-1') {
                                        setServicesModalOpen(true);
                                        return;
                                    }
                                    if (product.id === 'service-2') {
                                        setInstallationModalOpen(true);
                                        return;
                                    }
                                    const cartItem: CartItem = {
                                        id: sanitizeDbInput(product.id),
                                        name: sanitizeDbInput(product.name),
                                        price: safeParsePrice(product.price.toString()),
                                        category: product.gangType || 'Product',
                                        image: product.imageUrl,
                                        color: product.gangType || 'Default',
                                        quantity: 1
                                    };
                                    addToCart(cartItem);
                                    toast({
                                        title: "Added to Cart",
                                        description: `${product.name} has been added to your cart.`,
                                    });
                                }}
                            >
                                +
                            </motion.button>
                                    </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <p>No products available in this category</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            </div>

            {/* Mobile Cart Toggle Button */}
            {!showMobileCart && cart.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowMobileCart(true)}
                    className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 flex items-center gap-2"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                    </span>
                </motion.button>
            )}

            {/* Cart Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                    "lg:col-span-2 flex flex-col",
                    "fixed bottom-0 left-0 right-0 lg:relative",
                    showCheckout ? "top-0 lg:top-6" : "",
                    "p-5 rounded-t-2xl lg:rounded-2xl",
                    "bg-white shadow-xl border border-gray-200/60",
                    "z-50 lg:z-auto overflow-hidden",
                    !showMobileCart && "hidden lg:flex"
                )}
                style={{ 
                    height: showCheckout ? (window.innerWidth < 1024 ? '100vh' : 'auto') : 'calc(100vh - 120px)', 
                    minHeight: showCheckout ? (window.innerWidth < 1024 ? '100vh' : '600px') : 'calc(100vh - 120px)', 
                    maxHeight: showCheckout ? (window.innerWidth < 1024 ? '100vh' : '85vh') : 'calc(100vh - 120px)'
                }}
            >
                    {showCheckout ? (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCheckout(false)}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Cart
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowCheckout(false);
                                        setShowMobileCart(false);
                                    }}
                                    className="lg:hidden p-1 h-8 w-8"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                                Checkout
                            </h2>
                            
                            <div className="flex-1 overflow-y-auto -mx-2 lg:-mx-4 px-2 lg:px-4" style={{ scrollBehavior: 'auto' }}>
                                <form onSubmit={handleOrderSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="mt-1"
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    {totalPrice > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium">Payment Method</Label>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                                    <input 
                                                        type="radio" 
                                                        id="cod" 
                                                        name="payment" 
                                                        value="cod" 
                                                        checked={paymentMethod === 'cod'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer text-sm flex-1">
                                                        <Truck className="w-4 h-4" />
                                                        Cash on Delivery
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                                    <input 
                                                        type="radio" 
                                                        id="online" 
                                                        name="payment" 
                                                        value="online" 
                                                        checked={paymentMethod === 'online'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer text-sm flex-1">
                                                        <CreditCard className="w-4 h-4" />
                                                        Online Payment
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>

                            <div className="sticky bottom-0 bg-white dark:bg-zinc-900 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 -mx-2 lg:-mx-4 px-2 lg:px-4">
                                {totalPrice > 0 && (
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Total</span>
                                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{totalPrice.toLocaleString()} BDT</span>
                                    </div>
                                )}
                                {totalPrice === 0 && (
                                    <div className="text-center mb-4">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Free Consultation Service</span>
                                    </div>
                                )}
                                <Button 
                                    type="submit" 
                                    className="w-full mb-2" 
                                    disabled={orderLoading || loading}
                                    onClick={handleOrderSubmit}
                                >
                                    {orderLoading ? 'Processing...' : 'Confirm Order'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#0a1d3a]/10 rounded-lg">
                                        <ShoppingCart className="w-5 h-5 text-[#0a1d3a]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 leading-none">Shopping Cart</h2>
                                </div>
                                <p className="text-sm text-gray-500 leading-none italic">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMobileCart(false)}
                                    className="lg:hidden p-2 h-8 w-8 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 max-h-[200px] lg:max-h-none space-y-2 bg-gray-50 rounded-lg p-2 cart-scroll">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-base font-medium text-gray-700 mb-1">Cart is empty</h3>
                                            <p className="text-sm text-gray-500">Add products to get started</p>
                                        </div>
                                    ) : (
                                        cart.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.96 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.96 }}
                                                transition={{
                                                    opacity: { duration: 0.2 },
                                                    layout: { duration: 0.2 },
                                                }}
                                                className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                                            >
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/images/smart_switch/3 gang mechanical.webp';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <h3 className="text-sm lg:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                                                                {item.name}
                                                            </h3>
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                                {item.category}
                                                                {item.trackSize ? ` • ${item.trackSize} ft` : ''}
                                                                {item.trackSizes ? ` • ${item.trackSizes.join(', ')} ft` : ''}
                                                                {item.height && item.width ? ` • ${item.quantity.toFixed(2)} sq ft (${item.height}' × ${item.width}')` : ''}
                                                            </p>
                                                            {item.accessories && item.accessories.length > 0 && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-medium text-zinc-600 mb-1">Accessories:</p>
                                                                    {item.accessories.map((accessory, index) => (
                                                                        <div key={index} className="flex justify-between items-center text-xs text-zinc-500 mb-1">
                                                                            <span>• {accessory.name}</span>
                                                                            <span>+{Number(accessory.price).toLocaleString()} BDT</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {item.category === 'Services' || item.category === 'Installation Service' ? (
                                                            <div className="text-sm text-gray-600">
                                                                {item.category === 'Installation Service' ? 'Professional Installation Service (TBD)' : 'Consultation Service'}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, -1)}
                                                                    className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                                >
                                                                    <Minus className="w-3 h-3 text-gray-600" />
                                                                </button>
                                                                <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        if (item.category === 'Smart Switch' && item.installationCharge && item.quantity >= 3) {
                                                                            toast({
                                                                                title: "Installation Limit",
                                                                                description: "For more than 3 switches, site visit required. Please contact us.",
                                                                                variant: "destructive"
                                                                            });
                                                                            return;
                                                                        }
                                                                        updateQuantity(item.id, 1);
                                                                    }}
                                                                    className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3 text-gray-600" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="text-right">
                                                            <p className="text-sm lg:text-base font-bold text-zinc-900 dark:text-zinc-100">
                                                                {item.category === 'Services' ? 'Free' : item.category === 'Installation Service' ? 'TBD' : (() => {
                                                                    let itemTotal = 0;
                                                                    if ((item.category === 'Smart Curtain' && item.trackSizes) || (item.category === 'Smart Switch' && item.installationCharge)) {
                                                                        itemTotal = item.price;
                                                                    } else {
                                                                        itemTotal = item.price * item.quantity;
                                                                    }
                                                                    if (item.accessories && item.accessories.length > 0) {
                                                                        const accessoriesTotal = item.accessories.reduce((sum, acc) => sum + (Number(acc.price) || 0), 0);
                                                                        itemTotal += accessoriesTotal;
                                                                    }
                                                                    return `${itemTotal.toLocaleString()} BDT`;
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            <div className="pt-2 mt-2 border-t border-gray-300">
                                <div className="bg-white rounded-lg p-3 mb-2 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold text-gray-900 leading-none">Total</span>
                                        <span className="text-xl font-bold text-[#0a1d3a] leading-none">
                                            <NumberFlow value={totalPrice} /> BDT
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                                        <span className="leading-none">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                                        <span className="text-green-600 leading-none">Free Delivery</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="gap-2 text-[#0a1d3a] border-[#0a1d3a]/30 hover:bg-[#0a1d3a]/10" 
                                            disabled={cart.length === 0}
                                            onClick={() => setSaveEmailModalOpen(true)}
                                        >
                                            <Mail className="w-4 h-4" />
                                            Save
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="gap-2 text-green-600 border-green-200 hover:bg-green-50" 
                                            disabled={cart.length === 0}
                                            onClick={() => {
                                                try {
                                                    const sanitizedCartItems = cart.map(item => ({
                                                        name: sanitizeDbInput(item.name),
                                                        quantity: Math.max(0, Math.floor(Number(item.quantity) || 0)),
                                                        price: Math.max(0, Number(item.price) || 0)
                                                    }));
                                                    
                                                    const pdfContent = `
                                                        <!DOCTYPE html>
                                                        <html>
                                                        <head>
                                                            <title>Smart Home Quote</title>
                                                            <style>
                                                                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                                                                h1 { text-align: center; color: #333; margin-bottom: 30px; }
                                                                .item { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9; }
                                                                .total { text-align: right; color: #333; font-size: 20px; margin: 20px 0; }
                                                                .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
                                                                hr { margin: 20px 0; border: 1px solid #ddd; }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            <h1>Smart Home Quote</h1>
                                                            <hr>
                                                            <h3>Items:</h3>
                                                            ${sanitizedCartItems.map(item => `
                                                                <div class="item">
                                                                    <strong>${item.name}</strong><br>
                                                                    <span style="color: #666;">Quantity: ${item.quantity}</span><br>
                                                                    <span style="color: #666;">Price: ${item.price.toLocaleString()} BDT</span><br>
                                                                    <span style="font-weight: bold;">Subtotal: ${(item.price * item.quantity).toLocaleString()} BDT</span>
                                                                </div>
                                                            `).join('')}
                                                            <hr>
                                                            <h3 class="total">Total: ${Math.max(0, totalPrice).toLocaleString()} BDT</h3>
                                                            <p class="footer">Generated on ${new Date().toLocaleDateString()}</p>
                                                        </body>
                                                        </html>
                                                    `;
                                                    
                                                    const blob = new Blob([pdfContent], { type: 'text/html' });
                                                    const url = URL.createObjectURL(blob);
                                                    window.open(url, '_blank');
                                                    
                                                    toast({
                                                        title: "Quote Opened",
                                                        description: "Quote opened in new tab. Use Ctrl+P to save as PDF."
                                                    });
                                                } catch (error) {
                                                    toast({
                                                        title: "Error",
                                                        description: "Failed to open quote."
                                                    });
                                                }
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            PDF
                                        </Button>
                                    </div>
                                    <Button 
                                        className="w-full gap-2 bg-[#0a1d3a] hover:bg-[#0a1d3a]/90 text-white" 
                                        disabled={cart.length === 0}
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
            </motion.div>
            </div>
            
            {/* Slider Curtain Modal */}
            {selectedVariant && (
                <SliderCurtainModal
                    open={sliderCurtainModalOpen}
                    onOpenChange={(open) => {
                        setSliderCurtainModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={selectedProductData || transformProductForModal(selectedVariant, dbProducts)}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId && payload.productName && payload.trackSize) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${payload.productName} (${payload.connectionType.toUpperCase()})${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Smart Curtain',
                                image: selectedVariant.imageUrl,
                                color: 'Smart Curtain',
                                quantity: payload.quantity,
                                trackSize: payload.trackSize,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for slider curtain
                    }}
                />
            )}
            
            {/* Roller Curtain Modal */}
            {selectedVariant && (
                <RollerCurtainModal
                    open={rollerCurtainModalOpen}
                    onOpenChange={(open) => {
                        setRollerCurtainModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Product',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: productData?.description || '',
                            detailed_description: productData?.detailed_description || '',
                            features: productData?.features || '',
                            specifications: productData?.specifications || '',
                            warranty: productData?.warranty || '',
                            installation_included: productData?.installation_included || false,
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId && payload.productName && payload.trackSize) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${payload.productName}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Smart Curtain',
                                image: selectedVariant.imageUrl,
                                color: 'Smart Curtain',
                                quantity: payload.quantity,
                                trackSize: payload.trackSize,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for roller curtain
                    }}
                />
            )}

            {/* Buy Now Modal - For non-Security and non-Smart Switch products */}
            {selectedProduct && selectedVariant && selectedVariant.gangType !== 'Security' && selectedVariant.gangType !== 'Smart Switch' && (
                <BuyNowModal
                    open={modalOpen}
                    onOpenChange={(open) => {
                        setModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Product',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: productData?.description || '',
                            detailed_description: productData?.detailed_description || '',
                            features: productData?.features || '',
                            specifications: productData?.specifications || '',
                            engraving_available: productData?.engraving_available || false,
                            engraving_price: productData?.engraving_price || 0,
                            engraving_image: productData?.engraving_image || '',
                            engraving_text_color: productData?.engraving_text_color || '#000000',
                            warranty: productData?.warranty || '',
                            installation_included: productData?.installation_included || false,
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    onAddToCart={async (payload) => {
                        if (selectedVariant) {
                            const basePrice = parseInt(selectedVariant.price.replace(/[^0-9]/g, ''), 10) || 0;
                            const totalPrice = payload.totalPrice || (payload.totalArea ? basePrice * payload.totalArea : basePrice);
                            
                            let itemName = selectedVariant.name;
                            if (payload.transformer) {
                                itemName += ` + ${payload.transformer.name}`;
                            }
                            if (payload.installationCharge && typeof payload.installationCharge === 'number' && payload.installationCharge > 0) {
                                if (selectedVariant.gangType === 'Smart Switch') {
                                    itemName += ` + Installation (BDT ${payload.installationCharge.toLocaleString()})`;
                                } else if (selectedVariant.gangType === 'Smart Curtain') {
                                    itemName += ` + Installation (BDT ${payload.installationCharge.toLocaleString()})`;
                                } else {
                                    itemName += ` + Installation`;
                                }
                            }
                            
                            const cartItem = {
                                id: selectedVariant.id,
                                name: itemName,
                                price: payload.totalPrice ? payload.totalPrice : totalPrice,
                                category: selectedVariant.gangType || 'Product',
                                image: selectedVariant.imageUrl,
                                color: selectedVariant.gangType || 'Default',
                                quantity: payload.quantity || 1
                            };
                            if (payload.trackSizes) {
                                cartItem.trackSizes = payload.trackSizes;
                            }
                            if (payload.height && payload.width) {
                                cartItem.height = payload.height;
                                cartItem.width = payload.width;
                            }
                            if (payload.transformer) {
                                cartItem.transformer = payload.transformer;
                            }
                            if (payload.installationCharge) {
                                cartItem.installationCharge = payload.installationCharge;
                            }
                            addToCart(cartItem);
                            
                            // Small delay to ensure each item is processed separately
                            await new Promise(resolve => setTimeout(resolve, 10));
                        }
                    }}
                    onBuyNow={async (payload) => {
                        if (selectedVariant) {
                            const basePrice = parseInt(selectedVariant.price.replace(/[^0-9]/g, ''), 10) || 0;
                            const totalPrice = payload.totalArea ? basePrice * payload.totalArea : basePrice;
                            const cartItem = {
                                id: selectedVariant.id,
                                name: selectedVariant.name,
                                price: totalPrice,
                                category: selectedVariant.gangType || 'Product',
                                image: selectedVariant.imageUrl,
                                color: selectedVariant.gangType || 'Default',
                                quantity: payload.quantity || 1
                            };
                            if (payload.trackSizes) {
                                cartItem.trackSizes = payload.trackSizes;
                            }
                            if (payload.height && payload.width) {
                                cartItem.height = payload.height;
                                cartItem.width = payload.width;
                            }
                            
                            setCart([cartItem]);
                            setModalOpen(false);
                            setShowCheckout(true);
                            
                            toast({
                                title: "Proceeding to Checkout",
                                description: `${cartItem.name} added for immediate purchase.`,
                            });
                        }
                    }}
                    onToggleFavorite={() => {
                        toast({
                            title: "Added to Favorites",
                            description: "Product added to your favorites list.",
                        });
                    }}
                />
            )}
            
            {/* Services Selection Modal */}
            <ServicesModal
                open={servicesModalOpen}
                onOpenChange={setServicesModalOpen}
                onBack={() => {
                    setServicesModalOpen(false);
                }}
                onAddToCart={(cartItem) => {
                    addToCart(cartItem);
                    toast({
                        title: "Added to Cart",
                        description: `${cartItem.name} has been added to your cart.`,
                    });
                }}
            />
            
            {/* Installation Services Modal */}
            <InstallationModal
                open={installationModalOpen}
                onOpenChange={setInstallationModalOpen}
                onBack={() => {
                    setInstallationModalOpen(false);
                }}
                onAddToCart={(cartItem) => {
                    addToCart(cartItem);
                    toast({
                        title: "Added to Cart",
                        description: `${cartItem.name} has been added to your cart.`,
                    });
                }}
            />
            
            {/* PDLC Film Modal */}
            {selectedVariant && (
                <PDLCFilmModal
                    open={pdlcFilmModalOpen}
                    onOpenChange={(open) => {
                        setPdlcFilmModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: 'PDLC Film',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: productData?.description || '',
                            detailed_description: productData?.detailed_description || '',
                            features: productData?.features || '',
                            specifications: productData?.specifications || '',
                            warranty: productData?.warranty || '',
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId && payload.productName) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${payload.productName} (${payload.totalArea.toFixed(2)} sq ft)${payload.transformer ? ` + ${payload.transformer.name}` : ''}${payload.installationCharge && typeof payload.installationCharge === 'number' ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'PDLC Film',
                                image: selectedVariant.imageUrl,
                                color: 'PDLC Film',
                                quantity: payload.quantity,
                                totalArea: payload.totalArea,
                                transformer: payload.transformer,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for PDLC film
                    }}
                />
            )}
            
            {/* Smart Switch Modal */}
            {selectedVariant && (
                <SmartSwitchModal
                    open={smartSwitchModalOpen}
                    onOpenChange={(open) => {
                        setSmartSwitchModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Smart Switch',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: productData?.description || '',
                            detailed_description: productData?.detailed_description || '',
                            features: productData?.features || '',
                            specifications: productData?.specifications || '',
                            engraving_available: productData?.engraving_available || false,
                            engraving_price: productData?.engraving_price || 0,
                            engraving_image: productData?.engraving_image || '',
                            engraving_text_color: productData?.engraving_text_color || '#000000',
                            warranty: productData?.warranty || '',
                            installation_included: productData?.installation_included || false,
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${selectedVariant.name}${payload.engravingText ? ` (Engraved: "${payload.engravingText}")` : ''}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Smart Switch',
                                image: selectedVariant.imageUrl,
                                color: 'Smart Switch',
                                quantity: payload.quantity,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Smart Switch products
                    }}
                />
            )}
            
            {/* Sohub Protect Modal */}
            {selectedVariant && (
                <SohubProtectModal
                    open={sohubProtectModalOpen}
                    onOpenChange={(open) => {
                        setSohubProtectModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Security',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: productData?.description || '',
                            detailed_description: productData?.detailed_description || '',
                            features: productData?.features || '',
                            specifications: productData?.specifications || '',
                            warranty: productData?.warranty || '',
                            installation_included: productData?.installation_included || false,
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${selectedVariant.name}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Security',
                                image: selectedVariant.imageUrl,
                                color: 'Security',
                                quantity: payload.quantity,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Sohub Protect products
                    }}
                />
            )}
            
            {/* Smart Security Box Modal */}
            {selectedVariant && (
                <SmartSecurityBoxModal
                    open={smartSecurityBoxModalOpen}
                    onOpenChange={(open) => {
                        setSmartSecurityBoxModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const basePrice = parseInt(selectedVariant.price.replace(/[^0-9]/g, ''));
                            const cartItem = {
                                id: payload.productId,
                                name: selectedVariant.name,
                                price: basePrice,
                                category: 'Security',
                                image: selectedVariant.imageUrl,
                                color: 'Security',
                                quantity: payload.quantity,
                                accessories: payload.accessories || []
                            };
                            addToCart(cartItem);
                        }
                    }}
                />
            )}
            
            {/* Security Panel Modal */}
            {selectedVariant && (
                <SecurityPanelModal
                    open={securityPanelModalOpen}
                    onOpenChange={(open) => {
                        setSecurityPanelModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            image: selectedVariant.imageUrl,
                            image2: productData?.image2 || '',
                            image3: productData?.image3 || '',
                            image4: productData?.image4 || '',
                            image5: productData?.image5 || '',
                            stock: productData?.stock || 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const basePrice = parseInt(selectedVariant.price.replace(/[^0-9]/g, ''));
                            const cartItem = {
                                id: payload.productId,
                                name: selectedVariant.name,
                                price: basePrice,
                                category: 'Security',
                                image: selectedVariant.imageUrl,
                                color: 'Security',
                                quantity: payload.quantity,
                                accessories: payload.accessories || []
                            };
                            addToCart(cartItem);
                        }
                    }}
                />
            )}
            
            {/* Save Email Modal */}
            <SaveEmailModal
                open={saveEmailModalOpen}
                onOpenChange={setSaveEmailModalOpen}
                cartItems={cart}
                totalPrice={totalPrice}
            />
        </>
    );
}

export { InteractiveCheckout, type Product };

// CSS styles will be added via useEffect in component

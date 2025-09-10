"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, X, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { BuyNowModal } from "@/components/ui/BuyNowModal";
import { SliderCurtainModal } from "@/components/ui/SliderCurtainModal_new";
import { RollerCurtainModal } from "@/components/ui/RollerCurtainModal_new";
import { PDLCFilmModal } from "@/components/ui/PDLCFilmModal";
import { SohubProtectModal } from "@/components/ui/SohubProtectModal";
import { SmartSecurityBoxModal } from "@/components/ui/SmartSecurityBoxModal";
import { SecurityPanelModal } from "@/components/ui/SecurityPanelModal";
import { SensorsSelectionModal } from "@/components/ui/SensorsSelectionModal";
import { CameraSelectionModal } from "@/components/ui/CameraSelectionModal";
import { SmartSwitchModal } from "@/components/ui/SmartSwitchModal";
import { LightSwitchModal } from "@/components/ui/LightSwitchModal";
import { FanSwitchModal } from "@/components/ui/FanSwitchModal";
import { BoilerSwitchModal } from "@/components/ui/BoilerSwitchModal";
import { productData } from "@/lib/productData";
import { SpotLightModal } from '@/components/ui/SpotLightModal';
import { StripLightModal } from '@/components/ui/StripLightModal';

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
import { sanitizeForLog, sanitizeString } from "@/utils/sanitize";
import { useMemo, useCallback } from "react";
import { emailService } from "@/supabase/email";

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
    selectedGang?: string;
    selectedColor?: string;
    model?: string;
    connectionType?: string;
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
    const sanitizedId = sanitizeString(selectedVariant.id);
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
    if (category === 'Curtain' || category === 'Curtains') {
        const name = productName.toLowerCase();
        if (name.includes('slider') || name.includes('sliding')) {
            return 'slider';
        }
        if (name.includes('roller')) {
            return 'roller';
        }
        return 'roller';
    }
    if (category === 'Security') {
        const name = productName.toLowerCase();
        if (name.includes('sensors') || name.includes('sensor')) {
            return 'sensors';
        }
        if (name.includes('camera')) {
            return 'camera';
        }
        if (productName.includes('Smart Security Box') || productName.includes('Panel Kit')) {
            return 'securityBox';
        }
        if (productName.includes('Security Panel') || productName.includes('SP-05')) {
            return 'securityPanel';
        }
        return 'sohubProtect';
    }
    if (category === 'Switch' || category === 'Switches') {
        const name = productName.toLowerCase();
        if (name.includes('smart')) {
            return 'smartSwitch';
        }
        if (name.includes('fan')) {
            return 'fanSwitch';
        }
        if (name.includes('boiler')) {
            return 'boilerSwitch';
        }
        if (name.includes('light')) {
            return 'lightSwitch';
        }
        return 'lightSwitch';
    }
    return category.toLowerCase();
};

const getCategoryProducts = (dbCategories: any[], categoryImages: any[]) => {
    return dbCategories.map((category) => {
        const categoryImagesForCategory = categoryImages.filter(img => 
            img.category === category.name
        );
        const firstCategoryImage = categoryImagesForCategory[0];
        
        return {
            id: category.id,
            name: category.name,
            price: 0,
            category: category.name,
            image: category.image_url || firstCategoryImage?.image_url || '/images/smart_switch/3 gang mechanical.webp',
            color: 'Available'
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
    const [dbCategories, setDbCategories] = useState<any[]>([]);
    const [dbSubcategories, setDbSubcategories] = useState<any[]>([]);
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
    const [sensorsSelectionModalOpen, setSensorsSelectionModalOpen] = useState(false);
    const [cameraSelectionModalOpen, setCameraSelectionModalOpen] = useState(false);
    const [smartSwitchModalOpen, setSmartSwitchModalOpen] = useState(false);
    const [lightSwitchModalOpen, setLightSwitchModalOpen] = useState(false);
    const [fanSwitchModalOpen, setFanSwitchModalOpen] = useState(false);
    const [boilerSwitchModalOpen, setBoilerSwitchModalOpen] = useState(false);
    const [spotLightModalOpen, setSpotLightModalOpen] = useState(false);
    const [stripLightModalOpen, setStripLightModalOpen] = useState(false);
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
    const [removeItemModal, setRemoveItemModal] = useState({ open: false, itemId: '', itemName: '' });

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
                title: "Empty Bag",
                description: "Please add items to your bag before checkout.",
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
                customer_name: sanitizeString(orderData.customer_name),
                customer_email: sanitizeString(orderData.customer_email),
                customer_phone: sanitizeString(orderData.customer_phone),
                customer_address: sanitizeString(orderData.customer_address)
            };
            
            console.log('Submitting order with customer:', sanitizeForLog(validatedOrderData.customer_name));
            const createdOrder = await orderService.createOrder(validatedOrderData);
            console.log('Order created with ID:', sanitizeForLog(createdOrder?.id || 'unknown'));
            
            // Send email notifications
            try {
                await emailService.sendOrderConfirmation({
                    ...validatedOrderData,
                    order_number: createdOrder.order_number
                });
                console.log('Order confirmation emails sent');
            } catch (emailError) {
                console.error('Failed to send confirmation emails:', emailError);
            }
            
            if (!createdOrder) {
                throw new Error('Order creation failed - no data returned');
            }
            
            // Clear form and cart
            setCart([]);
            setShowCheckout(false);
            setShowMobileCart(false);
            setFormData({ name: '', email: '', phone: '', address: '' });
            
            // Navigate to thank you page with sanitized data
            const sanitizedOrderNumber = sanitizeString(createdOrder.order_number || '');
            const safeOrderData = {
                customer_name: sanitizeString(validatedOrderData.customer_name),
                customer_email: sanitizeString(validatedOrderData.customer_email),
                customer_phone: sanitizeString(validatedOrderData.customer_phone),
                customer_address: sanitizeString(validatedOrderData.customer_address),
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
            console.error('Order submission failed:', sanitizeForLog(error));
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
        loadCategories();
        loadSubcategories();
        
        // Listen for cart updates to force re-render
        const handleCartUpdate = () => {
            setCart(prevCart => [...prevCart]);
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const loadProducts = async () => {
        try {
            const { supabase } = await import('@/supabase/client');
            const { data, error } = await supabase
                .from('products')
                .select('id, title, category_id, subcategory_id, price, image, stock_quantity')
                .eq('is_active', true)
                .limit(50);
            
            if (error) throw error;
            
            const sanitizedProducts = (data || []).map((product: any) => ({
                ...product,
                id: sanitizeString(product.id || ''),
                name: sanitizeString(product.title || ''),
                category: sanitizeString(product.category || ''),
                price: Math.max(0, Number(product.price) || 0),
                stock: Math.max(0, Number(product.stock_quantity) || 0)
            }));
            setDbProducts(sanitizedProducts);
        } catch (err) {
            console.error('Failed to load products:', sanitizeForLog(err));
        }
    };

    const loadCategoryImages = async () => {
        try {
            const data = await executeQuery(() => categoryService.getCategoryImages());
            setCategoryImages(data || []);
        } catch (err) {
            console.error('Failed to load category images:', sanitizeForLog(err));
        }
    };

    const loadCategories = async () => {
        try {
            const { supabase } = await import('@/supabase/client');
            const { data, error } = await supabase
                .from('product_categories')
                .select('id, name, image_url, position')
                .eq('is_active', true)
                .order('position');
            
            if (error) throw error;
            setDbCategories(data || []);
        } catch (err) {
            console.error('Failed to load categories:', sanitizeForLog(err));
        }
    };

    const loadSubcategories = async () => {
        try {
            const { supabase } = await import('@/supabase/client');
            const { data, error } = await supabase
                .from('product_subcategories')
                .select('*')
                .eq('is_active', true)
                .order('position');
            
            if (error) throw error;
            setDbSubcategories(data || []);
        } catch (err) {
            console.error('Failed to load subcategories:', sanitizeForLog(err));
        }
    };

    const getProductsByCategory = (categoryName: string) => {
        const sanitizedCategory = sanitizeString(categoryName);
        
        // Find category by name
        const category = dbCategories.find(cat => cat.name === sanitizedCategory);
        if (!category) return [];
        
        // Get subcategories for this category
        const categorySubcategories = dbSubcategories.filter(sub => sub.category_id === category.id);
        
        // If category has subcategories, show subcategories as products
        if (categorySubcategories.length > 0) {
            return categorySubcategories.map(subcategory => {
                // Get all products for this subcategory
                const allSubcategoryProducts = dbProducts.filter(p => p.subcategory_id === subcategory.id);
                const productsWithStock = allSubcategoryProducts.filter(p => (p.stock || p.stock_quantity || 0) > 0);
                const firstProduct = allSubcategoryProducts[0];
                
                return {
                    id: subcategory.id,
                    name: subcategory.name,
                    price: firstProduct ? `From ${firstProduct.price} BDT` : 'Coming Soon',
                    gangType: subcategory.name,
                    imageUrl: subcategory.image_url || firstProduct?.image || '/images/smart_switch/3 gang mechanical.webp',
                    isSoldOut: false
                };
            });
        }
        
        // If no subcategories, show direct products
        const directProducts = dbProducts.filter(p => p.category_id === category.id && !p.subcategory_id);
        return directProducts.map(p => ({
            id: p.id,
            name: p.title,
            price: `${p.price.toLocaleString()} BDT`,
            gangType: p.title,
            imageUrl: '/images/smart_switch/3 gang mechanical.webp',
            isSoldOut: p.stock_quantity === 0
        }));
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
        console.log('addToCart called with:', sanitizeForLog(product));
        setCart((currentCart) => {
            console.log('Current cart before adding:', sanitizeForLog(currentCart));
            
            // For Smart Curtain with specific track sizes, use the provided ID (already unique)
            if (product.category === 'Smart Curtain' && product.id.includes('_') && product.id.includes('ft')) {
                const newCart = [...currentCart, { ...product, quantity: 'quantity' in product ? product.quantity : 1 }];
                console.log('New cart after adding Smart Curtain:', sanitizeForLog(newCart));
                return newCart;
            }
            
            // For PDLC Film and other Smart Curtain, always add as new item with unique ID
            if (product.category === 'PDLC Film' || product.category === 'Film' || product.category === 'Smart Curtain') {
                const uniqueId = `${sanitizeString(product.id)}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                return [...currentCart, { ...product, id: uniqueId, quantity: 'quantity' in product ? product.quantity : 1 }];
            }
            
            // For Security products with accessories, always add as new item with unique ID
            if (product.category === 'Security' && 'accessories' in product && product.accessories && product.accessories.length > 0) {
                const uniqueId = `${sanitizeString(product.id)}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                return [...currentCart, { ...product, id: uniqueId, quantity: 'quantity' in product ? product.quantity : 1 }];
            }
            
            // For other products, check for existing items
            const sanitizedProductId = sanitizeString(product.id);
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
        // Don't auto-open mobile cart on add
    };

    const removeFromCart = (productId: string) => {
        const sanitizedId = sanitizeString(productId);
        setCart((currentCart) =>
            currentCart.filter((item) => item.id !== sanitizedId)
        );
    };

    const updateQuantity = (productId: string, delta: number) => {
        const sanitizedId = sanitizeString(productId);
        setCart((currentCart) =>
            currentCart.map((item) => {
                if (item.id === sanitizedId) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity > 0) {
                        // For items with installation, recalculate price based on new quantity
                        if (item.installationCharge && (item.category === 'Smart Switch' || item.category === 'Smart Curtain' || item.category === 'Switch')) {
                            const basePrice = (item.category === 'Smart Switch' || item.category === 'Switch') ? 
                                (item.price - item.installationCharge) / item.quantity :
                                item.category === 'Smart Curtain' && item.trackSizes ? 
                                (item.price - item.installationCharge) / item.quantity : item.price / item.quantity;
                            const newPrice = (basePrice * newQuantity) + item.installationCharge;
                            return { ...item, quantity: newQuantity, price: newPrice };
                        }
                        // For Lighting items, recalculate price based on quantity
                        if (item.category === 'Lighting') {
                            const unitPrice = item.price / item.quantity;
                            const newPrice = unitPrice * newQuantity;
                            return { ...item, quantity: newQuantity, price: newPrice };
                        }
                        return { ...item, quantity: newQuantity };
                    }
                }
                return item;
            }).filter(item => item.id !== sanitizedId || item.quantity > 0)
        );
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => {
            let itemTotal = 0;
            
            // For items with pre-calculated totals (Smart Curtains with tracks or Smart Switches with installation)
            if ((item.category === 'Smart Curtain' && item.trackSizes) || (item.category === 'Smart Switch' && item.installationCharge) || (item.category === 'Switch' && item.installationCharge) || item.category === 'Lighting') {
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

    const categories = dbCategories.length > 0 ? getCategoryProducts(dbCategories, categoryImages) : products;
    
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
        const handleScroll = () => {
            if (isManualSelection) return;
            
            const container = document.querySelector('.products-scroll-container');
            if (!container) return;
            
            const scrollTop = container.scrollTop + 100;
            let foundCategory = null;
            
            // Find the category that's currently in view
            for (let i = allProductsByCategory.length - 1; i >= 0; i--) {
                const group = allProductsByCategory[i];
                const element = document.getElementById(`category-${group.category.replace(/\s+/g, '-')}`);
                if (element && scrollTop >= element.offsetTop) {
                    foundCategory = group.category;
                    break;
                }
            }
            
            if (foundCategory && activeCategory !== foundCategory) {
                setActiveCategory(foundCategory);
            }
        };

        const scrollContainer = document.querySelector('.products-scroll-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [allProductsByCategory, activeCategory, isManualSelection]);

    // Add CSS styles via useEffect for proper lifecycle management
    useEffect(() => {
        if (typeof document !== 'undefined' && !document.head.querySelector('style[data-category-bar]')) {
            const style = document.createElement('style');
            style.textContent = `
                .category-bar-container::-webkit-scrollbar { display: none; }
                .category-bar-container { -ms-overflow-style: none; scrollbar-width: none; }
                .category-bar-container { scroll-behavior: smooth; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .sticky-checkout-section { position: relative; }
                .scroll-lock-container { overscroll-behavior: contain; }
                .products-scroll-container { 
                    overscroll-behavior: auto;
                    -webkit-overflow-scrolling: touch;
                    overflow: auto !important;
                    height: 100% !important;
                }
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
                /* Android-specific touch improvements */
                .category-tab-button {
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }
            `;
            style.setAttribute('data-category-bar', 'true');
            document.head.appendChild(style);
        }
    }, []);

    return (
        <>
            <div className="w-full lg:max-w-7xl lg:mx-auto px-0 lg:px-6 min-h-screen flex lg:flex-row flex-col gap-0 lg:gap-6 sticky-checkout-section" data-main-container>
            {/* Product Selection Section */}
            <div className="flex-1 lg:w-[65%] bg-white rounded-none lg:rounded-xl shadow-lg border-0 lg:border border-gray-200/60 overflow-hidden h-[60vh] lg:h-[calc(100vh-120px)]">
                <div className="overflow-y-auto products-scroll-container h-full" data-scroll-container style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
                {/* Category Tabs */}
                <div className="mb-3 lg:mb-6 sticky top-0 bg-gray-100 z-40 pt-2 pb-2 lg:pt-4 lg:pb-3 shadow-sm border-b border-gray-300">
                    <div className="flex gap-2 px-2 lg:px-4 overflow-x-auto scrollbar-hide category-bar-container">
                        {categories.map((category) => (
                            <motion.button
                                key={category.id}
                                data-category={category.category}

                                onClick={(e) => {
                                    const isAndroid = /Android/i.test(navigator.userAgent);
                                    const isMobile = window.innerWidth < 1024;
                                    
                                    setIsManualSelection(true);
                                    setActiveCategory(category.category);
                                    
                                    // Auto-scroll tab to center on mobile
                                    if (isMobile) {
                                        const tabContainer = e.currentTarget.parentElement;
                                        const tab = e.currentTarget;
                                        if (tabContainer && tab) {
                                            const containerWidth = tabContainer.offsetWidth;
                                            const tabLeft = tab.offsetLeft;
                                            const tabWidth = tab.offsetWidth;
                                            const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
                                            tabContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                                        }
                                    }
                                    
                                    if (!isAndroid) {
                                        // Desktop and iPhone: scroll to section
                                        setTimeout(() => {
                                            const targetId = `category-${category.category.replace(/\s+/g, '-')}`;
                                            const element = document.getElementById(targetId);
                                            const container = document.querySelector('.products-scroll-container');
                                            
                                            if (element && container) {
                                                const targetScrollTop = element.offsetTop - 80;
                                                container.scrollTo({
                                                    top: targetScrollTop,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }, 50);
                                    }
                                    
                                    setTimeout(() => setIsManualSelection(false), 1000);
                                }}
                                onPointerDown={(e) => {
                                    const isAndroid = /Android/i.test(navigator.userAgent);
                                    if (isAndroid) {
                                        e.preventDefault();
                                        setActiveCategory(category.category);
                                    }
                                }}
                                className={cn(
                                    "category-tab-button flex-shrink-0 flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-all duration-300 whitespace-nowrap border group relative overflow-hidden text-xs lg:text-sm touch-manipulation",
                                    activeCategory === category.category
                                        ? "bg-[#0a1d3a] text-white border-[#0a1d3a] shadow-md"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                )}

                                whileTap={{ scale: 0.95 }}
                                style={{ touchAction: 'manipulation', cursor: 'pointer', userSelect: 'none' }}
                            >
                                <span className="text-xs lg:text-base font-medium whitespace-nowrap relative z-10 flex items-center gap-1.5">
                                    {/* Always show an icon */}
                                    {(category.name?.toLowerCase().includes('curtain') || category.category?.toLowerCase().includes('curtain')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zM5 7h2v10H5V7zm4 0h2v10H9V7zm4 0h2v10h-2V7zm4 0h2v10h-2V7z"/>
                                        </svg>
                                    )}
                                    {(category.name?.toLowerCase().includes('switch') || category.category?.toLowerCase().includes('switch')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                                        </svg>
                                    )}
                                    {(category.name?.toLowerCase().includes('security') || category.category?.toLowerCase().includes('security')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V18H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
                                        </svg>
                                    )}
                                    {(category.name?.toLowerCase().includes('pdlc') || category.name?.toLowerCase().includes('film') || category.category?.toLowerCase().includes('pdlc') || category.category?.toLowerCase().includes('film')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="2" y="4" width="20" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                            <rect x="3" y="5" width="9" height="14" fill="currentColor" opacity="0.1"/>
                                            <rect x="12" y="5" width="9" height="14" fill="currentColor" opacity="0.6"/>
                                            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
                                            <circle cx="19" cy="7" r="1.5" fill="currentColor"/>
                                            <path d="M17.5 6.5l3 1M17.5 7.5l3-1" stroke="currentColor" strokeWidth="0.8"/>
                                            <rect x="16.5" y="15" width="3" height="4" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                                            <circle cx="18" cy="17" r="0.3" fill="currentColor"/>
                                        </svg>
                                    )}
                                    {(category.name?.toLowerCase().includes('service') || category.category?.toLowerCase().includes('service')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    )}
                                    {(category.name?.toLowerCase().includes('light') || category.category?.toLowerCase().includes('light')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>
                                        </svg>
                                    )}
                                    {(category.name?.toLowerCase().includes('privacy') || category.category?.toLowerCase().includes('privacy')) && (
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="2" y="4" width="20" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                            <rect x="3" y="5" width="9" height="14" fill="currentColor" opacity="0.1"/>
                                            <rect x="12" y="5" width="9" height="14" fill="currentColor" opacity="0.6"/>
                                            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
                                            <circle cx="19" cy="7" r="1.5" fill="currentColor"/>
                                            <path d="M17.5 6.5l3 1M17.5 7.5l3-1" stroke="currentColor" strokeWidth="0.8"/>
                                            <rect x="16.5" y="15" width="3" height="4" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                                            <circle cx="18" cy="17" r="0.3" fill="currentColor"/>
                                        </svg>
                                    )}
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
                    {(() => {
                        const isAndroid = /Android/i.test(navigator.userAgent);
                        const categoriesToShow = isAndroid 
                            ? allProductsByCategory.filter(categoryGroup => categoryGroup.category === activeCategory)
                            : allProductsByCategory;
                        
                        return categoriesToShow.map((categoryGroup, index) => (
                            <div key={categoryGroup.category} id={`category-${categoryGroup.category.replace(/\s+/g, '-')}`} className="mb-8">
                            {/* Section Title - Always Show */}
                            <div className="mb-3 lg:mb-6 px-0 lg:px-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-gray-900 border-b-2 border-green-500 pb-1 lg:pb-2 inline-block" style={{ fontSize: '20px' }}>
                                        {categoryGroup.category}
                                    </h2>
                                </div>
                            </div>

                            {/* Product Grid or No Products Message */}
                            {categoryGroup.products.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-0 lg:px-4 relative z-0">
                                    {categoryGroup.products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-none lg:rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-2 lg:p-1.5 relative cursor-pointer border-0 lg:border border-gray-200 hover:border-green-300 group aspect-square flex flex-col hover:scale-[1.02]"
                
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
                                if (product.id === 'sensors-1') {
                                    const sensorsVariant = {
                                        id: 'sensors-1',
                                        name: 'Sensors',
                                        price: '2499 BDT',
                                        gangType: 'Security',
                                        imageUrl: '/images/sohub_protect/accesories/Motion_pr200.png'
                                    };
                                    setSelectedVariant(sensorsVariant);
                                    setSensorsSelectionModalOpen(true);
                                    return;
                                }
                                if (product.id === 'camera-1') {
                                    const cameraVariant = {
                                        id: 'camera-1',
                                        name: 'Camera',
                                        price: '8999 BDT',
                                        gangType: 'Security',
                                        imageUrl: '/images/sohub_protect/accesories/camera-c11.png'
                                    };
                                    setSelectedVariant(cameraVariant);
                                    setCameraSelectionModalOpen(true);
                                    return;
                                }
                                if (product.id === 'light-switch-1') {
                                    // Find actual light switch products from database
                                    const lightSwitchProducts = dbProducts.filter(p => 
                                        p.category === 'Switch' && 
                                        ['light', 'touch', '4 gang', '3 gang', 'mechanical'].some(term => 
                                            p.name.toLowerCase().includes(term.toLowerCase())
                                        )
                                    );
                                    
                                    // Use first available light switch product or fallback
                                    const firstLightSwitch = lightSwitchProducts[0];
                                    const lightSwitchVariant = {
                                        id: firstLightSwitch?.id || 'light-switch-1',
                                        name: firstLightSwitch?.name || 'Light Switch',
                                        price: firstLightSwitch ? `${firstLightSwitch.price} BDT` : '299 BDT',
                                        gangType: 'Light Switch',
                                        imageUrl: firstLightSwitch?.image || '/images/smart_switch/one gang.webp'
                                    };
                                    setSelectedVariant(lightSwitchVariant);
                                    setLightSwitchModalOpen(true);
                                    return;
                                }
                                if (product.id === 'fan-switch-1') {
                                    // Find actual fan switch products from database
                                    const fanSwitchProducts = dbProducts.filter(p => 
                                        p.category === 'Switch' && 
                                        p.name.toLowerCase().includes('fan')
                                    );
                                    
                                    // Use first available fan switch product or fallback
                                    const firstFanSwitch = fanSwitchProducts[0];
                                    const fanSwitchVariant = {
                                        id: firstFanSwitch?.id || 'fan-switch-1',
                                        name: firstFanSwitch?.name || 'Fan Switch',
                                        price: firstFanSwitch ? `${firstFanSwitch.price} BDT` : '399 BDT',
                                        gangType: 'Fan Switch',
                                        imageUrl: firstFanSwitch?.image || '/images/smart_switch/fan touch switch.webp'
                                    };
                                    setSelectedVariant(fanSwitchVariant);
                                    setFanSwitchModalOpen(true);
                                    return;
                                }
                                if (product.id === 'boiler-switch-1') {
                                    // Find actual boiler switch products from database
                                    const boilerSwitchProducts = dbProducts.filter(p => 
                                        p.category === 'Switch' && 
                                        ['boiler', '1 gang', 'one gang'].some(term => 
                                            p.name.toLowerCase().includes(term.toLowerCase())
                                        )
                                    );
                                    
                                    // Use first available boiler switch product or fallback
                                    const firstBoilerSwitch = boilerSwitchProducts[0];
                                    const boilerSwitchVariant = {
                                        id: firstBoilerSwitch?.id || 'boiler-switch-1',
                                        name: firstBoilerSwitch?.name || 'Boiler Switch',
                                        price: firstBoilerSwitch ? `${firstBoilerSwitch.price} BDT` : '499 BDT',
                                        gangType: 'Boiler Switch',
                                        imageUrl: firstBoilerSwitch?.image || '/images/smart_switch/one gang.webp'
                                    };
                                    setSelectedVariant(boilerSwitchVariant);
                                    setBoilerSwitchModalOpen(true);
                                    return;
                                }
                                const variant = categoryGroup.products.find(p => p.id === product.id);
                                setSelectedVariant(variant);
                                setSelectedProduct(categoryToIdMap[categoryGroup.category] || '3');
                                
                                // Debug logging
                                console.log('Product clicked:', product.name, 'Category:', categoryGroup.category);
                                
                                // Open appropriate modal based on category and product
                                const modalType = getModalType(categoryGroup.category, product.name);
                                console.log('Modal type determined:', modalType);
                                
                                switch (modalType) {
                                    case 'slider': 
                                        console.log('Opening slider curtain modal');
                                        setSliderCurtainModalOpen(true); 
                                        break;
                                    case 'roller': 
                                        console.log('Opening roller curtain modal');
                                        setRollerCurtainModalOpen(true); 
                                        break;
                                    case 'curtain':
                                    case 'curtains':
                                        console.log('Opening default curtain modal (roller)');
                                        setRollerCurtainModalOpen(true); 
                                        break;
                                    case 'pdlc film': 
                                    case 'pdlc':
                                    case 'film':
                                        console.log('Opening PDLC film modal');
                                        setPdlcFilmModalOpen(true); 
                                        break;
                                    case 'sensors':
                                        console.log('Opening sensors selection modal');
                                        setSensorsSelectionModalOpen(true);
                                        break;
                                    case 'camera':
                                        console.log('Opening camera selection modal');
                                        setCameraSelectionModalOpen(true);
                                        break;
                                    case 'securityBox': setSmartSecurityBoxModalOpen(true); break;
                                    case 'securityPanel': setSecurityPanelModalOpen(true); break;
                                    case 'sohubProtect': setSohubProtectModalOpen(true); break;
                                    case 'smartSwitch': setSmartSwitchModalOpen(true); break;
                                    case 'lightSwitch': 
                                        console.log('Opening light switch modal');
                                        setLightSwitchModalOpen(true); 
                                        break;
                                    case 'fanSwitch': setFanSwitchModalOpen(true); break;
                                    case 'boilerSwitch': setBoilerSwitchModalOpen(true); break;
                                    case 'lighting':
                                        if (product.name.toLowerCase().includes('spot')) {
                                            console.log('Opening spot light modal');
                                            setSpotLightModalOpen(true);
                                        } else if (product.name.toLowerCase().includes('strip')) {
                                            console.log('Opening strip light modal');
                                            setStripLightModalOpen(true);
                                        } else {
                                            console.log('Opening default spot light modal');
                                            setSpotLightModalOpen(true);
                                        }
                                        break;
                                    case 'switch':
                                    case 'switches':
                                        console.log('Opening default switch modal (light switch)');
                                        setLightSwitchModalOpen(true);
                                        break;
                                    default: 
                                        // Check if it's PDLC Film by category or name
                                        if (categoryGroup.category.toLowerCase().includes('pdlc') || 
                                            categoryGroup.category.toLowerCase().includes('film') ||
                                            product.name.toLowerCase().includes('pdlc') ||
                                            product.name.toLowerCase().includes('film')) {
                                            console.log('Opening PDLC film modal (default case)');
                                            setPdlcFilmModalOpen(true);
                                        } else {
                                            setModalOpen(true);
                                        }
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
                            <div className="flex-1 flex items-center justify-center bg-white rounded-sm overflow-hidden transition-all duration-300 p-1 lg:p-0.5 mb-1 lg:mb-1">
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
                                <h3 className="font-medium text-gray-900 text-xs lg:text-sm leading-tight truncate font-apple">
                                    {product.name}
                                </h3>

                            </div>
                            

                                    </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <p>No products available in this category</p>
                                </div>
                            )}
                        </div>
                        ));
                    })()}
                </div>
            </div>
            </div>

            {/* Mobile Cart Toggle Button */}
            {!showMobileCart && cart.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowMobileCart(true)}
                    className="lg:hidden fixed bottom-4 right-4 bg-[#0a1d3a] text-white p-3 rounded-full shadow-lg z-50 flex items-center gap-2"
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                    </span>
                </motion.button>
            )}

            {/* Mobile Cart Backdrop */}
            {showMobileCart && (
                <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowMobileCart(false)} />
            )}
            
            {/* Cart Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                    "flex-shrink-0 lg:w-[35%] flex flex-col",
                    "fixed bottom-0 left-0 right-0 lg:relative",
                    showCheckout ? "top-0" : "",
                    "p-4 lg:p-5 rounded-t-2xl lg:rounded-xl",
                    "bg-white lg:bg-gray-100 shadow-2xl border-t-2 border-gray-200 lg:border lg:border-gray-300",
                    "z-50 lg:z-auto overflow-hidden",
                    !showMobileCart && "hidden lg:flex"
                )}
                style={{ 
                    height: showCheckout ? (window.innerWidth < 1024 ? '100vh' : 'auto') : (window.innerWidth < 1024 ? '80vh' : 'calc(100vh - 120px)'), 
                    minHeight: showCheckout ? (window.innerWidth < 1024 ? '100vh' : '600px') : (window.innerWidth < 1024 ? '80vh' : 'calc(100vh - 120px)'), 
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
                                    Back to Bag
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
                            
                            <div className="flex-1 overflow-y-auto -mx-2 lg:-mx-4 px-2 lg:px-4 pb-20 lg:pb-4" style={{ scrollBehavior: 'auto' }}>
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

                            <div className="fixed lg:sticky bottom-0 left-0 right-0 lg:relative bg-white dark:bg-zinc-900 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 -mx-2 lg:-mx-4 px-2 lg:px-4 shadow-lg lg:shadow-none z-10">
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
                                        <ShoppingBag className="w-5 h-5 text-[#0a1d3a]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 leading-none">Shopping Bag</h2>
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

                            <div className="flex-1 overflow-y-auto min-h-0 max-h-[60vh] lg:max-h-none space-y-3 bg-gray-50 lg:bg-white rounded-xl p-4 cart-scroll border border-gray-200 shadow-inner">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-base font-medium text-gray-700 mb-1">Bag is empty</h3>
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
                                                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 shadow-sm"
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
                                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-1">
                                                                {item.category}
                                                            </h3>
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight mb-1">
                                                                {item.name}
                                                            </p>
                                                            {(item.name.includes('ZIGBEE') || item.name.includes('WIFI') || item.connectionType || item.model) ? (
                                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                    Model: {item.model || (item.name.includes('ZIGBEE') ? 'Zigbee' : item.name.includes('WIFI') ? 'Wifi' : item.connectionType || 'Standard')}
                                                                </p>
                                                            ) : null}
                                                            {(item.trackSize || item.name.match(/\d+\.\d+m\([^)]+\)/) || item.name.includes('Standard') || item.name.includes('Large') || item.name.includes('Extra Large')) ? (
                                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                    Variant: {item.name.includes('Standard (up to 8 feet)') ? 'Standard (up to 8 feet)' : 
                                                                             item.name.includes('Large (8-12 feet)') ? 'Large (8-12 feet) - Requires 2 motors' :
                                                                             item.name.includes('Extra Large (12+ feet)') ? 'Extra Large (12+ feet) - Custom quote' :
                                                                             (typeof item.trackSize === 'string' && item.trackSize !== '8') ? item.trackSize :
                                                                             item.name.match(/\d+\.\d+m\([^)]+\)/)?.[0] || ''}
                                                                </p>
                                                            ) : null}
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
                                                        {(item.category === 'Services' || item.category === 'Installation Service') && (
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {item.category === 'Services' || item.category === 'Installation Service' ? (
                                                            <div className="text-sm text-gray-600">
                                                                {item.category === 'Installation Service' ? 'Professional Installation Service (TBD)' : 'Consultation Service'}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                                                                <button
                                                                    onClick={() => {
                                                                        if (item.quantity === 1) {
                                                                            removeFromCart(item.id);
                                                                        } else {
                                                                            updateQuantity(item.id, -1);
                                                                        }
                                                                    }}
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
                                                                    if ((item.category === 'Smart Curtain' && item.trackSizes) || (item.category === 'Smart Switch' && item.installationCharge) || (item.category === 'Switch' && item.installationCharge) || item.category === 'Lighting') {
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
                                                        name: sanitizeString(item.name),
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
                        // For subcategory products, get actual products from that subcategory
                        if (selectedVariant.gangType && dbSubcategories.find(sub => sub.name === selectedVariant.gangType)) {
                            const subcategory = dbSubcategories.find(sub => sub.name === selectedVariant.gangType);
                            const subcategoryProducts = dbProducts.filter(p => p.subcategory_id === subcategory?.id);
                            const firstProduct = subcategoryProducts[0];
                            
                            return {
                                id: selectedVariant.id,
                                name: selectedVariant.name,
                                category: selectedVariant.gangType || 'Product',
                                price: firstProduct ? firstProduct.price : parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                                description: firstProduct?.overview || '',
                                detailed_description: firstProduct?.technical_details || '',
                                features: firstProduct?.overview || '',
                                specifications: firstProduct?.technical_details || '',
                                warranty: firstProduct?.warranty || '',
                                installation_included: firstProduct?.installation_included || false,
                                image: selectedVariant.imageUrl,
                                image2: firstProduct?.image2 || '',
                                image3: firstProduct?.image3 || '',
                                image4: firstProduct?.image4 || '',
                                image5: firstProduct?.image5 || '',
                                stock: firstProduct?.stock || 0,
                                subcategoryProducts: subcategoryProducts
                            };
                        }
                        
                        // For direct products
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Product',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: productData?.overview || '',
                            detailed_description: productData?.technical_details || '',
                            features: productData?.overview || '',
                            specifications: productData?.technical_details || '',
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
                                description: `${cartItem.name} added to bag for immediate purchase.`,
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
                        title: "Added to Bag",
                        description: `${cartItem.name} has been added to your bag.`,
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
                        title: "Added to Bag",
                        description: `${cartItem.name} has been added to your bag.`,
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
            
            {/* Light Switch Modal */}
            {selectedVariant && (
                <LightSwitchModal
                    open={lightSwitchModalOpen}
                    onOpenChange={(open) => {
                        setLightSwitchModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return productData ? {
                            ...productData,
                            gang_1_image: productData.gang_1_image,
                            gang_2_image: productData.gang_2_image,
                            gang_3_image: productData.gang_3_image,
                            gang_4_image: productData.gang_4_image,
                            additional_image_1: productData.additional_image_1,
                            additional_image_2: productData.additional_image_2,
                            additional_image_3: productData.additional_image_3,
                            additional_image_4: productData.additional_image_4,
                            additional_image_5: productData.additional_image_5,
                            engraving_available: productData.engraving_available || true,
                            engraving_price: productData.engraving_price || 200,
                            engraving_image: productData.engraving_image || '',
                            engraving_text_color: productData.engraving_text_color || '#000000'
                        } : {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Switch',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: '',
                            image: selectedVariant.imageUrl,
                            stock: 0,
                            engraving_available: true,
                            engraving_price: 200,
                            engraving_image: '',
                            engraving_text_color: '#000000'
                        };
                    })()} 
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: payload.productName || `${selectedVariant.name}${payload.engravingText ? ` (Engraved: "${payload.engravingText}")` : ''}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Switch',
                                image: selectedVariant.imageUrl,
                                color: 'Switch',
                                quantity: payload.quantity,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Light Switch products
                    }}
                />
            )}
            
            {/* Fan Switch Modal */}
            {selectedVariant && (
                <FanSwitchModal
                    open={fanSwitchModalOpen}
                    onOpenChange={(open) => {
                        setFanSwitchModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return productData ? {
                            ...productData,
                            additional_image_1: productData.additional_image_1,
                            additional_image_2: productData.additional_image_2,
                            additional_image_3: productData.additional_image_3,
                            additional_image_4: productData.additional_image_4,
                            additional_image_5: productData.additional_image_5
                        } : {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Switch',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: '',
                            image: selectedVariant.imageUrl,
                            stock: 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${selectedVariant.name}${payload.engravingText ? ` (Engraved: "${payload.engravingText}")` : ''}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Switch',
                                image: selectedVariant.imageUrl,
                                color: 'Switch',
                                quantity: payload.quantity,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Fan Switch products
                    }}
                />
            )}
            
            {/* Boiler Switch Modal */}
            {selectedVariant && (
                <BoilerSwitchModal
                    open={boilerSwitchModalOpen}
                    onOpenChange={(open) => {
                        setBoilerSwitchModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return productData ? {
                            ...productData,
                            additional_image_1: productData.additional_image_1,
                            additional_image_2: productData.additional_image_2,
                            additional_image_3: productData.additional_image_3,
                            additional_image_4: productData.additional_image_4,
                            additional_image_5: productData.additional_image_5
                        } : {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Switch',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')),
                            description: '',
                            image: selectedVariant.imageUrl,
                            stock: 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${selectedVariant.name}${payload.engravingText ? ` (Engraved: "${payload.engravingText}")` : ''}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice,
                                category: 'Switch',
                                image: selectedVariant.imageUrl,
                                color: 'Switch',
                                quantity: payload.quantity,
                                installationCharge: payload.installationCharge
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Boiler Switch products
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
            
            {/* Sensors Selection Modal */}
            {selectedVariant && (
                <SensorsSelectionModal
                    open={sensorsSelectionModalOpen}
                    onOpenChange={(open) => {
                        setSensorsSelectionModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={selectedVariant}
                    addToCart={addToCart}
                />
            )}
            
            {/* Camera Selection Modal */}
            {selectedVariant && (
                <CameraSelectionModal
                    open={cameraSelectionModalOpen}
                    onOpenChange={(open) => {
                        setCameraSelectionModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={selectedVariant}
                    addToCart={addToCart}
                />
            )}
            
            {/* Spot Light Modal */}
            {selectedVariant && (
                <SpotLightModal
                    open={spotLightModalOpen}
                    onOpenChange={(open) => {
                        setSpotLightModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return productData ? {
                            ...productData
                        } : {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Lighting',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')) || 1000,
                            description: '',
                            image: selectedVariant.imageUrl,
                            stock: 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${selectedVariant.name}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice || 1000,
                                category: 'Lighting',
                                image: selectedVariant.imageUrl,
                                color: 'Lighting',
                                quantity: payload.quantity || 1,
                                installationCharge: payload.installationCharge || 0,
                                model: payload.model,
                                connectionType: payload.connectionType
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Spot Light products
                    }}
                />
            )}

            {/* Strip Light Modal */}
            {selectedVariant && (
                <StripLightModal
                    open={stripLightModalOpen}
                    onOpenChange={(open) => {
                        setStripLightModalOpen(open);
                        if (!open) {
                            setSelectedVariant(null);
                        }
                    }}
                    product={(() => {
                        const productData = dbProducts.find(p => p.id === selectedVariant.id);
                        return productData ? {
                            ...productData
                        } : {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            category: selectedVariant.gangType || 'Lighting',
                            price: parseInt(selectedVariant.price.replace(/[^0-9]/g, '')) || 1500,
                            description: '',
                            image: selectedVariant.imageUrl,
                            stock: 0
                        };
                    })()}
                    addToCart={addToCart}
                    onAddToCart={async (payload) => {
                        if (selectedVariant && payload.productId) {
                            const cartItem = {
                                id: payload.productId,
                                name: `${selectedVariant.name}${payload.installationCharge > 0 ? ` + Installation` : ''}`,
                                price: payload.totalPrice || 1500,
                                category: 'Lighting',
                                image: selectedVariant.imageUrl,
                                color: 'Lighting',
                                quantity: payload.quantity || 1,
                                installationCharge: payload.installationCharge || 0,
                                model: payload.model,
                                connectionType: payload.connectionType
                            };
                            addToCart(cartItem);
                        }
                    }}
                    onBuyNow={async (payload) => {
                        // Handle buy now for Strip Light products
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
            
            {/* Remove Item Confirmation Modal */}
            {removeItemModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">Remove Item</h3>
                        <p className="text-gray-600 mb-4">Are you sure you want to remove "{removeItemModal.itemName}" from your bag?</p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setRemoveItemModal({ open: false, itemId: '', itemName: '' })}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => {
                                removeFromCart(removeItemModal.itemId);
                                setRemoveItemModal({ open: false, itemId: '', itemName: '' });
                            }}>
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export { InteractiveCheckout, type Product };

// CSS styles will be added via useEffect in component

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/supabase';
import { orderService } from '@/supabase/orders';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const { executeQuery } = useSupabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Mock orders data
  const mockOrders = [
    {
      id: '100011',
      customerName: 'Ahmed Rahman',
      orderStatus: 'Delivered',
      paymentStatus: 'Completed',
      date: '2024-01-15',
      phone: '01712345678',
      product: 'Smart Sliding Curtain - WiFi Motor',
      amount: '৳18,500',
      address: 'Flat #A5, House #12, Dhanmondi, Dhaka-1205'
    },
    {
      id: '100012',
      customerName: 'Fatima Khan',
      orderStatus: 'Processing',
      paymentStatus: 'Pending',
      date: '2024-01-20',
      phone: '01812345678',
      product: 'Smart Roller Curtain - Zigbee Motor',
      amount: '৳15,000',
      address: 'House #25, Road #8, Uttara, Dhaka-1230'
    }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto-search if order ID is provided in URL
    const orderId = searchParams.get('id');
    if (orderId) {
      setSearchQuery(orderId);
      handleSearchWithQuery(orderId);
    }
  }, [searchParams]);

  const validateInput = (query) => {
    if (!query.trim()) return false;
    // Check if it's a valid order ID (starts with ORD) or phone number (11 digits)
    const isOrderId = /^ORD\d+$/.test(query) || /^\d{6,}$/.test(query);
    const isPhoneNumber = /^\d{11}$/.test(query);
    return isOrderId || isPhoneNumber;
  };

  const handleSearchWithQuery = async (query) => {
    setError('');
    setHasSearched(true);
    
    if (!validateInput(query)) {
      setError('Please enter a valid Order ID or 11-digit phone number.');
      setOrders([]);
      return;
    }

    setLoading(true);
    
    try {
      const results = await orderService.searchOrders(query);
      setOrders(results || []);
    } catch (err) {
      console.error('Search error:', JSON.stringify(err, null, 2));
      setError('Failed to search orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => handleSearchWithQuery(searchQuery);

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-24">
        {/* Header Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Search className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6 tracking-tight">
              Track Your Order
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Enter your Order ID (e.g., 100011) or Phone Number (11 digits) to get real-time updates on your order status.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Order ID or Phone Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base md:text-lg py-3"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-6 md:px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span>Search</span>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Searching for your order...</p>
                </div>
              ) : orders.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Showing 1–{orders.length} of {orders.length} orders
                  </p>
                  <div className="grid gap-6">
                    {orders.map((order) => (
                      <Card key={order.id} className="p-4 md:p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="space-y-3 md:space-y-4">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-black">{order.customer_name}</h3>
                              <p className="text-gray-600">Order #{order.order_number}</p>
                            </div>
                          </div>

                          {/* Status Row */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Status:</span>
                              <Badge className={`${getStatusBadgeColor(order.status)} border`}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Payment:</span>
                              <Badge className={`${getStatusBadgeColor(order.payment_method)} border`}>
                                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                              </Badge>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                            <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                              <p className="text-xs font-medium text-gray-900">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                              <p className="text-xs font-medium text-gray-900">{order.customer_phone}</p>
                            </div>
                            <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Items</p>
                              <p className="text-xs font-medium text-gray-900">{order.items.length} item(s)</p>
                            </div>
                            <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                              <p className="text-xs font-medium text-gray-900">৳{order.total_amount.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Order Items</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <p key={idx} className="text-xs md:text-sm text-gray-900">
                                  {item.product_name} × {item.quantity}
                                </p>
                              ))}
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start space-x-2 p-2 md:p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                              <p className="text-xs md:text-sm text-gray-900">{order.customer_address}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">
                    No orders found for that ID or phone number. Please check your input and try again.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrderPage;
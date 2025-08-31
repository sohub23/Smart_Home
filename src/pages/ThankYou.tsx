import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  category: string;
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        setOrderData(JSON.parse(decodeURIComponent(data)));
      } catch (err) {
        console.error('Failed to parse order data:', err);
      }
    }
  }, [searchParams]);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-8 pt-24">
        {/* Compact Success Header */}
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-black mb-1">Order Confirmed!</h1>
          <p className="text-gray-700 text-sm">Thank you for your purchase</p>
        </div>

        {/* Compact Order Card */}
        <Card className="shadow-lg border-0 mb-6">
          <div className="p-6">
            {/* Header with Order ID */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Order Summary</h2>
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-sm font-mono font-bold text-green-800">
                  #{orderData.order_number || '10001'}
                </span>
              </div>
            </div>

            {/* Compact Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Customer */}
              <div className="bg-gray-50 p-3 rounded-lg border">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1 text-black">
                  <Package className="w-3 h-3" /> Customer
                </h3>
                <div className="text-xs text-gray-800 space-y-1">
                  <p className="font-medium">{orderData.customer_name}</p>
                  <p>{orderData.customer_phone}</p>
                </div>
              </div>
              
              {/* Address */}
              <div className="bg-gray-50 p-3 rounded-lg border">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1 text-black">
                  <MapPin className="w-3 h-3" /> Delivery
                </h3>
                <p className="text-xs text-gray-800 line-clamp-2">{orderData.customer_address}</p>
              </div>
              
              {/* Payment */}
              <div className="bg-gray-50 p-3 rounded-lg border">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1 text-black">
                  <CreditCard className="w-3 h-3" /> Payment
                </h3>
                <p className="text-xs text-gray-800 capitalize">
                  {orderData.payment_method === 'free' ? 'Free Service' : 
                   orderData.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
            </div>

            {/* Compact Items List */}
            <div className="mb-4">
              <h3 className="font-medium text-sm mb-3 text-black">Items Ordered</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orderData.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-black">{item.product_name}</p>
                      <p className="text-xs text-gray-700">{item.category} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-black">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-black">Total Amount</span>
                <span className="text-xl font-bold text-green-600">
                  {orderData.total_amount > 0 ? `৳${orderData.total_amount.toLocaleString()}` : 'FREE'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Compact Actions */}
        <div className="flex justify-center gap-3">
          <Link to="/#order">
            <Button variant="outline" size="sm">Continue Shopping</Button>
          </Link>
          <Link to={`/track-order?id=${orderData.order_number || '10001'}`}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Track Order
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ThankYou;
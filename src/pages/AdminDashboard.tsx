import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, CreditCard, Banknote, Users, Eye, ArrowUpRight } from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase, orderService, productService } from '@/supabase';

const AdminDashboard = () => {
  const { executeQuery } = useSupabase();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    codOrders: 0,
    onlineOrders: 0
  });
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Use the exact same method as AdminOrders page
      const data = await executeQuery(() => orderService.getOrders());
      const orders = data || [];
      
      console.log('📊 Orders loaded:', orders.length, orders);
      
      // Calculate today's stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at).toDateString();
        return orderDate === today;
      });
      
      // Show recent orders (last 10) for display
      const displayOrders = orders.slice(0, 10);
      
      const todayStats = {
        totalOrders: todayOrders.length,
        revenue: todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        codOrders: todayOrders.filter(order => order.payment_method === 'cod').length,
        onlineOrders: todayOrders.filter(order => order.payment_method === 'online').length
      };

      setStats(todayStats);
      setTodaysOrders(displayOrders);
      
      // Load products for low stock
      const products = await executeQuery(() => productService.getProducts());
      const lowStock = products?.filter(product => product.stock <= 5) || [];
      setLowStockItems(lowStock.slice(0, 3));
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const metrics = [
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toString(), 
      subtitle: 'Today', 
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    { 
      title: 'Revenue', 
      value: `৳${stats.revenue.toLocaleString()}`, 
      subtitle: 'Today', 
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    { 
      title: 'COD Orders', 
      value: stats.codOrders.toString(), 
      subtitle: `${stats.totalOrders ? Math.round((stats.codOrders / stats.totalOrders) * 100) : 0}% of orders`, 
      icon: Banknote,
      color: 'from-orange-500 to-orange-600',
      change: '+5%'
    },
    { 
      title: 'Online Orders', 
      value: stats.onlineOrders.toString(), 
      subtitle: `${stats.totalOrders ? Math.round((stats.onlineOrders / stats.totalOrders) * 100) : 0}% of orders`, 
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      change: '+15%'
    },
  ];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center text-emerald-600 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-sm font-semibold text-gray-900 mb-1">{metric.title}</p>
                <p className="text-xs text-gray-500">{metric.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Today's Order Report */}
        <Card className="border-0 shadow-lg mb-6 md:mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {stats.totalOrders > 0 ? "Today's Order Report" : "Recent Orders"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {stats.totalOrders > 0 
                      ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : `Showing ${todaysOrders.length} recent orders`
                    }
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                Export Report
              </Button>
            </div>
            
            {todaysOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysOrders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-mono text-sm text-blue-600">#{order.order_number || order.id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">{order.customer_name?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{order.customer_name}</div>
                              <div className="text-xs text-gray-500">{order.customer_phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${
                            order.payment_method === 'online' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-orange-100 text-orange-800 border-orange-200'
                          } border`}>
                            {order.payment_method === 'online' ? 'Online' : 'COD'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(order.status)} border`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="font-bold text-gray-900">৳{order.total_amount?.toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Summary Row */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                        <div className="text-xs text-gray-600">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">৳{stats.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{stats.codOrders}</div>
                        <div className="text-xs text-gray-600">COD Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{stats.onlineOrders}</div>
                        <div className="text-xs text-gray-600">Online Orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Average Order Value</div>
                      <div className="text-xl font-bold text-gray-900">
                        ৳{stats.totalOrders > 0 ? Math.round(stats.revenue / stats.totalOrders).toLocaleString() : '0'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Today</h3>
                <p className="text-gray-500 mb-4">Orders will appear here when customers place them</p>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  View All Orders
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Low Stock Alert */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Inventory Alerts</h2>
                    <p className="text-sm text-gray-500">{lowStockItems.length} items need attention</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {lowStockItems.length > 0 ? lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      item.stock === 0 
                        ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                        : 'border-orange-200 bg-orange-50 hover:bg-orange-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        item.stock === 0 ? 'bg-red-200' : 'bg-orange-200'
                      }`}>
                        <Package className={`w-5 h-5 ${
                          item.stock === 0 ? 'text-red-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <Badge variant={item.stock === 0 ? 'destructive' : 'secondary'} className="font-semibold">
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">All products are well stocked</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Today's Orders */}
          <Card className="border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-sm text-gray-500">Today's activity</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  <Eye className="w-4 h-4 mr-1" />
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {todaysOrders.length > 0 ? todaysOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.customer_name}</h3>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} border mb-1`}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-bold text-gray-900">৳{order.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 md:py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm md:text-base text-gray-500 font-medium">No orders today yet</p>
                    <p className="text-xs md:text-sm text-gray-400">Orders will appear here when customers place them</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
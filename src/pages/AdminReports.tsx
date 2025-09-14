import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target, BarChart3, PieChart, FileText, Filter, CreditCard, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase, orderService } from '@/supabase';

const AdminReports = () => {
  const { executeQuery } = useSupabase();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      console.log('📊 Loading reports data...');
      const ordersData = await executeQuery(() => orderService.getOrders());
      console.log('📈 Orders loaded for reports:', ordersData?.length || 0, ordersData);
      
      setOrders(ordersData || []);
      generateReports(ordersData || []);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReports = (ordersData: any[]) => {
    // Generate daily revenue data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyRevenue = last7Days.map(date => {
      const dayOrders = ordersData.filter(order => 
        order.created_at?.startsWith(date)
      );
      const uniqueCustomers = new Set(dayOrders.map(o => o.customer_email)).size;
      return {
        date,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        orders: dayOrders.length,
        customers: uniqueCustomers
      };
    });
    setRevenueData(dailyRevenue);

    // Generate category data from order items
    const categoryMap = new Map();
    ordersData.forEach(order => {
      order.items?.forEach((item: any) => {
        const category = item.category || 'Others';
        categoryMap.set(category, (categoryMap.get(category) || 0) + item.quantity);
      });
    });

    const totalItems = Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const categoryChartData = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name,
      value: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
      color: colors[index % colors.length]
    }));
    setCategoryData(categoryChartData);

    // Generate monthly data (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        monthIndex: date.getMonth()
      };
    });

    const monthlyStats = last6Months.map(({ month, year, monthIndex }) => {
      const monthOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year;
      });
      const uniqueCustomers = new Set(monthOrders.map(o => o.customer_email)).size;
      return {
        month,
        revenue: monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        orders: monthOrders.length,
        customers: uniqueCustomers
      };
    });
    setMonthlyData(monthlyStats);

    // Generate KPIs
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = ordersData.length;
    const uniqueCustomers = new Set(ordersData.map(o => o.customer_email)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const kpiData = [
      { 
        title: 'Total Revenue', 
        value: `৳${totalRevenue.toLocaleString()}`, 
        change: '+12.5%', 
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      { 
        title: 'Total Orders', 
        value: totalOrders.toString(), 
        change: '+8.3%', 
        trend: 'up',
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      { 
        title: 'Total Customers', 
        value: uniqueCustomers.toString(), 
        change: '+15.2%', 
        trend: 'up',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      { 
        title: 'Avg Order Value', 
        value: `৳${Math.round(avgOrderValue).toLocaleString()}`, 
        change: '-0.2%', 
        trend: 'down',
        icon: Target,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
    ];
    setKpis(kpiData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
            <p className="text-sm text-blue-600 mt-1">📊 {orders.length} orders analyzed • Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
            <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Report Period</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
                <Input id="start-date" type="date" defaultValue="2024-12-10" className="border-gray-200" />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
                <Input id="end-date" type="date" defaultValue="2024-12-15" className="border-gray-200" />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Online Payment Report */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Online Payments</h3>
                    <p className="text-green-700 text-sm">Digital transactions</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Total Orders</span>
                  <span className="text-2xl font-bold text-green-900">
                    {orders.filter(o => o.payment_method === 'online').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Total Revenue</span>
                  <span className="text-2xl font-bold text-green-900">
                    ৳{orders.filter(o => o.payment_method === 'online')
                      .reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Average Order</span>
                  <span className="text-lg font-bold text-green-900">
                    ৳{(() => {
                      const onlineOrders = orders.filter(o => o.payment_method === 'online');
                      const total = onlineOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                      return onlineOrders.length > 0 ? Math.round(total / onlineOrders.length).toLocaleString() : '0';
                    })()}
                  </span>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Success Rate</span>
                    <span className="text-lg font-bold text-green-900">98.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COD Payment Report */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-orange-900">Cash on Delivery</h3>
                    <p className="text-orange-700 text-sm">Pay on delivery</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-orange-800 font-medium">Total Orders</span>
                  <span className="text-2xl font-bold text-orange-900">
                    {orders.filter(o => o.payment_method === 'cod').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-800 font-medium">Total Revenue</span>
                  <span className="text-2xl font-bold text-orange-900">
                    ৳{orders.filter(o => o.payment_method === 'cod')
                      .reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-800 font-medium">Average Order</span>
                  <span className="text-lg font-bold text-orange-900">
                    ৳{(() => {
                      const codOrders = orders.filter(o => o.payment_method === 'cod');
                      const total = codOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                      return codOrders.length > 0 ? Math.round(total / codOrders.length).toLocaleString() : '0';
                    })()}
                  </span>
                </div>
                <div className="pt-2 border-t border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-800 font-medium">Delivery Rate</span>
                    <span className="text-lg font-bold text-orange-900">94.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ৳{orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Unique Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(orders.map(o => o.customer_email)).size}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ৳{orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length).toLocaleString() : '0'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Revenue Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`৳${value?.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                <span>Sales by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>Monthly Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Reports Table */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Detailed Order Reports</span>
              </div>
              <Button onClick={loadReportsData} variant="outline" size="sm">
                Refresh Data
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading reports...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm text-blue-600">#{order.order_number || order.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.customer_email}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${
                            order.payment_method === 'online' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.payment_method === 'online' ? 'Online' : 'COD'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          ৳{order.total_amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {orders.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>Showing </span>
                      <span className="font-medium mx-1">
                        {((currentPage - 1) * itemsPerPage) + 1}
                      </span>
                      <span> to </span>
                      <span className="font-medium mx-1">
                        {Math.min(currentPage * itemsPerPage, orders.length)}
                      </span>
                      <span> of </span>
                      <span className="font-medium mx-1">{orders.length}</span>
                      <span> orders</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }, (_, i) => i + 1)
                          .filter(page => {
                            const totalPages = Math.ceil(orders.length / itemsPerPage);
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            const prevPage = array[index - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;
                            return (
                              <div key={page} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-2 py-1 text-gray-500 text-sm">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-8 h-8 p-0 text-sm ${
                                    currentPage === page 
                                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                      : 'hover:bg-gray-100'
                                  }`}
                                >
                                  {page}
                                </Button>
                              </div>
                            );
                          })
                        }
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(orders.length / itemsPerPage)}
                        className="px-3 py-1 text-sm"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500">No orders found to generate reports</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-full">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Generate Report</h3>
                  <p className="text-sm text-blue-700">Create detailed analytics report</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Performance Insights</h3>
                  <p className="text-sm text-green-700">View detailed performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Goal Tracking</h3>
                  <p className="text-sm text-purple-700">Monitor business objectives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Users, TrendingUp, ShoppingBag, Star, Filter, Download, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase, customerService, orderService } from '@/supabase';
import { quoteService } from '@/supabase/quotes';
import type { Customer } from '@/supabase/customers';

const AdminCustomers = () => {
  const { executeQuery } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerQuotes, setCustomerQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const orders = await executeQuery(() => orderService.getOrders());
      
      // Group orders by customer email to create customer records
      const customerMap = new Map();
      
      orders?.forEach(order => {
        const email = order.customer_email;
        if (customerMap.has(email)) {
          const existing = customerMap.get(email);
          existing.total_orders += 1;
          existing.total_spent += order.total_amount || 0;
          existing.updated_at = order.created_at > existing.updated_at ? order.created_at : existing.updated_at;
        } else {
          customerMap.set(email, {
            id: `CUST-${Math.random().toString(36).substr(2, 9)}`,
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address,
            total_orders: 1,
            total_spent: order.total_amount || 0,
            created_at: order.created_at,
            updated_at: order.created_at
          });
        }
      });
      
      const customersData = Array.from(customerMap.values());
      setCustomers(customersData);
    } catch (err) {
      console.error('Failed to load customers:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerEmail: string) => {
    try {
      const orders = await executeQuery(() => orderService.getOrders());
      const filteredOrders = orders?.filter(order => order.customer_email === customerEmail) || [];
      setCustomerOrders(filteredOrders);
    } catch (err) {
      console.error('Failed to load customer orders:', JSON.stringify(err, null, 2));
    }
  };

  const loadCustomerQuotes = async (customerEmail: string) => {
    try {
      const quotes = await executeQuery(() => quoteService.getQuotes());
      const filteredQuotes = quotes?.filter(quote => quote.customer_email === customerEmail) || [];
      setCustomerQuotes(filteredQuotes);
    } catch (err) {
      console.error('Failed to load customer quotes:', JSON.stringify(err, null, 2));
    }
  };

  const getCustomerStatus = (customer: any) => {
    const totalSpent = customer.total_spent || 0;
    if (totalSpent >= 5000) return 'VIP';
    return 'Active';
  };

  const getLastOrderDate = (customer: any) => {
    return customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : 'No orders';
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => (c.total_orders || 0) > 0).length;
  const vipCustomers = customers.filter(c => (c.total_spent || 0) >= 5000).length;
  const avgOrderValue = customers.length > 0 
    ? Math.round(customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.reduce((sum, c) => sum + (c.total_orders || 0), 1))
    : 0;

  const stats = [
    { title: 'Total Customers', value: totalCustomers.toString(), change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Active Customers', value: activeCustomers.toString(), change: '+8%', icon: TrendingUp, color: 'text-green-600' },
    { title: 'VIP Customers', value: vipCustomers.toString(), change: '+15%', icon: Star, color: 'text-purple-600' },
    { title: 'Avg Order Value', value: `৳${avgOrderValue.toLocaleString()}`, change: '+5%', icon: ShoppingBag, color: 'text-orange-600' },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage and analyze your customer base</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-sm text-green-600 font-medium mt-1">{stat.change} from last month</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Forms Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Quote Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteFormsSection executeQuery={executeQuery} />
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Customer Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                  <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Orders</TableHead>
                  <TableHead className="font-semibold text-gray-700">Total Spent</TableHead>
                  <TableHead className="font-semibold text-gray-700">Last Order</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">ID: {customer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">{customer.email}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{customer.total_orders || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">৳{(customer.total_spent || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{getLastOrderDate(customer)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        getCustomerStatus(customer) === 'VIP' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
                      }`}>
                        {getCustomerStatus(customer) === 'VIP' && <Star className="w-3 h-3 mr-1" />}
                        {getCustomerStatus(customer)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                loadCustomerOrders(customer.email);
                                loadCustomerQuotes(customer.email);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h2 className="text-xl font-bold">{selectedCustomer?.name}</h2>
                                  <p className="text-sm text-gray-500">ID: {selectedCustomer?.id}</p>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-6">
                              {/* Customer Stats */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-blue-700">Total Orders</p>
                                        <p className="text-2xl font-bold text-blue-900">{selectedCustomer?.total_orders || 0}</p>
                                      </div>
                                      <ShoppingBag className="w-8 h-8 text-blue-600" />
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-green-700">Total Spent</p>
                                        <p className="text-2xl font-bold text-green-900">৳{(selectedCustomer?.total_spent || 0).toLocaleString()}</p>
                                      </div>
                                      <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-purple-700">Status</p>
                                        <p className="text-2xl font-bold text-purple-900">{selectedCustomer ? getCustomerStatus(selectedCustomer) : 'Active'}</p>
                                      </div>
                                      <Star className="w-8 h-8 text-purple-600" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Contact Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Email Address</p>
                                    <p className="text-gray-900">{selectedCustomer?.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                                    <p className="text-gray-900">{selectedCustomer?.phone}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Order History */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Recent Order History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {customerOrders.length > 0 ? customerOrders.map((order) => (
                                      <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-2 bg-blue-100 rounded-full">
                                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-900">{order.order_number}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <span className="font-semibold text-gray-900">৳{order.total_amount?.toLocaleString()}</span>
                                          <Badge className="bg-green-100 text-green-800 border-green-200">
                                            {order.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    )) : (
                                      <p className="text-gray-500 text-center py-4">No orders found for this customer</p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Quotes History */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Quote Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {customerQuotes.length > 0 ? customerQuotes.map((quote) => (
                                      <div key={quote.id} className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-orange-100 rounded-full">
                                              <Eye className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-900">{quote.quote_number}</p>
                                              <p className="text-sm text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-3">
                                            <span className="font-semibold text-gray-900">৳{quote.total_amount?.toLocaleString()}</span>
                                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                              {quote.status}
                                            </Badge>
                                          </div>
                                        </div>
                                        
                                        {/* Customer Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 p-3 bg-white/50 rounded">
                                          <div>
                                            <p className="text-xs font-medium text-gray-600">Address</p>
                                            <p className="text-sm text-gray-900">{quote.customer_address || 'Not provided'}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs font-medium text-gray-600">Phone</p>
                                            <p className="text-sm text-gray-900">{quote.customer_phone}</p>
                                          </div>
                                        </div>

                                        {/* Quote Items */}
                                        <div className="space-y-2">
                                          <p className="text-sm font-medium text-gray-700">Requested Items:</p>
                                          <div className="space-y-1">
                                            {quote.items && Array.isArray(quote.items) ? quote.items.map((item, index) => (
                                              <div key={index} className="flex justify-between items-center p-2 bg-white/70 rounded text-sm">
                                                <div>
                                                  <span className="font-medium">{item.product_name}</span>
                                                  <span className="text-gray-500 ml-2">({item.category})</span>
                                                </div>
                                                <div className="text-right">
                                                  <span className="text-gray-600">Qty: {item.quantity}</span>
                                                  <span className="ml-3 font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                              </div>
                                            )) : (
                                              <p className="text-sm text-gray-500 italic">No items data available</p>
                                            )}
                                          </div>
                                        </div>

                                        {(quote.physical_visit_requested || quote.need_expert_help) && (
                                          <div className="mt-3 pt-3 border-t border-orange-200 flex gap-2 flex-wrap">
                                            {quote.physical_visit_requested && (
                                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                Physical Visit Requested
                                              </Badge>
                                            )}
                                            {quote.need_expert_help && (
                                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                                Expert Help Needed
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )) : (
                                      <p className="text-gray-500 text-center py-4">No quotes found for this customer</p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('Edit customer:', customer.id.replace(/[^a-zA-Z0-9-]/g, ''))}>Edit Customer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${customer.email}`)}>Send Email</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('View orders for:', customer.id.replace(/[^a-zA-Z0-9-]/g, ''))}>View Orders</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => console.log('Delete customer:', customer.id.replace(/[^a-zA-Z0-9-]/g, ''))}>Delete Customer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const QuoteFormsSection = ({ executeQuery }: { executeQuery: any }) => {
  const [allQuotes, setAllQuotes] = useState<any[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const quotesPerPage = 5;
  
  useEffect(() => {
    const loadAllQuotes = async () => {
      try {
        const quotes = await executeQuery(() => quoteService.getQuotes());
        setAllQuotes(quotes || []);
      } catch (err) {
        console.error('Failed to load quotes:', JSON.stringify(err, null, 2));
      } finally {
        setQuotesLoading(false);
      }
    };
    loadAllQuotes();
  }, [executeQuery]);
  
  const totalPages = Math.ceil(allQuotes.length / quotesPerPage);
  const startIndex = (currentPage - 1) * quotesPerPage;
  const currentQuotes = allQuotes.slice(startIndex, startIndex + quotesPerPage);
  
  if (quotesLoading) return <p className="text-center py-4">Loading quotes...</p>;
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {currentQuotes.length > 0 ? currentQuotes.map((quote) => (
          <div key={quote.id} className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{quote.quote_number}</h3>
                <p className="text-sm text-gray-600">{new Date(quote.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">৳{quote.total_amount?.toLocaleString()}</p>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">{quote.status}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Customer Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {quote.customer_name}</p>
                  <p><span className="font-medium">Email:</span> {quote.customer_email}</p>
                  <p><span className="font-medium">Phone:</span> {quote.customer_phone}</p>
                  <p><span className="font-medium">Address:</span> {quote.customer_address || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Quote Items</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {quote.items && Array.isArray(quote.items) ? quote.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-white/70 rounded">
                      <span>{item.product_name} ({item.category})</span>
                      <span>Qty: {item.quantity} - ৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  )) : <p className="text-sm text-gray-500">No items data</p>}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {quote.physical_visit_requested && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  Physical Visit Requested
                </Badge>
              )}
              {quote.need_expert_help && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                  Expert Help Needed
                </Badge>
              )}
            </div>
          </div>
        )) : <p className="text-center py-8 text-gray-500">No quote forms found</p>}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + quotesPerPage, allQuotes.length)} of {allQuotes.length} quotes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 p-0 ${
                    currentPage === page 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
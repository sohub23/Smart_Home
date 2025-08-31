import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, FileText, Trash2, Calendar, Phone, MapPin, Package, 
  CreditCard, Copy, ChevronDown, Download, FileSpreadsheet, Edit, X 
} from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase, orderService } from '@/supabase';
import type { Order } from '@/supabase/orders';

// Components
const Pill = ({ children, active = false, onClick, count }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus:ring-2 focus:ring-blue-400/50 ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
        : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
    }`}
  >
    {children} {count !== undefined && `(${count})`}
  </button>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const variants = {
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm',
    red: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant] || 'bg-gradient-to-r from-slate-500 to-gray-500 text-white'}`}>
      {children}
    </span>
  );
};

const CategoryTabs = ({ activeTab, setActiveTab, orders }: any) => {
  const onlineCount = orders.filter((o: any) => o.payment_method === 'online').length;
  const codCount = orders.filter((o: any) => o.payment_method === 'cod').length;
  
  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'online', label: 'Online Payment', count: onlineCount },
    { id: 'cod', label: 'Cash on Delivery', count: codCount },
    { id: 'leads', label: 'Leads', count: 0 }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map(tab => (
        <Pill
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          count={tab.count}
        >
          {tab.label}
        </Pill>
      ))}
    </div>
  );
};

const StatusFilters = ({ activeStatus, setActiveStatus, orders }: any) => {
  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
  const shippedCount = orders.filter((o: any) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o: any) => o.status === 'delivered').length;
  
  const statuses = [
    { id: 'all', label: 'All Status' },
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'processing', label: 'Processing', count: 0 },
    { id: 'shipped', label: 'Shipped', count: shippedCount },
    { id: 'delivered', label: 'Delivered', count: deliveredCount },
    { id: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 md:p-6 mb-6">
      <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Filter by Status
      </h3>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {statuses.map(status => (
          <button
            key={status.id}
            onClick={() => setActiveStatus(status.id)}
            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium border transition-all hover:ring-2 hover:ring-blue-400/50 focus:ring-2 focus:ring-blue-400/50 ${
              activeStatus === status.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {status.label} {status.count !== undefined && `(${status.count})`}
          </button>
        ))}
      </div>
    </div>
  );
};

const Toolbar = ({ orders, onRefresh }: any) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">All Orders ({orders.length})</h2>
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" className="rounded-lg" onClick={onRefresh}>
        <Package className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="rounded-lg">
          <Download className="w-4 h-4 mr-2" />
          CSV
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg">
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Show:</span>
        <Select defaultValue="10">
          <SelectTrigger className="w-16 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>Showing 1–{Math.min(10, orders.length)} of {orders.length}</span>
      </div>
    </div>
  </div>
);

const OrderCard = ({ order, onDelete, onView, onEdit }: any) => {
  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <Badge variant="orange">Pending</Badge>;
      case 'shipped': return <Badge variant="blue">Shipped</Badge>;
      case 'delivered': return <Badge variant="success">Delivered</Badge>;
      default: return <Badge variant="purple">{status}</Badge>;
    }
  };
  
  const getPaymentBadge = (method: string) => {
    switch(method?.toLowerCase()) {
      case 'cod': return <Badge variant="orange">Cash on Delivery</Badge>;
      case 'online': return <Badge variant="green">Online Payment</Badge>;
      case 'free': return <Badge variant="blue">Free Service</Badge>;
      default: return <Badge variant="purple">{method}</Badge>;
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 p-4 md:p-6 lg:p-8">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-1">{order.customer_name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-mono">#{order.order_number}</span>
            <Copy className="w-3 h-3 cursor-pointer hover:text-slate-700" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
              Update <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {getPaymentBadge(order.payment_method)}
            <Button variant="ghost" size="sm" className="hover:bg-green-50">
              Update <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => onView(order)}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => onEdit(order)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
              <FileText className="w-4 h-4 mr-1" />
              Invoice
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(order.id)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{new Date(order.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            })}</span>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              Customer Info
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-green-500" />
                <span>{order.customer_phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 mt-0.5 text-red-500" />
                <span>{order.customer_address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-500" />
              Order Items
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <span className="font-medium text-slate-700">Total Items</span>
                <Badge variant="blue">{order.items?.length || 0} items</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Payment Info
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                Method: {getPaymentBadge(order.payment_method)}
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ৳{order.total_amount?.toLocaleString()}
              </div>
              <Badge variant="green">CONFIRMED</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const { executeQuery } = useSupabase();
  const [activeTab, setActiveTab] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Order>>({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await executeQuery(() => orderService.getOrders());
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  // Filter orders based on active filters
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'online' && order.payment_method === 'online') ||
      (activeTab === 'cod' && order.payment_method === 'cod');
    
    const matchesStatus = activeStatus === 'all' || order.status === activeStatus;
    
    return matchesTab && matchesStatus;
  });

  const handleDelete = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeleteModalOpen(true);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditFormData({
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      status: order.status,
      payment_method: order.payment_method
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (selectedOrder?.id) {
      try {
        await executeQuery(() => orderService.updateOrder(selectedOrder.id!, editFormData));
        loadOrders();
        setEditModalOpen(false);
        setSelectedOrder(null);
        setEditFormData({});
      } catch (err) {
        console.error('Failed to update order:', err);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedOrderId) {
      try {
        await executeQuery(() => orderService.deleteOrder(selectedOrderId));
        loadOrders();
        setDeleteModalOpen(false);
        setSelectedOrderId(null);
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Order Management
          </h1>
          <p className="text-slate-600">Manage and track all customer orders</p>
        </div>
        
        <CategoryTabs activeTab={activeTab} setActiveTab={setActiveTab} orders={orders} />
        <StatusFilters activeStatus={activeStatus} setActiveStatus={setActiveStatus} orders={orders} />
        <Toolbar orders={filteredOrders} onRefresh={loadOrders} />
        
        <div className="space-y-6">
          {filteredOrders.length > 0 ? filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onDelete={handleDelete}
              onView={handleView}
              onEdit={handleEdit}
            />
          )) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">No orders match your current filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 py-4">
            Are you sure you want to delete this order? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details - #{selectedOrder?.order_number}</span>
              <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Customer Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer_address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Order Information</h3>
                  <div className="space-y-2">
                    <p><strong>Status:</strong> <Badge variant={selectedOrder.status === 'delivered' ? 'success' : selectedOrder.status === 'shipped' ? 'blue' : 'orange'}>{selectedOrder.status}</Badge></p>
                    <p><strong>Payment:</strong> <Badge variant={selectedOrder.payment_method === 'online' ? 'green' : 'orange'}>{selectedOrder.payment_method}</Badge></p>
                    <p><strong>Total:</strong> <span className="text-xl font-bold text-green-600">৳{selectedOrder.total_amount?.toLocaleString()}</span></p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.created_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name || 'Product Name'}</p>
                        <p className="text-sm text-slate-600">Category: {item.category || 'N/A'}</p>
                        {item.specifications && (
                          <div className="text-xs text-slate-500 mt-1">
                            {Object.entries(item.specifications).map(([key, value]: [string, any]) => (
                              <span key={key} className="mr-2">{key}: {value}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">৳{(item.price || 0).toLocaleString()}</p>
                        <p className="text-sm text-slate-600">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No items in this order</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Order - #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={editFormData.customer_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, customer_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={editFormData.customer_email || ''}
                  onChange={(e) => setEditFormData({...editFormData, customer_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Phone</Label>
                <Input
                  id="customer_phone"
                  value={editFormData.customer_phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, customer_phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editFormData.status || ''} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={editFormData.payment_method || ''} onValueChange={(value) => setEditFormData({...editFormData, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="free">Free Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="customer_address">Address</Label>
              <Textarea
                id="customer_address"
                value={editFormData.customer_address || ''}
                onChange={(e) => setEditFormData({...editFormData, customer_address: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                Update Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
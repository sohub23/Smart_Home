interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  curtainType: string;
  motorType: string;
  width: string;
  installation: string;
  remoteSetup: boolean;
  paymentMethod: string;
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  placedAt: string;
}

class OrderStore {
  private orders: Order[] = [];
  private listeners: (() => void)[] = [];

  addOrder(orderData: Omit<Order, 'id' | 'status' | 'placedAt'>) {
    const order: Order = {
      ...orderData,
      id: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
      status: orderData.paymentMethod === 'cod' ? 'Pending' : 'Paid',
      placedAt: new Date().toLocaleString('en-GB', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '')
    };
    
    this.orders.unshift(order);
    this.notifyListeners();
    return order;
  }

  getOrders() {
    return [...this.orders];
  }

  getTodaysOrders() {
    const today = new Date().toDateString();
    return this.orders.filter(order => 
      new Date(order.placedAt).toDateString() === today
    );
  }

  getTodaysStats() {
    const todaysOrders = this.getTodaysOrders();
    const codOrders = todaysOrders.filter(o => o.paymentMethod === 'cod').length;
    const onlineOrders = todaysOrders.filter(o => o.paymentMethod !== 'cod').length;
    const revenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
    
    return {
      totalOrders: todaysOrders.length,
      codOrders,
      onlineOrders,
      revenue
    };
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const orderStore = new OrderStore();
export type { Order };
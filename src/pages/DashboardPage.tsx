import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button } from '@/components/ui';
import { BarChart, DonutChart } from '@/components/charts/Charts';
import { formatKes, formatKesShort, getGreeting, formatTimeAgo } from '@/utils/format';
import {
  TrendingUp, ShoppingBag, DollarSign, AlertTriangle, Clock,
  Building2, Receipt, Package, ArrowUpRight, ArrowDownRight,
  ShoppingCart, PackagePlus, UserPlus, FolderOpen, Plus, Activity,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: string; up: boolean };
  color: string;
}

function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
            {trend.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </Card>
  );
}

export function DashboardPage({ navigate }: { navigate: (path: string) => void }) {
  const { currentUser, sales, products, shifts, expenses, suppliers, purchaseOrders, categories, auditLogs, hasPermission, getProductStockStatus } = useStore();
  if (!currentUser) return null;

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.createdAt.startsWith(today) && s.saleStatus === 'SALE_COMPLETED');
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayOrders = todaySales.length;
  const todayProfit = todaySales.reduce((sum, s) => {
    return sum + s.items.reduce((p, item) => {
      const product = products.find(pr => pr.id === item.productId);
      return p + (item.unitPrice - (product?.costPrice ?? 0)) * item.quantity;
    }, 0);
  }, 0);
  const pendingPayments = sales.filter(s => s.paymentStatus === 'PENDING' || s.paymentStatus === 'PROCESSING').length;
  const lowStockItems = products.filter(p => {
    const status = getProductStockStatus(p);
    return status === 'LOW_STOCK' || status === 'OUT_OF_STOCK';
  });
  const supplierPayables = suppliers.reduce((sum, s) => sum + s.openingBalance, 0) + purchaseOrders.filter(po => po.paymentStatus !== 'PAID').reduce((sum, po) => sum + po.total, 0);
  const openShifts = shifts.filter(s => s.status === 'OPEN');
  const todayExpenses = expenses.filter(e => e.date.startsWith(today)).reduce((sum, e) => sum + e.amount, 0);

  // Sales this week
  const weekData: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const daySales = sales.filter(s => s.createdAt.startsWith(dayStr) && s.saleStatus === 'SALE_COMPLETED');
    weekData.push({
      label: d.toLocaleDateString('en-KE', { weekday: 'short' }),
      value: daySales.reduce((sum, s) => sum + s.total, 0),
    });
  }

  // Sales by category
  const categoryData = categories.map(cat => {
    const catSales = sales.filter(s => s.saleStatus === 'SALE_COMPLETED').reduce((sum, s) => {
      const catItems = s.items.filter(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.categoryId === cat.id;
      });
      return sum + catItems.reduce((cs, item) => cs + item.subtotal, 0);
    }, 0);
    return { label: cat.name, value: catSales, color: cat.color };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);

  // Top products
  const productSales: { name: string; count: number; revenue: number }[] = [];
  products.forEach(p => {
    let count = 0;
    let revenue = 0;
    sales.filter(s => s.saleStatus === 'SALE_COMPLETED').forEach(s => {
      s.items.forEach(item => {
        if (item.productId === p.id) {
          count += item.quantity;
          revenue += item.subtotal;
        }
      });
    });
    if (count > 0) productSales.push({ name: p.name, count, revenue });
    });
  productSales.sort((a, b) => b.count - a.count);
  const topProducts = productSales.slice(0, 5);

  // Stock value
  const stockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);

  // Payment method breakdown
  const mpesaCount = sales.filter(s => s.paymentMethod === 'MPESA_STK' && s.saleStatus === 'SALE_COMPLETED').length;
  const failedCount = sales.filter(s => s.paymentStatus === 'FAILED').length;
  const paymentData = [
    { label: 'M-Pesa STK', value: mpesaCount, color: '#15803d' },
    { label: 'Failed', value: failedCount, color: '#dc2626' },
  ];

  // Recent activity
  const recentActivity = auditLogs.slice(0, 8);

  const role = currentUser.role;
  const isCashier = role === 'CASHIER';

  // Cashier-specific dashboard
  if (isCashier) {
    const activeShift = shifts.find(s => s.cashierId === currentUser.id && s.status === 'OPEN');
    const myTodaySales = todaySales.filter(s => s.cashierId === currentUser.id);
    const myTodayRevenue = myTodaySales.reduce((sum, s) => sum + s.total, 0);
    const myTransactionCount = myTodaySales.length;

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1">Here's your cashier overview for today</p>
        </div>

        {activeShift ? (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700">Shift Active</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{formatKes(activeShift.expectedCash)}</p>
                <p className="text-sm text-slate-500">Expected cash in till</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{activeShift.transactionCount}</p>
                  <p className="text-xs text-slate-500">Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatKesShort(activeShift.totalSales)}</p>
                  <p className="text-xs text-slate-500">Total Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatKes(activeShift.openingFloat)}</p>
                  <p className="text-xs text-slate-500">Opening Float</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">No active shift</p>
                <p className="text-sm text-amber-700">Open a shift to start processing sales</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Sales" value={formatKes(myTodayRevenue)} icon={<TrendingUp className="w-5 h-5" />} color="#15803d" />
          <StatCard label="Transactions" value={String(myTransactionCount)} icon={<ShoppingBag className="w-5 h-5" />} color="#c2410c" />
          <StatCard label="Expected Cash" value={formatKes(activeShift?.expectedCash ?? 0)} icon={<DollarSign className="w-5 h-5" />} color="#1d4ed8" />
          <StatCard label="Opening Float" value={formatKes(activeShift?.openingFloat ?? 0)} icon={<Clock className="w-5 h-5" />} color="#7c3aed" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-6 flex flex-col items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-orange-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Start Selling</h3>
            <p className="text-sm text-slate-500 mb-4 text-center">Open the POS to process a new sale</p>
            <Button size="lg" onClick={() => navigate('/pos')}>Open POS</Button>
          </Card>
          <div className="space-y-3">
            <Button variant="outline" fullWidth size="lg" onClick={() => navigate('/shifts')} disabled={!activeShift}>
              Close Shift
            </Button>
            <Button variant="outline" fullWidth size="lg" onClick={() => navigate('/shifts')} disabled={!!activeShift}>
              Resume Shift
            </Button>
            <Button variant="outline" fullWidth size="lg" onClick={() => navigate('/sales')}>
              View Transactions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Admin/Manager/Other role dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1">Here's what's happening at your cafeteria today</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {hasPermission('pos.access') && (
            <Button onClick={() => navigate('/pos')} size="sm">
              <ShoppingCart className="w-4 h-4" /> New Sale
            </Button>
          )}
          {hasPermission('inventory.receive') && (
            <Button variant="outline" onClick={() => navigate('/inventory')} size="sm">
              <PackagePlus className="w-4 h-4" /> Receive Stock
            </Button>
          )}
          {hasPermission('products.create') && (
            <Button variant="outline" onClick={() => navigate('/products')} size="sm">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={formatKes(todayRevenue)} icon={<TrendingUp className="w-5 h-5" />} color="#15803d" trend={{ value: '+12%', up: true }} />
        <StatCard label="Today's Orders" value={String(todayOrders)} icon={<ShoppingBag className="w-5 h-5" />} color="#c2410c" trend={{ value: '+8%', up: true }} />
        <StatCard label="Today's Profit" value={formatKes(todayProfit)} icon={<DollarSign className="w-5 h-5" />} color="#1d4ed8" trend={{ value: '+5%', up: true }} />
        <StatCard label="Pending Payments" value={String(pendingPayments)} icon={<Clock className="w-5 h-5" />} color="#f59e0b" />
        <StatCard label="Low Stock Items" value={String(lowStockItems.length)} icon={<AlertTriangle className="w-5 h-5" />} color="#dc2626" />
        <StatCard label="Supplier Payables" value={formatKesShort(supplierPayables)} icon={<Building2 className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Active Shifts" value={String(openShifts.length)} icon={<Clock className="w-5 h-5" />} color="#0891b2" />
        <StatCard label="Today's Expenses" value={formatKes(todayExpenses)} icon={<Receipt className="w-5 h-5" />} color="#9333ea" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Sales Performance</h3>
              <p className="text-sm text-slate-500">Last 7 days revenue</p>
            </div>
            <Badge color="green">Live</Badge>
          </div>
          <BarChart data={weekData} formatValue={formatKesShort} height={240} />
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Payment Methods</h3>
          <DonutChart data={paymentData} size={160} />
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Confirmed</span>
              <span className="font-medium text-slate-900">{mpesaCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Failed</span>
              <span className="font-medium text-red-600">{failedCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Success Rate</span>
              <span className="font-medium text-green-600">{mpesaCount + failedCount > 0 ? ((mpesaCount / (mpesaCount + failedCount)) * 100).toFixed(1) : 100}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Sales by Category</h3>
          <DonutChart data={categoryData} size={180} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Top Selling Products</h3>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(p.count / topProducts[0].count) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{p.count} sold</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-700">{formatKes(p.revenue)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stock value + Recent activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Stock Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Stock Value</p>
                  <p className="text-xs text-slate-500">{products.length} products</p>
                </div>
              </div>
              <p className="font-bold text-slate-900">{formatKes(stockValue)}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">In Stock</p>
                </div>
              </div>
              <p className="font-bold text-green-700">{products.filter(p => getProductStockStatus(p) === 'IN_STOCK').length}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Low Stock</p>
                </div>
              </div>
              <p className="font-bold text-yellow-700">{products.filter(p => getProductStockStatus(p) === 'LOW_STOCK').length}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Out of Stock</p>
                </div>
              </div>
              <p className="font-bold text-red-700">{products.filter(p => getProductStockStatus(p) === 'OUT_OF_STOCK').length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <button onClick={() => navigate('/audit')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">View all</button>
          </div>
          <div className="space-y-1">
            {recentActivity.map(log => (
              <div key={log.id} className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">
                    <span className="font-medium">{log.userName}</span> — {log.description}
                  </p>
                  <p className="text-xs text-slate-400">{formatTimeAgo(log.timestamp)}</p>
                </div>
                <Badge color="gray">{log.action.replace(/_/g, ' ').toLowerCase()}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Gross profit summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Gross Profit Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Today's Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatKes(todayRevenue)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Today's Profit</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatKes(todayProfit)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 font-medium">Margin</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {todayRevenue > 0 ? `${((todayProfit / todayRevenue) * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
          <div className="p-4 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-600 font-medium">Stock Value</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatKesShort(stockValue)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

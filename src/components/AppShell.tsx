import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/services/StoreContext';
import type { PermissionName, RoleName } from '@/types';
import {
  LayoutDashboard, ShoppingCart, ClipboardList, TrendingUp, Package,
  Boxes, Truck, Building2, Users, CreditCard, Clock, Receipt,
  BookOpen, BarChart3, ShieldCheck, ScrollText, Settings, Bell,
  Search, LogOut, ChevronDown, UtensilsCrossed, CircleDot, Plus,
  PackagePlus, UserPlus, FolderOpen, Receipt as ReceiptIcon, Zap,
} from 'lucide-react';
import { formatDateTime, getGreeting, formatTimeAgo } from '@/utils/format';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionName;
  roles?: RoleName[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { label: 'POS', path: '/pos', icon: ShoppingCart, permission: 'pos.access' },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
  { label: 'Sales', path: '/sales', icon: TrendingUp, permission: 'sales.view' },
  { label: 'Products', path: '/products', icon: Package, permission: 'products.view' },
  { label: 'Inventory', path: '/inventory', icon: Boxes, permission: 'inventory.view' },
  { label: 'Purchasing', path: '/purchasing', icon: Truck, permission: 'purchases.view' },
  { label: 'Suppliers', path: '/suppliers', icon: Building2, permission: 'suppliers.view' },
  { label: 'Customers', path: '/customers' },
  { label: 'Payments', path: '/payments', icon: CreditCard, permission: 'payments.view' },
  { label: 'Cashier Shifts', path: '/shifts', icon: Clock, permission: 'shifts.open' },
  { label: 'Expenses', path: '/expenses', icon: Receipt, permission: 'expenses.create' },
  { label: 'Ledger', path: '/ledger', icon: BookOpen, permission: 'ledger.view' },
  { label: 'Reports', path: '/reports', icon: BarChart3, permission: 'reports.view' },
  { label: 'Users & Roles', path: '/users', icon: ShieldCheck, permission: 'users.view' },
  { label: 'Audit Logs', path: '/audit', icon: ScrollText, permission: 'audit.view' },
  { label: 'Settings', path: '/settings', icon: Settings, permission: 'settings.manage' },
];

interface AppShellProps {
  route: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export function AppShell({ route, navigate, children }: AppShellProps) {
  const { currentUser, logout, hasPermission, notifications, markNotificationRead, markAllNotificationsRead, shifts } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; label: string; sub: string; path: string }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchResults([]);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { products, sales, suppliers, purchaseOrders, customers: customerList, users: userList } = useStore();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: { type: string; label: string; sub: string; path: string }[] = [];
    products.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        results.push({ type: 'Product', label: p.name, sub: p.sku, path: '/products' });
    });
    sales.slice(0, 50).forEach(s => {
      if (s.receiptNo.toLowerCase().includes(q) || s.orderNo.toLowerCase().includes(q))
        results.push({ type: 'Sale', label: s.receiptNo, sub: `KSh ${s.total}`, path: '/sales' });
    });
    suppliers.forEach(s => {
      if (s.companyName.toLowerCase().includes(q))
        results.push({ type: 'Supplier', label: s.companyName, sub: s.contactPerson, path: '/suppliers' });
    });
    purchaseOrders.forEach(p => {
      if (p.poNumber.toLowerCase().includes(q))
        results.push({ type: 'Purchase Order', label: p.poNumber, sub: p.supplierName, path: '/purchasing' });
    });
    customerList.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.phone.includes(q))
        results.push({ type: 'Customer', label: c.name, sub: c.phone, path: '/customers' });
    });
    userList.forEach(u => {
      if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        results.push({ type: 'User', label: u.name, sub: u.email, path: '/users' });
    });
    setSearchResults(results.slice(0, 15));
  }, [searchQuery, products, sales, suppliers, purchaseOrders, customerList, userList]);

  if (!currentUser) return null;

  const visibleNav = navItems.filter(item => {
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeShift = shifts.find(s => s.cashierId === currentUser.id && s.status === 'OPEN');

  const quickActions = [
    { label: 'New Sale', icon: ShoppingCart, path: '/pos', show: hasPermission('pos.access') },
    { label: 'Receive Stock', icon: PackagePlus, path: '/inventory', show: hasPermission('inventory.receive') },
    { label: 'Add Product', icon: Plus, path: '/products', show: hasPermission('products.create') },
    { label: 'Add Supplier', icon: UserPlus, path: '/suppliers', show: hasPermission('suppliers.create') },
    { label: 'Open Shift', icon: FolderOpen, path: '/shifts', show: hasPermission('shifts.open') && !activeShift },
    { label: 'Record Expense', icon: ReceiptIcon, path: '/expenses', show: hasPermission('expenses.create') },
  ].filter(a => a.show);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-sm leading-tight truncate">KHCW Cafeteria</h1>
              <p className="text-slate-500 text-xs">Kirinyaga County</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {visibleNav.map(item => {
            const active = route === item.path || route.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: currentUser.avatarColor }}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-slate-500 text-xs truncate">{currentUser.role.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
              <LayoutDashboard className="w-5 h-5" />
            </button>

            {/* Search */}
            <div ref={searchRef} className="flex-1 max-w-xl relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, sales, suppliers, customers..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                    {['Product', 'Sale', 'Supplier', 'Purchase Order', 'Customer', 'User'].map(type => {
                      const group = searchResults.filter(r => r.type === type);
                      if (group.length === 0) return null;
                      return (
                        <div key={type} className="py-2">
                          <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase">{type}</p>
                          {group.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => { navigate(r.path); setSearchQuery(''); setSearchResults([]); }}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-left"
                            >
                              <div>
                                <p className="text-sm text-slate-800">{r.label}</p>
                                <p className="text-xs text-slate-400">{r.sub}</p>
                              </div>
                              <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90" />
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-1.5">
                {quickActions.slice(0, 3).map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={action.label}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Date/Time */}
              <div className="hidden xl:block text-right">
                <p className="text-sm font-medium text-slate-700">{formatDateTime(currentTime)}</p>
                <p className="text-xs text-slate-400">{getGreeting(currentTime)}, {currentUser.name.split(' ')[0]}</p>
              </div>

              {/* Shift status */}
              {activeShift && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CircleDot className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-xs font-medium">Shift Open</span>
                </div>
              )}

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 border-b border-slate-100 text-left hover:bg-slate-50 ${!n.read ? 'bg-orange-50/50' : ''}`}
                        >
                          {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />}
                          <div className={n.read ? 'pl-4' : ''}>
                            <p className="text-sm font-medium text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(n.timestamp)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: currentUser.avatarColor }}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                      <p className="text-xs text-orange-600 mt-1 font-medium">{currentUser.role.replace('_', ' ')}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { navigate('/settings'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

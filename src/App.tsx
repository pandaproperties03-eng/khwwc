import { StoreProvider, useStore } from '@/services/StoreContext';
import { useRouter } from '@/utils/router';
import { LoginPage } from '@/pages/LoginPage';
import { AppShell } from '@/components/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { PosPage } from '@/pages/PosPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { SalesPage } from '@/pages/SalesPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { PurchasingPage } from '@/pages/PurchasingPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ShiftsPage } from '@/pages/ShiftsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { LedgerPage } from '@/pages/LedgerPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { UsersPage } from '@/pages/UsersPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppContent() {
  const { currentUser, hasPermission } = useStore();
  const { route, navigate } = useRouter();

  if (!currentUser) {
    return <LoginPage />;
  }

  // Permission-based routing guard
  const routePermissions: Record<string, string> = {
    '/dashboard': 'dashboard.view',
    '/pos': 'pos.access',
    '/sales': 'sales.view',
    '/products': 'products.view',
    '/inventory': 'inventory.view',
    '/purchasing': 'purchases.view',
    '/suppliers': 'suppliers.view',
    '/payments': 'payments.view',
    '/shifts': 'shifts.open',
    '/expenses': 'expenses.create',
    '/ledger': 'ledger.view',
    '/reports': 'reports.view',
    '/users': 'users.view',
    '/audit': 'audit.view',
    '/settings': 'settings.manage',
  };

  const requiredPerm = routePermissions[route];
  if (requiredPerm && !hasPermission(requiredPerm)) {
    return (
      <AppShell route={route} navigate={navigate}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
          <p className="text-lg font-medium text-slate-600">Access Denied</p>
          <p className="text-sm mt-1">You don't have permission to view this page</p>
        </div>
      </AppShell>
    );
  }

  const renderPage = () => {
    switch (route) {
      case '/dashboard': return <DashboardPage navigate={navigate} />;
      case '/pos': return <PosPage />;
      case '/orders': return <OrdersPage />;
      case '/sales': return <SalesPage />;
      case '/products': return <ProductsPage />;
      case '/inventory': return <InventoryPage />;
      case '/purchasing': return <PurchasingPage />;
      case '/suppliers': return <SuppliersPage />;
      case '/customers': return <CustomersPage />;
      case '/payments': return <PaymentsPage />;
      case '/shifts': return <ShiftsPage />;
      case '/expenses': return <ExpensesPage />;
      case '/ledger': return <LedgerPage />;
      case '/reports': return <ReportsPage />;
      case '/users': return <UsersPage />;
      case '/audit': return <AuditLogsPage />;
      case '/settings': return <SettingsPage />;
      default: return <DashboardPage navigate={navigate} />;
    }
  };

  return (
    <AppShell route={route} navigate={navigate}>
      {renderPage()}
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

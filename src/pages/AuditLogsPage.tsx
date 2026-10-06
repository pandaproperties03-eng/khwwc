import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Input, Select, EmptyState, Button } from '@/components/ui';
import { formatDateTime } from '@/utils/format';
import {
  ScrollText, Search, ChevronLeft, ChevronRight,
  LogIn, LogOut, ShoppingCart, CreditCard, Package,
  Building2, Clock, Receipt, Users as UsersIcon, Settings,
} from 'lucide-react';
  LOGIN: LogIn, LOGOUT: LogOut, SALE_CREATED: ShoppingCart,
  PAYMENT_CONFIRMED: CreditCard, PAYMENT_FAILED: CreditCard,
  PAYMENT_INITIATED: CreditCard, REFUND_CREATED: Receipt,
  PRODUCT_CREATED: Package, PRODUCT_UPDATED: Package,
  STOCK_RECEIVED: Package, STOCK_ADJUSTED: Package,
  SUPPLIER_CREATED: Building2, PURCHASE_CREATED: Building2,
  SHIFT_OPENED: Clock, SHIFT_CLOSED: Clock,
  EXPENSE_CREATED: Receipt, USER_CREATED: UsersIcon,
  SETTINGS_CHANGED: Settings, PERMISSION_CHANGED: Settings,
};

export function AuditLogsPage() {
  const { auditLogs } = useStore();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const actions = useMemo(() => Array.from(new Set(auditLogs.map(l => l.action))).sort(), [auditLogs]);

  const filtered = useMemo(() => {
    return auditLogs.filter(l => {
      if (search) {
        const q = search.toLowerCase();
        if (!l.userName.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q) && !l.action.toLowerCase().includes(q)) return false;
      }
      if (actionFilter && l.action !== actionFilter) return false;
      return true;
    });
  }, [auditLogs, search, actionFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-1">Complete trail of all system actions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><ScrollText className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{auditLogs.length}</p><p className="text-xs text-slate-500">Total Events</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{auditLogs.filter(l => l.action === 'SALE_CREATED').length}</p><p className="text-xs text-slate-500">Sales Events</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{auditLogs.filter(l => l.action.includes('PAYMENT')).length}</p><p className="text-xs text-slate-500">Payment Events</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><UsersIcon className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{new Set(auditLogs.map(l => l.userId)).size}</p><p className="text-xs text-slate-500">Active Users</p></div></div></Card>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search user, action, description..." icon={<Search className="w-4 h-4" />} />
          <Select value={actionFilter} onChange={setActionFilter} placeholder="All actions" options={actions.map(a => ({ value: a, label: a.replace(/_/g, ' ') }))} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<ScrollText className="w-12 h-12" />} title="No audit logs found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Entity</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(log => {
                  const Icon = actionIcons[log.action] ?? ScrollText;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{log.userName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <Badge color="blue">{log.action.replace(/_/g, ' ').toLowerCase()}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{log.entity}</td>
                      <td className="px-4 py-3 text-slate-600">{log.description}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.ip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

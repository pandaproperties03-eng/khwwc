import { useState } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Input, Button } from '@/components/ui';
import {
  Settings as SettingsIcon, Building2, CreditCard, Receipt,
  Boxes, Bell, ShieldCheck, Lock,
} from 'lucide-react';

export function SettingsPage() {
  const { categories, hasPermission } = useStore();
  const [tab, setTab] = useState<'business' | 'tax' | 'receipt' | 'payment' | 'inventory' | 'categories' | 'audit'>('business');

  const canManage = hasPermission('settings.manage');

  const tabs = [
    { key: 'business' as const, label: 'Business Info', icon: Building2 },
    { key: 'tax' as const, label: 'Tax', icon: Receipt },
    { key: 'receipt' as const, label: 'Receipt', icon: Receipt },
    { key: 'payment' as const, label: 'Payment', icon: CreditCard },
    { key: 'inventory' as const, label: 'Inventory', icon: Boxes },
    { key: 'categories' as const, label: 'Categories', icon: Boxes },
    { key: 'audit' as const, label: 'Audit', icon: ShieldCheck },
  ];

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Lock className="w-12 h-12 mb-3" />
        <p className="text-sm">You don't have permission to access settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your cafeteria POS system</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'business' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Business Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Business Name" value="Kirinyaga Healthcare Workers Cafeteria" onChange={() => {}} />
            <Input label="County" value="Kirinyaga County" onChange={() => {}} />
            <Input label="Country" value="Kenya" onChange={() => {}} />
            <Input label="Phone" value="0722123456" onChange={() => {}} />
            <Input label="Email" value="info@khcw-cafeteria.demo" onChange={() => {}} />
            <Input label="KRA PIN" value="P051234567X" onChange={() => {}} />
            <div className="col-span-2"><Input label="Address" value="Kerugoya Town, Kirinyaga County, Kenya" onChange={() => {}} /></div>
          </div>
          <div className="mt-4"><Button>Save Changes</Button></div>
        </Card>
      )}

      {tab === 'tax' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Tax Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div><p className="text-sm font-medium text-slate-800">Enable Tax</p><p className="text-xs text-slate-500">Apply tax to all sales</p></div>
              <Badge color="gray">Disabled</Badge>
            </div>
            <Input label="Tax Rate (%)" value="0" onChange={() => {}} type="number" />
            <Input label="Tax Name" value="VAT" onChange={() => {}} />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Tax is currently disabled. Enable it to automatically calculate tax on each sale.
            </div>
            <Button>Save Tax Settings</Button>
          </div>
        </Card>
      )}

      {tab === 'receipt' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Receipt Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Header Line 1" value="KIRINYAGA HEALTHCARE" onChange={() => {}} />
            <Input label="Header Line 2" value="WORKERS CAFETERIA" onChange={() => {}} />
            <Input label="Footer Line 1" value="Thank you for your purchase!" onChange={() => {}} />
            <Input label="Footer Line 2" value="Served with care at KHCW Cafeteria" onChange={() => {}} />
            <Input label="Address" value="Kirinyaga County, Kenya" onChange={() => {}} />
            <Input label="Currency Symbol" value="KSh" onChange={() => {}} />
          </div>
          <div className="mt-4"><Button>Save Receipt Settings</Button></div>
        </Card>
      )}

      {tab === 'payment' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Payment Configuration</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5 text-white" /></div>
                <div><p className="font-medium text-slate-900">Co-op Bank M-Pesa STK Push</p><Badge color="green">Active</Badge></div>
              </div>
              <p className="text-sm text-slate-600">All cafeteria payments are processed via Co-op Bank M-Pesa STK Push.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-800 mb-2">Backend Configuration (Laravel)</p>
              <div className="space-y-1 text-xs text-slate-500 font-mono">
                <p>COOP_BASE_URL = ••••••••</p>
                <p>COOP_CLIENT_ID = ••••••••</p>
                <p>COOP_CLIENT_SECRET = ••••••••</p>
                <p>COOP_API_KEY = ••••••••</p>
                <p>COOP_MERCHANT_ID = ••••••••</p>
                <p>COOP_ACCOUNT_NUMBER = ••••••••</p>
                <p>COOP_CALLBACK_URL = ••••••••</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-800">Payment credentials are stored securely in the backend. They are never exposed in the frontend.</p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'inventory' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Inventory Settings</h3>
          <div className="space-y-4">
            <Input label="Default Minimum Stock Level" value="5" onChange={() => {}} type="number" />
            <Input label="Default Reorder Level" value="10" onChange={() => {}} type="number" />
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div><p className="text-sm font-medium text-slate-800">Auto-deduct on Sale</p><p className="text-xs text-slate-500">Reduce stock when payment is confirmed</p></div>
              <Badge color="green">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div><p className="text-sm font-medium text-slate-800">Low Stock Alerts</p><p className="text-xs text-slate-500">Notify when items fall below minimum</p></div>
              <Badge color="green">Enabled</Badge>
            </div>
            <Button>Save Inventory Settings</Button>
          </div>
        </Card>
      )}

      {tab === 'categories' && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Product Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg">
                <span className="text-2xl">{cat.icon}</span>
                <div><p className="text-sm font-medium text-slate-800">{cat.name}</p><p className="text-xs text-slate-400">{cat.description}</p></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'audit' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Audit Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div><p className="text-sm font-medium text-slate-800">Log All Actions</p><p className="text-xs text-slate-500">Record every sensitive action</p></div>
              <Badge color="green">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div><p className="text-sm font-medium text-slate-800">Log IP Address</p><p className="text-xs text-slate-500">Record user IP in audit logs</p></div>
              <Badge color="green">Enabled</Badge>
            </div>
            <Input label="Audit Log Retention (days)" value="90" onChange={() => {}} type="number" />
            <Button>Save Audit Settings</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

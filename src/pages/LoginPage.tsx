import { useState } from 'react';
import { useStore } from '@/services/StoreContext';
import { Button, Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, EyeOff, Lock, Mail, UtensilsCrossed, ShieldCheck } from 'lucide-react';

const demoAccounts = [
  { email: 'admin@khcw-cafeteria.demo', password: 'admin123', role: 'Super Admin', color: '#1e293b' },
  { email: 'manager@khcw-cafeteria.demo', password: 'manager123', role: 'Manager', color: '#c2410c' },
  { email: 'cashier@khcw-cafeteria.demo', password: 'cashier123', role: 'Cashier', color: '#15803d' },
  { email: 'store@khcw-cafeteria.demo', password: 'store123', role: 'Storekeeper', color: '#1d4ed8' },
  { email: 'accounts@khcw-cafeteria.demo', password: 'accounts123', role: 'Accountant', color: '#7c3aed' },
  { email: 'supervisor@khcw-cafeteria.demo', password: 'super123', role: 'Supervisor', color: '#b45309' },
];

export function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error ?? 'Login failed');
        setLoading(false);
      }
    }, 600);
  };

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(demoEmail, demoPassword);
      if (!result.success) {
        setError(result.error ?? 'Login failed');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">KHCW Cafeteria</h1>
              <p className="text-slate-400 text-sm">Kirinyaga County, Kenya</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Enterprise Cafeteria<br />Point of Sale System
          </h2>
          <p className="text-slate-300 text-lg max-w-md">
            Complete POS, inventory, procurement, payments, and financial management for healthcare worker cafeterias.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Co-op Bank M-Pesa STK Push integration',
              'Real-time inventory & stock movements',
              'Cashier shifts & cash reconciliation',
              'Financial ledger & audit trail',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm">
            &copy; 2026 Kirinyaga Healthcare Workers Cafeteria. All rights reserved.
          </p>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Powered by <span className="text-orange-500 font-semibold">PandaTechs Softwares</span>
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-slate-900 font-bold text-lg">KHCW Cafeteria POS</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email or Username"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@khcw-cafeteria.demo"
              icon={<Mail className="w-4 h-4" />}
              error={error || undefined}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-xs text-slate-500 uppercase tracking-wide">Quick Demo Login</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email, acc.password)}
                  disabled={loading}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: acc.color }}>
                    {acc.role.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{acc.role}</p>
                    <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Powered by <span className="font-semibold text-slate-600">PandaTechs Softwares</span>
        </p>
      </div>
    </div>
  );
}

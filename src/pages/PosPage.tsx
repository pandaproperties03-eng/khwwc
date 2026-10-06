import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/services/StoreContext';
import { Button, Card, Badge, Modal, Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Receipt as ReceiptComponent } from '@/components/Receipt';
import { mockPaymentProvider } from '@/services/PaymentService';
import { formatKes, validateKenyanPhone } from '@/utils/format';
import type { CartItem, Product, Sale, PaymentStatus } from '@/types';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Pause, X,
  Phone, CheckCircle2, XCircle, Clock, Loader2, CreditCard,
  Printer, FileDown, RefreshCw, AlertCircle, Check,
} from 'lucide-react';

export function PosPage() {
  const {
    currentUser, categories, products, createSale, updateSaleStatus,
    getActiveShift, openShift, holdOrder, heldOrders, resumeOrder,
    deleteHeldOrder, getProductStockStatus, sales,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentView, setPaymentView] = useState<'cart' | 'processing' | 'success' | 'failed'>('cart');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [stkRef, setStkRef] = useState('');
  const [heldOrdersOpen, setHeldOrdersOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('5000');
  const [openingNotes, setOpeningNotes] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const activeShift = currentUser ? getActiveShift(currentUser.id) : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F4') { e.preventDefault(); handleHoldOrder(); }
      if (e.key === 'F8') { e.preventDefault(); handleCheckout(); }
      if (e.key === 'Escape') { setCheckoutOpen(false); setHeldOrdersOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cart]);

  const filteredProducts = products.filter(p => {
    if (!p.active) return false;
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
    }
    return true;
  });

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(ci => ci.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(ci => ci.product.id === product.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(ci => {
        if (ci.product.id !== productId) return ci;
        const newQty = ci.quantity + delta;
        if (newQty <= 0) return ci;
        if (newQty > ci.product.stock) return ci;
        return { ...ci, quantity: newQty };
      }).filter(ci => ci.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(ci => ci.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, ci) => sum + ci.product.sellingPrice * ci.quantity, 0);
  const totalDiscount = cart.reduce((sum, ci) => sum + ci.discount, 0);
  const total = subtotal - totalDiscount;

  const handleHoldOrder = () => {
    if (cart.length === 0 || !currentUser) return;
    const orderNo = `HELD-${Date.now().toString().slice(-6)}`;
    holdOrder({
      id: `held-${Date.now()}`,
      orderNo,
      items: cart,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      heldAt: new Date().toISOString(),
    });
    clearCart();
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!activeShift) {
      setShiftModalOpen(true);
      return;
    }
    setCheckoutOpen(true);
    setPaymentView('cart');
    setPhoneNumber('');
    setPhoneError('');
  };

  const handleOpenShift = () => {
    if (!currentUser) return;
    openShift({
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      openingFloat: parseInt(openingFloat) || 0,
      openingNotes,
    });
    setShiftModalOpen(false);
  };

  const handleSendStkPush = () => {
    if (!currentUser) return;
    const validation = validateKenyanPhone(phoneNumber);
    if (!validation.valid) {
      setPhoneError('Enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }
    setPhoneError('');

    // Create the sale
    const sale = createSale({
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      shiftId: activeShift?.id ?? null,
      items: cart,
      subtotal,
      discount: totalDiscount,
      tax: 0,
      total,
      customerPhone: validation.normalized!,
      customerName: null,
      customerId: null,
      paymentMethod: 'MPESA_STK',
    });
    setCurrentSale(sale);

    // Initiate mock payment
    const attempt = mockPaymentProvider.initiatePayment({
      saleId: sale.id,
      amount: total,
      phoneNumber: validation.normalized!,
    });
    setStkRef(attempt.stkRef);
    setPaymentStatus('PROCESSING');
    setPaymentView('processing');
    setPaymentMessage('STK Push sent successfully. Waiting for customer confirmation...');

    // Listen for payment update
    mockPaymentProvider.setOnUpdate((attemptId, status) => {
      if (attemptId !== attempt.id) return;
      setPaymentStatus(status);
      if (status === 'CONFIRMED') {
        updateSaleStatus(sale.id, 'SALE_COMPLETED', 'CONFIRMED', attempt.stkRef);
        setPaymentMessage('Payment confirmed! Sale completed.');
        setTimeout(() => {
          setPaymentView('success');
        }, 800);
      } else if (status === 'FAILED') {
        updateSaleStatus(sale.id, 'PAYMENT_FAILED', 'FAILED');
        setPaymentMessage('Payment failed. Customer did not respond to STK prompt.');
        setPaymentView('failed');
      }
    });
  };

  const handleRetryPayment = () => {
    if (!currentSale || !currentUser) return;
    const validation = validateKenyanPhone(phoneNumber);
    if (!validation.valid) {
      setPhoneError('Enter a valid Kenyan phone number');
      return;
    }
    setPhoneError('');
    const attempt = mockPaymentProvider.initiatePayment({
      saleId: currentSale.id,
      amount: total,
      phoneNumber: validation.normalized!,
    });
    setStkRef(attempt.stkRef);
    setPaymentStatus('PROCESSING');
    setPaymentView('processing');
    setPaymentMessage('Retrying STK Push. Waiting for customer confirmation...');

    mockPaymentProvider.setOnUpdate((attemptId, status) => {
      if (attemptId !== attempt.id) return;
      setPaymentStatus(status);
      if (status === 'CONFIRMED') {
        updateSaleStatus(currentSale.id, 'SALE_COMPLETED', 'CONFIRMED', attempt.stkRef);
        setPaymentMessage('Payment confirmed! Sale completed.');
        setTimeout(() => setPaymentView('success'), 800);
      } else if (status === 'FAILED') {
        updateSaleStatus(currentSale.id, 'PAYMENT_FAILED', 'FAILED');
        setPaymentMessage('Payment failed.');
        setPaymentView('failed');
      }
    });
  };

  const handleNewSale = () => {
    clearCart();
    setCheckoutOpen(false);
    setPaymentView('cart');
    setCurrentSale(null);
    setPaymentStatus('PENDING');
    setPaymentMessage('');
    setStkRef('');
  };

  const handleResumeOrder = (orderId: string) => {
    const order = resumeOrder(orderId);
    if (order) {
      setCart(order.items);
      setHeldOrdersOpen(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
      {/* Product Catalogue */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search & Categories */}
        <div className="mb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, or barcode... (F2)"
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Search className="w-12 h-12 mb-3" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => {
                const status = getProductStockStatus(product);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`bg-white rounded-xl border border-slate-200 p-3 text-left transition-all group ${
                      product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-300 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center mb-2 text-4xl">
                      {product.imageEmoji}
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-orange-600">{formatKes(product.sellingPrice)}</p>
                    </div>
                    <div className="mt-1">
                      {status === 'IN_STOCK' && <Badge color="green">{product.stock} in stock</Badge>}
                      {status === 'LOW_STOCK' && <Badge color="yellow">Low: {product.stock}</Badge>}
                      {status === 'OUT_OF_STOCK' && <Badge color="red">Out of stock</Badge>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Current Order
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeShift ? `Shift: ${activeShift.id.slice(-4).toUpperCase()}` : 'No active shift'}
            </p>
          </div>
          {heldOrders.length > 0 && (
            <button onClick={() => setHeldOrdersOpen(true)} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
              {heldOrders.length} held
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Click products to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(ci => (
                <div key={ci.product.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl flex-shrink-0">
                    {ci.product.imageEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{ci.product.name}</p>
                    <p className="text-xs text-slate-500">{formatKes(ci.product.sellingPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(ci.product.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{ci.quantity}</span>
                    <button onClick={() => updateQty(ci.product.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeFromCart(ci.product.id)} className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Actions */}
        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-800">{formatKes(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Discount</span>
              <span className="font-medium text-slate-800">{formatKes(totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-orange-600">{formatKes(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleHoldOrder} disabled={cart.length === 0}>
              <Pause className="w-4 h-4" /> Hold
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}>
              <X className="w-4 h-4" /> Clear
            </Button>
          </div>
          <Button fullWidth size="lg" onClick={handleCheckout} disabled={cart.length === 0}>
            <CreditCard className="w-5 h-5" /> Checkout (F8)
          </Button>
        </div>
      </div>

      {/* Held Orders Modal */}
      <Modal open={heldOrdersOpen} onClose={() => setHeldOrdersOpen(false)} title="Held Orders" size="md">
        {heldOrders.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No held orders</p>
        ) : (
          <div className="space-y-2">
            {heldOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{order.orderNo}</p>
                  <p className="text-sm text-slate-500">{order.items.length} items - {formatKes(order.items.reduce((s, ci) => s + ci.product.sellingPrice * ci.quantity, 0))}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleResumeOrder(order.id)}>Resume</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteHeldOrder(order.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Shift Opening Modal */}
      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)} title="Open Cashier Shift" size="sm">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">You need an open shift to process sales.</p>
          </div>
          <Input label="Opening Float (KSh)" type="number" value={openingFloat} onChange={setOpeningFloat} placeholder="5000" />
          <Input label="Opening Notes" value={openingNotes} onChange={setOpeningNotes} placeholder="Any notes for this shift..." />
          <Button fullWidth size="lg" onClick={handleOpenShift}>Open Shift</Button>
        </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal open={checkoutOpen} onClose={() => checkoutOpen && paymentView === 'cart' ? setCheckoutOpen(false) : undefined} title="Checkout" size="md">
        {paymentView === 'cart' && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-slate-50 rounded-lg p-4">
              {currentSale && (
                <div className="flex justify-between text-xs text-slate-500 mb-3">
                  <span>Order: {currentSale.orderNo}</span>
                  <span>Cashier: {currentUser.name}</span>
                </div>
              )}
              <div className="space-y-2 mb-3">
                {cart.map(ci => (
                  <div key={ci.product.id} className="flex justify-between text-sm">
                    <span className="text-slate-700">{ci.quantity}x {ci.product.name}</span>
                    <span className="font-medium">{formatKes(ci.product.sellingPrice * ci.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span>{formatKes(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span>{formatKes(totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span className="text-slate-900">Total Payable</span>
                  <span className="text-orange-600">{formatKes(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Payment Method</p>
              <div className="border-2 border-orange-500 bg-orange-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Co-op Bank M-Pesa STK Push</p>
                  <p className="text-xs text-slate-500">Customer pays via M-Pesa prompt on their phone</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-orange-600 ml-auto" />
              </div>
            </div>

            {/* Phone number */}
            <Input
              label="Customer Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="0712345678"
              icon={<Phone className="w-4 h-4" />}
              error={phoneError || undefined}
            />

            <Button fullWidth size="lg" onClick={handleSendStkPush} disabled={!phoneNumber}>
              <Phone className="w-5 h-5" /> Send STK Push - {formatKes(total)}
            </Button>
          </div>
        )}

        {paymentView === 'processing' && (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Waiting for Payment</h3>
            <p className="text-sm text-slate-500 max-w-xs">{paymentMessage}</p>
            <div className="mt-6 w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500">Status</span>
                <Badge color="orange">STK Requested</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500">Reference</span>
                <span className="text-sm font-mono font-medium">{stkRef}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500">Amount</span>
                <span className="text-sm font-bold text-orange-600">{formatKes(total)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500">Phone</span>
                <span className="text-sm font-medium">{phoneNumber}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-6 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Waiting for customer to enter M-Pesa PIN...
            </p>
          </div>
        )}

        {paymentView === 'success' && currentSale && (
          <ReceiptComponent
            sale={sales.find(s => s.id === currentSale.id) ?? currentSale}
            onNewSale={handleNewSale}
          />
        )}

        {paymentView === 'failed' && (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-2">{paymentMessage}</p>
            <Badge color="red">Payment Failed</Badge>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={handleRetryPayment}>
                <RefreshCw className="w-4 h-4" /> Retry Payment
              </Button>
              <Button variant="ghost" onClick={handleNewSale}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

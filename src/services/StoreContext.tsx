import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Product, Sale, SaleItem, Shift, User, Supplier, PurchaseOrder, StockMovement,
  Expense, LedgerEntry, Customer, AuditLog, Notification, CartItem, HeldOrder,
  PaymentAttempt, SupplierPayment, Category, Role, PaymentStatus, SaleStatus,
  PaymentMethod, StockMovementType,
} from '@/types';
import * as seed from '@/mock/seedData';
import type {
  SaleInput, StockReceiveInput, StockAdjustInput, ProductInput, SupplierInput,
  ShiftInput, ShiftCloseInput, ExpenseInput, RefundInput, SupplierPaymentInput,
  PurchaseOrderInput, AuditInput, CustomerInput, PaymentInitiateInput,
} from '@/services/interfaces';

interface StoreContextType {
  // Data
  users: User[];
  roles: Role[];
  categories: Category[];
  products: Product[];
  sales: Sale[];
  shifts: Shift[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  supplierPayments: SupplierPayment[];
  stockMovements: StockMovement[];
  expenses: Expense[];
  ledgerEntries: LedgerEntry[];
  customers: Customer[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  heldOrders: HeldOrder[];
  paymentAttempts: PaymentAttempt[];
  currentUser: User | null;

  // Auth
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (perm: string) => boolean;

  // Sales
  createSale: (input: SaleInput) => Sale;
  updateSaleStatus: (saleId: string, saleStatus: SaleStatus, paymentStatus: PaymentStatus, paymentRef?: string) => void;
  refundSale: (saleId: string, reason: string, refundedById: string, refundedByName: string) => void;

  // Payment
  initiatePayment: (input: PaymentInitiateInput) => PaymentAttempt;
  checkPaymentStatus: (attemptId: string) => PaymentStatus;

  // Shifts
  openShift: (input: ShiftInput) => Shift;
  closeShift: (shiftId: string, input: ShiftCloseInput) => void;
  getActiveShift: (cashierId: string) => Shift | null;

  // Products
  addProduct: (input: ProductInput) => void;
  updateProduct: (id: string, input: Partial<ProductInput>) => void;

  // Inventory
  receiveStock: (input: StockReceiveInput) => PurchaseOrder;
  adjustStock: (input: StockAdjustInput) => void;

  // Suppliers
  addSupplier: (input: SupplierInput) => void;

  // Purchases
  createPurchaseOrder: (input: PurchaseOrderInput) => PurchaseOrder;

  // Expenses
  addExpense: (input: ExpenseInput) => void;

  // Supplier Payments
  addSupplierPayment: (input: SupplierPaymentInput) => void;

  // Customers
  addCustomer: (input: CustomerInput) => void;

  // Held Orders
  holdOrder: (order: HeldOrder) => void;
  resumeOrder: (orderId: string) => HeldOrder | null;
  deleteHeldOrder: (orderId: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Audit
  logAudit: (input: AuditInput) => void;

  // Helpers
  getProductStockStatus: (product: Product) => 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const StoreContext = createContext<StoreContextType | null>(null);

let ledgerCounter = 10000;
let auditCounter = 10000;
let saleCounter = 200;
let shiftCounter = 10;
let poCounter = 200;
let receiptCounter = 2000;
let paymentCounter = 200;
let notifCounter = 100;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users] = useState<User[]>(seed.users);
  const [roles] = useState<Role[]>(seed.roles);
  const [categories] = useState<Category[]>(seed.categories);
  const [products, setProducts] = useState<Product[]>(seed.products);
  const [sales, setSales] = useState<Sale[]>(seed.sales);
  const [shifts, setShifts] = useState<Shift[]>(seed.shifts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seed.suppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(seed.purchaseOrders);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(seed.supplierPayments);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(seed.stockMovements);
  const [expenses, setExpenses] = useState<Expense[]>(seed.expenses);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(seed.ledgerEntriesFinal);
  const [customers, setCustomers] = useState<Customer[]>(seed.customers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seed.auditLogs);
  const [notifications, setNotifications] = useState<Notification[]>(seed.notifications);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(seed.heldOrders);
  const [paymentAttempts, setPaymentAttempts] = useState<PaymentAttempt[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ===================
  // AUDIT
  // ===================
  const logAudit = useCallback((input: AuditInput) => {
    const log: AuditLog = {
      id: `aud-${auditCounter++}`,
      userId: input.userId,
      userName: input.userName,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      description: input.description,
      ip: '192.168.1.x',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  // ===================
  // AUTH
  // ===================
  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const user = users.find(u => u.email === email);
    if (!user) return { success: false, error: 'User not found' };
    const expectedPassword = seed.demoPasswords[email];
    if (password !== expectedPassword) return { success: false, error: 'Invalid password' };
    if (user.status !== 'ACTIVE') return { success: false, error: 'Account deactivated' };
    setCurrentUser(user);
    logAudit({ userId: user.id, userName: user.name, action: 'LOGIN', entity: 'User', entityId: user.id, description: `${user.name} logged in` });
    return { success: true };
  }, [users, logAudit]);

  const logout = useCallback(() => {
    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'LOGOUT', entity: 'User', entityId: currentUser.id, description: `${currentUser.name} logged out` });
    }
    setCurrentUser(null);
  }, [currentUser, logAudit]);

  const hasPermission = useCallback((perm: string): boolean => {
    if (!currentUser) return false;
    const role = roles.find(r => r.name === currentUser.role);
    if (!role) return false;
    return role.permissions.includes(perm as any);
  }, [currentUser, roles]);

  // ===================
  // HELPERS
  // ===================
  const getProductStockStatus = useCallback((product: Product): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
    if (product.stock <= 0) return 'OUT_OF_STOCK';
    if (product.stock <= product.minStock) return 'LOW_STOCK';
    return 'IN_STOCK';
  }, []);

  // ===================
  // SALES
  // ===================
  const createSale = useCallback((input: SaleInput): Sale => {
    const now = new Date().toISOString();
    const receiptNo = `RCP-${String(++receiptCounter).padStart(5, '0')}`;
    const orderNo = `ORD-${String(receiptCounter).padStart(5, '0')}`;
    const saleItems: SaleItem[] = input.items.map((ci, idx) => ({
      id: `si-${saleCounter}-${idx}`,
      productId: ci.product.id,
      productName: ci.product.name,
      quantity: ci.quantity,
      unitPrice: ci.product.sellingPrice,
      discount: ci.discount,
      subtotal: ci.product.sellingPrice * ci.quantity - ci.discount,
    }));

    const sale: Sale = {
      id: `sale-${++saleCounter}`,
      receiptNo,
      orderNo,
      date: now,
      cashierId: input.cashierId,
      cashierName: input.cashierName,
      shiftId: input.shiftId,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      items: saleItems,
      subtotal: input.subtotal,
      discount: input.discount,
      tax: input.tax,
      total: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'PENDING',
      saleStatus: 'ORDER_CREATED',
      paymentRef: null,
      createdAt: now,
      completedAt: null,
      refundReason: null,
      refundedById: null,
    };
    setSales(prev => [sale, ...prev]);
    logAudit({ userId: input.cashierId, userName: input.cashierName, action: 'SALE_CREATED', entity: 'Sale', entityId: sale.id, description: `Order ${orderNo} created - KSh ${input.total}` });
    return sale;
  }, [logAudit]);

  const updateSaleStatus = useCallback((saleId: string, saleStatus: SaleStatus, paymentStatus: PaymentStatus, paymentRef?: string) => {
    setSales(prev => prev.map(s => {
      if (s.id !== saleId) return s;
      const updated: Sale = {
        ...s,
        saleStatus,
        paymentStatus,
        paymentRef: paymentRef ?? s.paymentRef,
        completedAt: saleStatus === 'SALE_COMPLETED' ? new Date().toISOString() : s.completedAt,
      };
      return updated;
    }));

    // When sale is completed, reduce inventory, create stock movements, ledger, update shift
    if (saleStatus === 'SALE_COMPLETED') {
      setSales(prev => {
        const sale = prev.find(s => s.id === saleId);
        if (sale) {
          // Reduce stock
          setProducts(prevProds => prevProds.map(p => {
            const item = sale.items.find(si => si.productId === p.id);
            if (item) {
              return { ...p, stock: Math.max(0, p.stock - item.quantity) };
            }
            return p;
          }));

          // Stock movements
          const newMovements: StockMovement[] = sale.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              id: `sm-${Date.now()}-${item.productId}`,
              productId: item.productId,
              productName: item.productName,
              quantity: -item.quantity,
              previousQty: product?.stock ?? 0,
              newQty: Math.max(0, (product?.stock ?? 0) - item.quantity),
              type: 'SALE' as StockMovementType,
              reference: sale.receiptNo,
              userId: sale.cashierId,
              userName: sale.cashierName,
              date: new Date().toISOString(),
            };
          });
          setStockMovements(prev => [...newMovements, ...prev]);

          // Ledger entry
          const lastEntry = ledgerEntries[ledgerEntries.length - 1];
          const newBalance = (lastEntry?.balance ?? 0) + sale.total;
          const ledgerEntry: LedgerEntry = {
            id: `led-${++ledgerCounter}`,
            date: new Date().toISOString(),
            reference: sale.receiptNo,
            description: `Sale ${sale.receiptNo} - ${sale.items.length} items`,
            debit: 0,
            credit: sale.total,
            balance: newBalance,
            type: 'SALE',
            userId: sale.cashierId,
            userName: sale.cashierName,
          };
          setLedgerEntries(prev => [...prev, ledgerEntry]);

          // Update shift
          if (sale.shiftId) {
            setShifts(prev => prev.map(sh => {
              if (sh.id === sale.shiftId) {
                return {
                  ...sh,
                  totalSales: sh.totalSales + sale.total,
                  transactionCount: sh.transactionCount + 1,
                  successfulPayments: sh.successfulPayments + 1,
                  expectedCash: sh.expectedCash + sale.total,
                };
              }
              return sh;
            }));
          }

          // Add notification
          const notif: Notification = {
            id: `n-${++notifCounter}`,
            type: 'payment_confirmed',
            title: 'Payment Confirmed',
            message: `M-Pesa payment of KSh ${sale.total} confirmed for ${sale.receiptNo}`,
            read: false,
            timestamp: new Date().toISOString(),
            entityId: sale.id,
          };
          setNotifications(prev => [notif, ...prev]);

          logAudit({ userId: sale.cashierId, userName: sale.cashierName, action: 'PAYMENT_CONFIRMED', entity: 'Sale', entityId: sale.id, description: `Payment confirmed for ${sale.receiptNo} - KSh ${sale.total}` });
        }
        return prev;
      });
    }
  }, [products, ledgerEntries, logAudit]);

  const refundSale = useCallback((saleId: string, reason: string, refundedById: string, refundedByName: string) => {
    setSales(prev => prev.map(s => {
      if (s.id !== saleId) return s;
      if (s.saleStatus !== 'SALE_COMPLETED') return s;

      // Restore stock
      setProducts(prevProds => prevProds.map(p => {
        const item = s.items.find(si => si.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      }));

      // Stock movements for refund
      const refundMovements: StockMovement[] = s.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          id: `sm-ref-${Date.now()}-${item.productId}`,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          previousQty: product?.stock ?? 0,
          newQty: (product?.stock ?? 0) + item.quantity,
          type: 'REFUND' as StockMovementType,
          reference: `REFUND-${s.receiptNo}`,
          userId: refundedById,
          userName: refundedByName,
          date: new Date().toISOString(),
        };
      });
      setStockMovements(prev => [...refundMovements, ...prev]);

      // Ledger reversal
      const lastEntry = ledgerEntries[ledgerEntries.length - 1];
      const newBalance = (lastEntry?.balance ?? 0) - s.total;
      const ledgerEntry: LedgerEntry = {
        id: `led-${++ledgerCounter}`,
        date: new Date().toISOString(),
        reference: `REFUND-${s.receiptNo}`,
        description: `Refund for ${s.receiptNo} - ${reason}`,
        debit: s.total,
        credit: 0,
        balance: newBalance,
        type: 'REFUND',
        userId: refundedById,
        userName: refundedByName,
      };
      setLedgerEntries(prev => [...prev, ledgerEntry]);

      // Update shift
      if (s.shiftId) {
        setShifts(prev => prev.map(sh => {
          if (sh.id === s.shiftId) {
            return {
              ...sh,
              refunds: sh.refunds + 1,
              expectedCash: sh.expectedCash - s.total,
            };
          }
          return sh;
        }));
      }

      logAudit({ userId: refundedById, userName: refundedByName, action: 'REFUND_CREATED', entity: 'Sale', entityId: s.id, description: `Refund ${s.receiptNo} - KSh ${s.total} - Reason: ${reason}` });

      return {
        ...s,
        saleStatus: 'REFUNDED',
        refundReason: reason,
        refundedById,
      };
    }));
  }, [products, ledgerEntries, logAudit]);

  // ===================
  // PAYMENT
  // ===================
  const initiatePayment = useCallback((input: PaymentInitiateInput): PaymentAttempt => {
    const now = new Date().toISOString();
    const attempt: PaymentAttempt = {
      id: `pay-${++paymentCounter}`,
      saleId: input.saleId,
      amount: input.amount,
      method: 'MPESA_STK',
      status: 'PROCESSING',
      phoneNumber: input.phoneNumber,
      stkRef: `CO${Date.now().toString().slice(-8)}`,
      merchantRef: `MR${paymentCounter}`,
      createdAt: now,
      updatedAt: now,
      failureReason: null,
    };
    setPaymentAttempts(prev => [attempt, ...prev]);
    logAudit({ userId: currentUser?.id ?? '', userName: currentUser?.name ?? '', action: 'PAYMENT_INITIATED', entity: 'Payment', entityId: attempt.id, description: `STK Push sent to ${input.phoneNumber} for KSh ${input.amount}` });
    return attempt;
  }, [currentUser, logAudit]);

  const checkPaymentStatus = useCallback((attemptId: string): PaymentStatus => {
    const attempt = paymentAttempts.find(a => a.id === attemptId);
    return attempt?.status ?? 'PENDING';
  }, [paymentAttempts]);

  // ===================
  // SHIFTS
  // ===================
  const getActiveShift = useCallback((cashierId: string): Shift | null => {
    return shifts.find(s => s.cashierId === cashierId && s.status === 'OPEN') ?? null;
  }, [shifts]);

  const openShift = useCallback((input: ShiftInput): Shift => {
    // Prevent duplicate open shifts
    const existing = shifts.find(s => s.cashierId === input.cashierId && s.status === 'OPEN');
    if (existing) return existing;

    const now = new Date().toISOString();
    const shift: Shift = {
      id: `shift-${++shiftCounter}`,
      cashierId: input.cashierId,
      cashierName: input.cashierName,
      date: now.split('T')[0],
      openingFloat: input.openingFloat,
      openingNotes: input.openingNotes,
      closingNotes: null,
      status: 'OPEN',
      openedAt: now,
      closedAt: null,
      expectedCash: input.openingFloat,
      actualCash: 0,
      difference: 0,
      totalSales: 0,
      transactionCount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      refunds: 0,
    };
    setShifts(prev => [shift, ...prev]);
    logAudit({ userId: input.cashierId, userName: input.cashierName, action: 'SHIFT_OPENED', entity: 'Shift', entityId: shift.id, description: `Shift opened with float KSh ${input.openingFloat}` });
    return shift;
  }, [shifts, logAudit]);

  const closeShift = useCallback((shiftId: string, input: ShiftCloseInput) => {
    setShifts(prev => prev.map(s => {
      if (s.id !== shiftId) return s;
      const updated: Shift = {
        ...s,
        status: 'CLOSED',
        closedAt: new Date().toISOString(),
        actualCash: input.actualCash,
        closingNotes: input.closingNotes,
        difference: input.actualCash - s.expectedCash,
      };
      logAudit({ userId: s.cashierId, userName: s.cashierName, action: 'SHIFT_CLOSED', entity: 'Shift', entityId: s.id, description: `Shift closed. Expected: KSh ${s.expectedCash}, Actual: KSh ${input.actualCash}, Diff: KSh ${input.actualCash - s.expectedCash}` });
      return updated;
    }));
  }, [logAudit]);

  // ===================
  // PRODUCTS
  // ===================
  const addProduct = useCallback((input: ProductInput) => {
    const product: Product = {
      id: `p-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, product]);
    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'PRODUCT_CREATED', entity: 'Product', entityId: product.id, description: `Product ${product.name} created` });
    }
  }, [currentUser, logAudit]);

  const updateProduct = useCallback((id: string, input: Partial<ProductInput>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...input } : p));
    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'PRODUCT_UPDATED', entity: 'Product', entityId: id, description: `Product updated` });
    }
  }, [currentUser, logAudit]);

  // ===================
  // INVENTORY
  // ===================
  const receiveStock = useCallback((input: StockReceiveInput): PurchaseOrder => {
    const now = new Date().toISOString();
    const poItems = input.items.map((item, idx) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: product?.name ?? 'Unknown',
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: item.quantity * item.unitCost,
      };
    });
    const subtotal = poItems.reduce((sum, i) => sum + i.total, 0);
    const total = subtotal + input.additionalCosts;

    const po: PurchaseOrder = {
      id: `po-${++poCounter}`,
      poNumber: `PO-${String(100 + poCounter).padStart(4, '0')}`,
      supplierId: input.supplierId,
      supplierName: suppliers.find(s => s.id === input.supplierId)?.companyName ?? 'Unknown',
      items: poItems,
      subtotal,
      additionalCosts: input.additionalCosts,
      total,
      status: 'RECEIVED',
      expectedDelivery: input.deliveryDate,
      createdBy: input.receivedBy,
      approvedBy: input.receivedBy,
      supplierInvoiceNo: input.supplierInvoiceNo,
      createdAt: now,
      paymentStatus: 'PENDING',
    };
    setPurchaseOrders(prev => [po, ...prev]);

    // Increase stock
    setProducts(prev => prev.map(p => {
      const item = input.items.find(i => i.productId === p.id);
      if (item) {
        return { ...p, stock: p.stock + item.quantity };
      }
      return p;
    }));

    // Stock movements
    const newMovements: StockMovement[] = input.items.map((item, idx) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: `sm-recv-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: product?.name ?? 'Unknown',
        quantity: item.quantity,
        previousQty: product?.stock ?? 0,
        newQty: (product?.stock ?? 0) + item.quantity,
        type: 'PURCHASE' as StockMovementType,
        reference: po.poNumber,
        userId: currentUser?.id ?? '',
        userName: currentUser?.name ?? input.receivedBy,
        date: now,
      };
    });
    setStockMovements(prev => [...newMovements, ...prev]);

    // Ledger entry
    const lastEntry = ledgerEntries[ledgerEntries.length - 1];
    const newBalance = (lastEntry?.balance ?? 0) - total;
    const ledgerEntry: LedgerEntry = {
      id: `led-${++ledgerCounter}`,
      date: now,
      reference: po.poNumber,
      description: `Stock received - ${po.supplierName} - ${input.supplierInvoiceNo}`,
      debit: total,
      credit: 0,
      balance: newBalance,
      type: 'PURCHASE',
      userId: currentUser?.id ?? '',
      userName: currentUser?.name ?? input.receivedBy,
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);

    // Supplier payable
    const sp: SupplierPayment = {
      id: `sp-${Date.now()}`,
      supplierId: input.supplierId,
      supplierName: po.supplierName,
      purchaseOrderId: po.id,
      invoiceNo: input.supplierInvoiceNo,
      amount: 0,
      outstandingAmount: total,
      paymentRef: '',
      date: now,
      notes: 'Pending payment',
      status: 'PENDING',
    };
    setSupplierPayments(prev => [sp, ...prev]);

    // Notification
    const notif: Notification = {
      id: `n-${++notifCounter}`,
      type: 'stock_received',
      title: 'Stock Received',
      message: `Stock received from ${po.supplierName} - KSh ${total}`,
      read: false,
      timestamp: now,
      entityId: po.id,
    };
    setNotifications(prev => [notif, ...prev]);

    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'STOCK_RECEIVED', entity: 'PurchaseOrder', entityId: po.id, description: `Stock received - ${po.poNumber} - KSh ${total}` });
    }

    return po;
  }, [products, suppliers, ledgerEntries, currentUser, logAudit]);

  const adjustStock = useCallback((input: StockAdjustInput) => {
    const product = products.find(p => p.id === input.productId);
    if (!product) return;

    const diff = input.newQuantity - product.stock;
    const now = new Date().toISOString();

    setProducts(prev => prev.map(p => p.id === input.productId ? { ...p, stock: input.newQuantity } : p));

    const movement: StockMovement = {
      id: `sm-adj-${Date.now()}`,
      productId: input.productId,
      productName: product.name,
      quantity: diff,
      previousQty: product.stock,
      newQty: input.newQuantity,
      type: input.type,
      reference: `ADJ-${Date.now()}`,
      userId: input.userId,
      userName: input.userName,
      date: now,
    };
    setStockMovements(prev => [movement, ...prev]);
    logAudit({ userId: input.userId, userName: input.userName, action: 'STOCK_ADJUSTED', entity: 'Product', entityId: input.productId, description: `Stock adjusted for ${product.name}: ${product.stock} → ${input.newQuantity} - ${input.reason}` });
  }, [products, logAudit]);

  // ===================
  // SUPPLIERS
  // ===================
  const addSupplier = useCallback((input: SupplierInput) => {
    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, supplier]);
    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'SUPPLIER_CREATED', entity: 'Supplier', entityId: supplier.id, description: `Supplier ${supplier.companyName} created` });
    }
  }, [currentUser, logAudit]);

  // ===================
  // PURCHASE ORDERS
  // ===================
  const createPurchaseOrder = useCallback((input: PurchaseOrderInput): PurchaseOrder => {
    const now = new Date().toISOString();
    const poItems = input.items.map((item, idx) => ({
      id: `poi-${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitCost: item.unitCost,
      total: item.quantity * item.unitCost,
    }));
    const subtotal = poItems.reduce((sum, i) => sum + i.total, 0);
    const total = subtotal + input.additionalCosts;

    const po: PurchaseOrder = {
      id: `po-${++poCounter}`,
      poNumber: `PO-${String(100 + poCounter).padStart(4, '0')}`,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      items: poItems,
      subtotal,
      additionalCosts: input.additionalCosts,
      total,
      status: 'SUBMITTED',
      expectedDelivery: input.expectedDelivery,
      createdBy: input.createdBy,
      approvedBy: null,
      supplierInvoiceNo: input.supplierInvoiceNo,
      createdAt: now,
      paymentStatus: 'PENDING',
    };
    setPurchaseOrders(prev => [po, ...prev]);
    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'PURCHASE_CREATED', entity: 'PurchaseOrder', entityId: po.id, description: `Purchase order ${po.poNumber} created for ${input.supplierName}` });
    }
    return po;
  }, [currentUser, logAudit]);

  // ===================
  // EXPENSES
  // ===================
  const addExpense = useCallback((input: ExpenseInput) => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      ...input,
      approvalStatus: input.amount > 3000 ? 'PENDING' : 'APPROVED',
    };
    setExpenses(prev => [expense, ...prev]);

    // Ledger entry
    const lastEntry = ledgerEntries[ledgerEntries.length - 1];
    const newBalance = (lastEntry?.balance ?? 0) - input.amount;
    const ledgerEntry: LedgerEntry = {
      id: `led-${++ledgerCounter}`,
      date: input.date,
      reference: input.reference,
      description: `Expense: ${input.description}`,
      debit: input.amount,
      credit: 0,
      balance: newBalance,
      type: 'EXPENSE',
      userId: currentUser?.id ?? '',
      userName: input.recordedBy,
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);

    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'EXPENSE_CREATED', entity: 'Expense', entityId: expense.id, description: `Expense ${input.description} - KSh ${input.amount}` });
    }
  }, [ledgerEntries, currentUser, logAudit]);

  // ===================
  // SUPPLIER PAYMENTS
  // ===================
  const addSupplierPayment = useCallback((input: SupplierPaymentInput) => {
    const payment: SupplierPayment = {
      id: `sp-${Date.now()}`,
      ...input,
      outstandingAmount: 0,
      status: 'PAID',
    };
    setSupplierPayments(prev => [payment, ...prev]);

    // Ledger entry
    const lastEntry = ledgerEntries[ledgerEntries.length - 1];
    const newBalance = (lastEntry?.balance ?? 0) - input.amount;
    const ledgerEntry: LedgerEntry = {
      id: `led-${++ledgerCounter}`,
      date: input.date,
      reference: input.paymentRef,
      description: `Supplier payment to ${input.supplierName} - ${input.invoiceNo}`,
      debit: input.amount,
      credit: 0,
      balance: newBalance,
      type: 'SUPPLIER_PAYMENT',
      userId: currentUser?.id ?? '',
      userName: currentUser?.name ?? '',
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);

    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'PURCHASE_CREATED', entity: 'SupplierPayment', entityId: payment.id, description: `Supplier payment ${input.paymentRef} - KSh ${input.amount}` });
    }
  }, [ledgerEntries, currentUser, logAudit]);

  // ===================
  // CUSTOMERS
  // ===================
  const addCustomer = useCallback((input: CustomerInput) => {
    const customer: Customer = {
      id: `cus-${Date.now()}`,
      ...input,
      status: 'ACTIVE',
      totalSpent: 0,
      lastPurchase: null,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, customer]);
    if (currentUser) {
      logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'USER_CREATED', entity: 'Customer', entityId: customer.id, description: `Customer ${customer.name} created` });
    }
  }, [currentUser, logAudit]);

  // ===================
  // HELD ORDERS
  // ===================
  const holdOrder = useCallback((order: HeldOrder) => {
    setHeldOrders(prev => [order, ...prev]);
  }, []);

  const resumeOrder = useCallback((orderId: string): HeldOrder | null => {
    const order = heldOrders.find(o => o.id === orderId);
    if (order) {
      setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    }
    return order ?? null;
  }, [heldOrders]);

  const deleteHeldOrder = useCallback((orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  // ===================
  // NOTIFICATIONS
  // ===================
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value: StoreContextType = {
    users, roles, categories, products, sales, shifts, suppliers,
    purchaseOrders, supplierPayments, stockMovements, expenses,
    ledgerEntries, customers, auditLogs, notifications, heldOrders,
    paymentAttempts, currentUser,
    login, logout, hasPermission,
    createSale, updateSaleStatus, refundSale,
    initiatePayment, checkPaymentStatus,
    openShift, closeShift, getActiveShift,
    addProduct, updateProduct,
    receiveStock, adjustStock,
    addSupplier, createPurchaseOrder,
    addExpense, addSupplierPayment,
    addCustomer,
    holdOrder, resumeOrder, deleteHeldOrder,
    markNotificationRead, markAllNotificationsRead,
    logAudit,
    getProductStockStatus,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

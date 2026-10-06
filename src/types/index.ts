// =====================
// API Response Types
// =====================

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  field?: string;
}

// =====================
// Core Enums / Constants
// =====================

export type RoleName =
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'CASHIER'
  | 'STOREKEEPER'
  | 'ACCOUNTANT'
  | 'SUPERVISOR';

export type PermissionName =
  | 'dashboard.view'
  | 'pos.access'
  | 'sales.view'
  | 'sales.create'
  | 'sales.refund'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'inventory.receive'
  | 'purchases.view'
  | 'purchases.create'
  | 'suppliers.view'
  | 'suppliers.create'
  | 'payments.view'
  | 'payments.refund'
  | 'shifts.open'
  | 'shifts.close'
  | 'ledger.view'
  | 'expenses.create'
  | 'reports.view'
  | 'reports.export'
  | 'users.view'
  | 'users.create'
  | 'roles.manage'
  | 'audit.view'
  | 'settings.manage';

export type SaleStatus =
  | 'ORDER_CREATED'
  | 'PAYMENT_PENDING'
  | 'STK_REQUESTED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_CONFIRMED'
  | 'SALE_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED'
  | 'PAYMENT_CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'MPESA_STK' | 'CASH' | 'CREDIT';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type StockMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'REFUND'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'WASTE'
  | 'OPENING_BALANCE';

export type ShiftStatus = 'OPEN' | 'CLOSED';

export type POStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type SupplierPaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';

export type CustomerType = 'HEALTHCARE_WORKER' | 'VISITOR' | 'STAFF' | 'OTHER';

export type ExpenseCategory =
  | 'Utilities'
  | 'Cleaning'
  | 'Food supplies'
  | 'Transport'
  | 'Repairs'
  | 'Maintenance'
  | 'Stationery'
  | 'Staff welfare'
  | 'Other';

export type LedgerEntryType =
  | 'SALE'
  | 'PURCHASE'
  | 'PAYMENT'
  | 'EXPENSE'
  | 'REFUND'
  | 'SUPPLIER_PAYMENT'
  | 'ADJUSTMENT';

// =====================
// Entities
// =====================

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  permissions: PermissionName[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleName;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string | null;
  avatarColor: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  unit: string;
  stock: number;
  minStock: number;
  reorderLevel: number;
  supplierId: string | null;
  active: boolean;
  imageEmoji: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  orderNo: string;
  date: string;
  cashierId: string;
  cashierName: string;
  shiftId: string | null;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  saleStatus: SaleStatus;
  paymentRef: string | null;
  createdAt: string;
  completedAt: string | null;
  refundReason: string | null;
  refundedById: string | null;
}

export interface PaymentAttempt {
  id: string;
  saleId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  phoneNumber: string;
  stkRef: string;
  merchantRef: string;
  createdAt: string;
  updatedAt: string;
  failureReason: string | null;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  date: string;
  openingFloat: number;
  openingNotes: string;
  closingNotes: string | null;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  expectedCash: number;
  actualCash: number;
  difference: number;
  totalSales: number;
  transactionCount: number;
  successfulPayments: number;
  failedPayments: number;
  refunds: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  kraPin: string;
  paymentTerms: string;
  openingBalance: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  additionalCosts: number;
  total: number;
  status: POStatus;
  expectedDelivery: string;
  createdBy: string;
  approvedBy: string | null;
  supplierInvoiceNo: string;
  createdAt: string;
  paymentStatus: SupplierPaymentStatus;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string | null;
  invoiceNo: string;
  amount: number;
  outstandingAmount: number;
  paymentRef: string;
  date: string;
  notes: string;
  status: SupplierPaymentStatus;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  previousQty: number;
  newQty: number;
  type: StockMovementType;
  reference: string;
  userId: string;
  userName: string;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: string;
  reference: string;
  recordedBy: string;
  notes: string;
  approvalStatus: 'APPROVED' | 'PENDING';
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: LedgerEntryType;
  userId: string;
  userName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  staffNumber: string;
  department: string;
  facility: string;
  type: CustomerType;
  status: 'ACTIVE' | 'INACTIVE';
  totalSpent: number;
  lastPurchase: string | null;
  outstandingBalance: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  ip: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'payment_confirmed' | 'payment_failed' | 'refund_approved' | 'supplier_invoice_due' | 'shift_open_long' | 'stock_received' | 'purchase_approved';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  entityId?: string;
}

// =====================
// Cart & POS Types
// =====================

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface HeldOrder {
  id: string;
  orderNo: string;
  items: CartItem[];
  cashierId: string;
  cashierName: string;
  heldAt: string;
}

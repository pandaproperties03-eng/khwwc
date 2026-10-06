import type {
  Product, Sale, SaleItem, Shift, User, Supplier, PurchaseOrder, StockMovement,
  Expense, LedgerEntry, Customer, AuditLog, Notification, CartItem, HeldOrder,
  PaymentAttempt, SupplierPayment, Category, Role, PaymentStatus, SaleStatus,
  PaymentMethod, StockMovementType, ExpenseCategory,
} from '@/types';

export interface AppState {
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
}

export interface SaleInput {
  cashierId: string;
  cashierName: string;
  shiftId: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customerPhone: string;
  customerName: string | null;
  customerId: string | null;
  paymentMethod: PaymentMethod;
}

export interface StockReceiveInput {
  supplierId: string;
  supplierInvoiceNo: string;
  deliveryDate: string;
  items: { productId: string; quantity: number; unitCost: number }[];
  additionalCosts: number;
  receivedBy: string;
}

export interface StockAdjustInput {
  productId: string;
  newQuantity: number;
  reason: string;
  type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'WASTE';
  userId: string;
  userName: string;
}

export interface ProductInput {
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
}

export interface SupplierInput {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  kraPin: string;
  paymentTerms: string;
  openingBalance: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ShiftInput {
  cashierId: string;
  cashierName: string;
  openingFloat: number;
  openingNotes: string;
}

export interface ShiftCloseInput {
  actualCash: number;
  closingNotes: string;
}

export interface ExpenseInput {
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: string;
  reference: string;
  recordedBy: string;
  notes: string;
}

export interface RefundInput {
  saleId: string;
  reason: string;
  refundedBy: string;
  refundedByName: string;
}

export interface SupplierPaymentInput {
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string | null;
  invoiceNo: string;
  amount: number;
  paymentRef: string;
  date: string;
  notes: string;
}

export interface PurchaseOrderInput {
  supplierId: string;
  supplierName: string;
  items: { productId: string; productName: string; quantity: number; unitCost: number }[];
  additionalCosts: number;
  expectedDelivery: string;
  createdBy: string;
  supplierInvoiceNo: string;
}

export interface AuditInput {
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  staffNumber: string;
  department: string;
  facility: string;
  type: Customer['type'];
}

export interface PaymentInitiateInput {
  saleId: string;
  amount: number;
  phoneNumber: string;
}

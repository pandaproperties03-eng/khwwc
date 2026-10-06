import type {
  Product,
  Category,
  Supplier,
  Sale,
  SaleItem,
  Shift,
  User,
  Role,
  StockMovement,
  Expense,
  LedgerEntry,
  Customer,
  AuditLog,
  Notification,
  PurchaseOrder,
  PaymentAttempt,
  HeldOrder,
  SupplierPayment,
} from '@/types';

// =====================
// ROLES & PERMISSIONS
// =====================

export const roles: Role[] = [
  {
    id: 'role-1',
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    permissions: [
      'dashboard.view', 'pos.access', 'sales.view', 'sales.create', 'sales.refund',
      'products.view', 'products.create', 'products.edit', 'inventory.view', 'inventory.adjust',
      'inventory.receive', 'purchases.view', 'purchases.create', 'suppliers.view', 'suppliers.create',
      'payments.view', 'payments.refund', 'shifts.open', 'shifts.close', 'ledger.view',
      'expenses.create', 'reports.view', 'reports.export', 'users.view', 'users.create',
      'roles.manage', 'audit.view', 'settings.manage',
    ],
  },
  {
    id: 'role-2',
    name: 'MANAGER',
    displayName: 'Manager',
    permissions: [
      'dashboard.view', 'pos.access', 'sales.view', 'sales.create', 'sales.refund',
      'products.view', 'products.create', 'products.edit', 'inventory.view', 'inventory.adjust',
      'inventory.receive', 'purchases.view', 'purchases.create', 'suppliers.view', 'suppliers.create',
      'payments.view', 'payments.refund', 'shifts.open', 'shifts.close', 'ledger.view',
      'expenses.create', 'reports.view', 'reports.export', 'users.view',
    ],
  },
  {
    id: 'role-3',
    name: 'CASHIER',
    displayName: 'Cashier',
    permissions: [
      'dashboard.view', 'pos.access', 'sales.view', 'sales.create',
      'products.view', 'payments.view', 'shifts.open', 'shifts.close',
    ],
  },
  {
    id: 'role-4',
    name: 'STOREKEEPER',
    displayName: 'Storekeeper',
    permissions: [
      'dashboard.view', 'products.view', 'products.edit', 'inventory.view', 'inventory.adjust',
      'inventory.receive', 'purchases.view', 'suppliers.view',
    ],
  },
  {
    id: 'role-5',
    name: 'ACCOUNTANT',
    displayName: 'Accountant',
    permissions: [
      'dashboard.view', 'sales.view', 'payments.view', 'ledger.view',
      'expenses.create', 'reports.view', 'reports.export', 'suppliers.view',
    ],
  },
  {
    id: 'role-6',
    name: 'SUPERVISOR',
    displayName: 'Supervisor',
    permissions: [
      'dashboard.view', 'sales.view', 'payments.view', 'shifts.open', 'shifts.close',
      'reports.view', 'users.view',
    ],
  },
];

// =====================
// USERS
// =====================

export const users: User[] = [
  { id: 'u-1', name: 'John Mwangi', email: 'admin@khcw-cafeteria.demo', phone: '0722123456', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '2026-10-06T07:30:00', avatarColor: '#1e293b', createdAt: '2026-01-01T00:00:00' },
  { id: 'u-2', name: 'Grace Wanjiku', email: 'manager@khcw-cafeteria.demo', phone: '0722234567', role: 'MANAGER', status: 'ACTIVE', lastLogin: '2026-10-06T06:45:00', avatarColor: '#c2410c', createdAt: '2026-01-05T00:00:00' },
  { id: 'u-3', name: 'Peter Kamau', email: 'cashier@khcw-cafeteria.demo', phone: '0722345678', role: 'CASHIER', status: 'ACTIVE', lastLogin: '2026-10-06T07:00:00', avatarColor: '#15803d', createdAt: '2026-02-01T00:00:00' },
  { id: 'u-4', name: 'Mary Njeri', email: 'store@khcw-cafeteria.demo', phone: '0722456789', role: 'STOREKEEPER', status: 'ACTIVE', lastLogin: '2026-10-06T06:30:00', avatarColor: '#1d4ed8', createdAt: '2026-02-10T00:00:00' },
  { id: 'u-5', name: 'Samuel Kibicho', email: 'accounts@khcw-cafeteria.demo', phone: '0722567890', role: 'ACCOUNTANT', status: 'ACTIVE', lastLogin: '2026-10-06T08:00:00', avatarColor: '#7c3aed', createdAt: '2026-01-15T00:00:00' },
  { id: 'u-6', name: 'Esther Wangari', email: 'supervisor@khcw-cafeteria.demo', phone: '0722678901', role: 'SUPERVISOR', status: 'ACTIVE', lastLogin: '2026-10-06T07:15:00', avatarColor: '#b45309', createdAt: '2026-03-01T00:00:00' },
];

export const demoPasswords: Record<string, string> = {
  'admin@khcw-cafeteria.demo': 'admin123',
  'manager@khcw-cafeteria.demo': 'manager123',
  'cashier@khcw-cafeteria.demo': 'cashier123',
  'store@khcw-cafeteria.demo': 'store123',
  'accounts@khcw-cafeteria.demo': 'accounts123',
  'supervisor@khcw-cafeteria.demo': 'super123',
};

// =====================
// CATEGORIES
// =====================

export const categories: Category[] = [
  { id: 'cat-1', name: 'Breakfast', description: 'Morning meals', icon: '🍳', color: '#f59e0b' },
  { id: 'cat-2', name: 'Lunch', description: 'Lunch dishes', icon: '🍽️', color: '#ef4444' },
  { id: 'cat-3', name: 'Dinner', description: 'Dinner dishes', icon: '🌙', color: '#8b5cf6' },
  { id: 'cat-4', name: 'Snacks', description: 'Quick bites', icon: '🥪', color: '#f97316' },
  { id: 'cat-5', name: 'Drinks', description: 'Beverages', icon: '🥤', color: '#06b6d4' },
  { id: 'cat-6', name: 'Tea & Coffee', description: 'Hot beverages', icon: '☕', color: '#92400e' },
  { id: 'cat-7', name: 'Fresh Juice', description: 'Freshly squeezed', icon: '🧃', color: '#84cc16' },
  { id: 'cat-8', name: 'Fruits', description: 'Fresh fruits', icon: '🍎', color: '#dc2626' },
  { id: 'cat-9', name: 'Bakery', description: 'Baked goods', icon: '🥖', color: '#d97706' },
  { id: 'cat-10', name: 'Specials', description: 'Chef specials', icon: '⭐', color: '#facc15' },
];

// =====================
// SUPPLIERS
// =====================

export const suppliers: Supplier[] = [
  { id: 'sup-1', companyName: 'Kirinyaga Fresh Foods', contactPerson: 'James Gitari', phone: '0722111001', email: 'info@kirinyagafresh.co.ke', address: 'Kutus Market, Kirinyaga', kraPin: 'A012345678B', paymentTerms: 'Net 30', openingBalance: 0, status: 'ACTIVE', createdAt: '2026-01-02T00:00:00' },
  { id: 'sup-2', companyName: 'Mountain Grains Suppliers', contactPerson: 'Sarah Wambui', phone: '0722111002', email: 'sales@mountaingrains.co.ke', address: 'Sagana Town, Kirinyaga', kraPin: 'A012345679B', paymentTerms: 'Net 14', openingBalance: 15000, status: 'ACTIVE', createdAt: '2026-01-03T00:00:00' },
  { id: 'sup-3', companyName: 'Central Beverages Ltd', contactPerson: 'David Mbugua', phone: '0722111003', email: 'orders@centralbeverages.co.ke', address: 'Kerugoya Town, Kirinyaga', kraPin: 'A012345680B', paymentTerms: 'Net 30', openingBalance: 0, status: 'ACTIVE', createdAt: '2026-01-04T00:00:00' },
  { id: 'sup-4', companyName: 'Kirinyaga Dairy Supplies', contactPerson: 'Loise Njoki', phone: '0722111004', email: 'info@kirinyagadairy.co.ke', address: 'Kagio Market, Kirinyaga', kraPin: 'A012345681B', paymentTerms: 'Net 7', openingBalance: 8500, status: 'ACTIVE', createdAt: '2026-01-05T00:00:00' },
  { id: 'sup-5', companyName: 'Fresh Harvest Produce', contactPerson: 'Michael Otieno', phone: '0722111005', email: 'fresh@harvestproduce.co.ke', address: 'Wanguru Town, Kirinyaga', kraPin: 'A012345682B', paymentTerms: 'Net 14', openingBalance: 0, status: 'ACTIVE', createdAt: '2026-01-06T00:00:00' },
  { id: 'sup-6', companyName: 'Highland Meat Suppliers', contactPerson: 'Daniel Kariuki', phone: '0722111006', email: 'info@highlandmeat.co.ke', address: 'Kutus Town, Kirinyaga', kraPin: 'A012345683B', paymentTerms: 'Net 7', openingBalance: 22000, status: 'ACTIVE', createdAt: '2026-01-07T00:00:00' },
  { id: 'sup-7', companyName: 'Nyota Bakery Supplies', contactPerson: 'Faith Wairimu', phone: '0722111007', email: 'orders@nyotabakery.co.ke', address: 'Kerugoya Town, Kirinyaga', kraPin: 'A012345684B', paymentTerms: 'Net 30', openingBalance: 0, status: 'ACTIVE', createdAt: '2026-01-08T00:00:00' },
  { id: 'sup-8', companyName: 'Mwea Rice Millers', contactPerson: 'Patrick Njogu', phone: '0722111008', email: 'sales@mwearice.co.ke', address: 'Mwea, Kirinyaga', kraPin: 'A012345685B', paymentTerms: 'Net 30', openingBalance: 0, status: 'INACTIVE', createdAt: '2026-01-09T00:00:00' },
];

// =====================
// PRODUCTS (30+)
// =====================

export const products: Product[] = [
  { id: 'p-1', sku: 'BEV-001', barcode: '6001000001', name: 'Tea', categoryId: 'cat-6', description: 'Hot Kenyan tea', sellingPrice: 30, costPrice: 15, unit: 'cup', stock: 200, minStock: 20, reorderLevel: 40, supplierId: 'sup-4', active: true, imageEmoji: '🍵', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-2', sku: 'BEV-002', barcode: '6001000002', name: 'Coffee', categoryId: 'cat-6', description: 'Freshly brewed coffee', sellingPrice: 50, costPrice: 25, unit: 'cup', stock: 150, minStock: 15, reorderLevel: 30, supplierId: 'sup-3', active: true, imageEmoji: '☕', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-3', sku: 'BRK-001', barcode: '6001000003', name: 'Mandazi', categoryId: 'cat-1', description: 'Fried sweet dough', sellingPrice: 25, costPrice: 12, unit: 'pc', stock: 80, minStock: 10, reorderLevel: 20, supplierId: 'sup-7', active: true, imageEmoji: '🍩', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-4', sku: 'BRK-002', barcode: '6001000004', name: 'Chapati', categoryId: 'cat-1', description: 'Flatbread', sellingPrice: 40, costPrice: 20, unit: 'pc', stock: 60, minStock: 10, reorderLevel: 20, supplierId: 'sup-7', active: true, imageEmoji: '🫓', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-5', sku: 'SNK-001', barcode: '6001000005', name: 'Samosa', categoryId: 'cat-4', description: 'Meat-filled pastry', sellingPrice: 50, costPrice: 30, unit: 'pc', stock: 45, minStock: 10, reorderLevel: 15, supplierId: 'sup-1', active: true, imageEmoji: '🥟', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-6', sku: 'LUN-001', barcode: '6001000006', name: 'Beef Stew', categoryId: 'cat-2', description: 'Slow-cooked beef', sellingPrice: 180, costPrice: 120, unit: 'plate', stock: 25, minStock: 5, reorderLevel: 10, supplierId: 'sup-6', active: true, imageEmoji: '🥩', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-7', sku: 'LUN-002', barcode: '6001000007', name: 'Chicken', categoryId: 'cat-2', description: 'Roasted chicken', sellingPrice: 250, costPrice: 170, unit: 'plate', stock: 18, minStock: 5, reorderLevel: 8, supplierId: 'sup-6', active: true, imageEmoji: '🍗', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-8', sku: 'LUN-003', barcode: '6001000008', name: 'Rice', categoryId: 'cat-2', description: 'Steamed white rice', sellingPrice: 100, costPrice: 60, unit: 'plate', stock: 50, minStock: 10, reorderLevel: 20, supplierId: 'sup-8', active: true, imageEmoji: '🍚', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-9', sku: 'LUN-004', barcode: '6001000009', name: 'Beans', categoryId: 'cat-2', description: 'Stewed beans', sellingPrice: 100, costPrice: 55, unit: 'plate', stock: 40, minStock: 8, reorderLevel: 15, supplierId: 'sup-2', active: true, imageEmoji: '🫘', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-10', sku: 'LUN-005', barcode: '6001000010', name: 'Ugali', categoryId: 'cat-2', description: 'Maize meal', sellingPrice: 70, costPrice: 35, unit: 'plate', stock: 35, minStock: 8, reorderLevel: 15, supplierId: 'sup-2', active: true, imageEmoji: '🌽', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-11', sku: 'LUN-006', barcode: '6001000011', name: 'Vegetables', categoryId: 'cat-2', description: 'Mixed vegetables', sellingPrice: 80, costPrice: 40, unit: 'plate', stock: 30, minStock: 5, reorderLevel: 10, supplierId: 'sup-5', active: true, imageEmoji: '🥬', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-12', sku: 'LUN-007', barcode: '6001000012', name: 'Vegetable Rice', categoryId: 'cat-2', description: 'Rice with mixed veggies', sellingPrice: 120, costPrice: 70, unit: 'plate', stock: 28, minStock: 5, reorderLevel: 10, supplierId: 'sup-8', active: true, imageEmoji: '🍱', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-13', sku: 'BEV-003', barcode: '6001000013', name: 'Fresh Juice', categoryId: 'cat-7', description: 'Freshly squeezed juice', sellingPrice: 120, costPrice: 60, unit: 'glass', stock: 35, minStock: 8, reorderLevel: 15, supplierId: 'sup-5', active: true, imageEmoji: '🧃', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-14', sku: 'BEV-004', barcode: '6001000014', name: 'Water', categoryId: 'cat-5', description: 'Bottled water 500ml', sellingPrice: 50, costPrice: 25, unit: 'bottle', stock: 120, minStock: 20, reorderLevel: 40, supplierId: 'sup-3', active: true, imageEmoji: '💧', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-15', sku: 'BEV-005', barcode: '6001000015', name: 'Soda', categoryId: 'cat-5', description: 'Assorted soda 300ml', sellingPrice: 70, costPrice: 40, unit: 'bottle', stock: 100, minStock: 15, reorderLevel: 30, supplierId: 'sup-3', active: true, imageEmoji: '🥤', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-16', sku: 'DAI-001', barcode: '6001000016', name: 'Milk', categoryId: 'cat-6', description: 'Fresh milk 200ml', sellingPrice: 40, costPrice: 25, unit: 'glass', stock: 90, minStock: 10, reorderLevel: 20, supplierId: 'sup-4', active: true, imageEmoji: '🥛', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-17', sku: 'DAI-002', barcode: '6001000017', name: 'Yoghurt', categoryId: 'cat-6', description: 'Plain yoghurt 150ml', sellingPrice: 100, costPrice: 55, unit: 'cup', stock: 45, minStock: 8, reorderLevel: 15, supplierId: 'sup-4', active: true, imageEmoji: '🍶', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-18', sku: 'FRT-001', barcode: '6001000018', name: 'Fruit Salad', categoryId: 'cat-8', description: 'Mixed fruit bowl', sellingPrice: 150, costPrice: 80, unit: 'bowl', stock: 20, minStock: 5, reorderLevel: 10, supplierId: 'sup-5', active: true, imageEmoji: '🍎', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-19', sku: 'FRT-002', barcode: '6001000019', name: 'Banana', categoryId: 'cat-8', description: 'Fresh banana', sellingPrice: 20, costPrice: 10, unit: 'pc', stock: 60, minStock: 10, reorderLevel: 20, supplierId: 'sup-5', active: true, imageEmoji: '🍌', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-20', sku: 'FRT-003', barcode: '6001000020', name: 'Avocado', categoryId: 'cat-8', description: 'Fresh avocado', sellingPrice: 50, costPrice: 25, unit: 'pc', stock: 40, minStock: 8, reorderLevel: 15, supplierId: 'sup-5', active: true, imageEmoji: '🥑', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-21', sku: 'BRK-003', barcode: '6001000021', name: 'Mahamri', categoryId: 'cat-1', description: 'Coastal sweet bread', sellingPrice: 30, costPrice: 15, unit: 'pc', stock: 50, minStock: 10, reorderLevel: 20, supplierId: 'sup-7', active: true, imageEmoji: '🍞', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-22', sku: 'BRK-004', barcode: '6001000022', name: 'Nduma', categoryId: 'cat-1', description: 'Boiled arrowroot', sellingPrice: 35, costPrice: 18, unit: 'pc', stock: 40, minStock: 8, reorderLevel: 15, supplierId: 'sup-1', active: true, imageEmoji: '🥔', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-23', sku: 'BRK-005', barcode: '6001000023', name: 'Sweet Potato', categoryId: 'cat-1', description: 'Boiled sweet potato', sellingPrice: 35, costPrice: 15, unit: 'pc', stock: 35, minStock: 8, reorderLevel: 15, supplierId: 'sup-1', active: true, imageEmoji: '🍠', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-24', sku: 'LUN-008', barcode: '6001000024', name: 'Githeri', categoryId: 'cat-2', description: 'Maize and beans mix', sellingPrice: 110, costPrice: 65, unit: 'plate', stock: 22, minStock: 5, reorderLevel: 10, supplierId: 'sup-2', active: true, imageEmoji: '🥘', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-25', sku: 'LUN-009', barcode: '6001000025', name: 'Nyama Choma', categoryId: 'cat-2', description: 'Grilled goat meat', sellingPrice: 300, costPrice: 200, unit: 'plate', stock: 8, minStock: 5, reorderLevel: 8, supplierId: 'sup-6', active: true, imageEmoji: '🍖', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-26', sku: 'LUN-010', barcode: '6001000026', name: 'Fish Fry', categoryId: 'cat-2', description: 'Fried tilapia', sellingPrice: 280, costPrice: 190, unit: 'plate', stock: 12, minStock: 4, reorderLevel: 8, supplierId: 'sup-6', active: true, imageEmoji: '🐟', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-27', sku: 'DIN-001', barcode: '6001000027', name: 'Pilau', categoryId: 'cat-3', description: 'Spiced rice', sellingPrice: 200, costPrice: 130, unit: 'plate', stock: 15, minStock: 4, reorderLevel: 8, supplierId: 'sup-8', active: true, imageEmoji: '🍛', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-28', sku: 'DIN-002', barcode: '6001000028', name: 'Biryani', categoryId: 'cat-3', description: 'Aromatic rice dish', sellingPrice: 250, costPrice: 160, unit: 'plate', stock: 10, minStock: 4, reorderLevel: 8, supplierId: 'sup-8', active: true, imageEmoji: '🍲', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-29', sku: 'SPL-001', barcode: '6001000029', name: 'Chef Special Combo', categoryId: 'cat-10', description: 'Ugali, beef stew, vegetables', sellingPrice: 320, costPrice: 210, unit: 'plate', stock: 5, minStock: 3, reorderLevel: 5, supplierId: 'sup-6', active: true, imageEmoji: '⭐', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-30', sku: 'SPL-002', barcode: '6001000030', name: 'Chicken Combo', categoryId: 'cat-10', description: 'Chicken, rice, salad', sellingPrice: 350, costPrice: 230, unit: 'plate', stock: 4, minStock: 3, reorderLevel: 5, supplierId: 'sup-6', active: true, imageEmoji: '🍗', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-31', sku: 'BRK-006', barcode: '6001000031', name: 'Eggs', categoryId: 'cat-1', description: 'Fried eggs', sellingPrice: 60, costPrice: 35, unit: 'plate', stock: 30, minStock: 6, reorderLevel: 12, supplierId: 'sup-1', active: true, imageEmoji: '🍳', createdAt: '2026-01-10T00:00:00' },
  { id: 'p-32', sku: 'BEV-006', barcode: '6001000032', name: 'Cocoa', categoryId: 'cat-6', description: 'Hot cocoa', sellingPrice: 60, costPrice: 30, unit: 'cup', stock: 55, minStock: 8, reorderLevel: 15, supplierId: 'sup-3', active: true, imageEmoji: '🍫', createdAt: '2026-01-10T00:00:00' },
];

// =====================
// CUSTOMERS
// =====================

export const customers: Customer[] = [
  { id: 'cus-1', name: 'Dr. Ann Waithera', phone: '0711222333', staffNumber: 'KHCW-001', department: 'Emergency', facility: 'Kiryandandu Hospital', type: 'HEALTHCARE_WORKER', status: 'ACTIVE', totalSpent: 12500, lastPurchase: '2026-10-05T12:30:00', outstandingBalance: 0, createdAt: '2026-03-01T00:00:00' },
  { id: 'cus-2', name: 'Nurse Brian Otieno', phone: '0711222334', staffNumber: 'KHCW-045', department: 'Pediatrics', facility: 'Kerugoya Hospital', type: 'HEALTHCARE_WORKER', status: 'ACTIVE', totalSpent: 8700, lastPurchase: '2026-10-05T13:15:00', outstandingBalance: 0, createdAt: '2026-03-05T00:00:00' },
  { id: 'cus-3', name: 'James Muturi', phone: '0711222335', staffNumber: '', department: 'Visitor', facility: 'Kerugoya Hospital', type: 'VISITOR', status: 'ACTIVE', totalSpent: 2400, lastPurchase: '2026-10-04T10:00:00', outstandingBalance: 0, createdAt: '2026-05-10T00:00:00' },
  { id: 'cus-4', name: 'Cleaner Lucy Wambui', phone: '0711222336', staffNumber: 'KHCW-120', department: 'Housekeeping', facility: 'Kiryandandu Hospital', type: 'STAFF', status: 'ACTIVE', totalSpent: 5600, lastPurchase: '2026-10-05T07:45:00', outstandingBalance: 0, createdAt: '2026-04-01T00:00:00' },
  { id: 'cus-5', name: 'Dr. Peter Gikonyo', phone: '0711222337', staffNumber: 'KHCW-003', department: 'Surgery', facility: 'Kerugoya Hospital', type: 'HEALTHCARE_WORKER', status: 'ACTIVE', totalSpent: 18200, lastPurchase: '2026-10-05T14:00:00', outstandingBalance: 0, createdAt: '2026-02-15T00:00:00' },
];

// =====================
// HELPERS FOR SEED DATA
// =====================

function randomDate(daysAgo: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function generateSaleItems(seed: number): { items: SaleItem[]; subtotal: number; total: number; discount: number } {
  const numItems = 1 + (seed % 4);
  const items: SaleItem[] = [];
  let subtotal = 0;
  for (let i = 0; i < numItems; i++) {
    const product = products[(seed * 3 + i * 7) % products.length];
    const qty = 1 + ((seed + i) % 3);
    const lineTotal = product.sellingPrice * qty;
    subtotal += lineTotal;
    items.push({
      id: `si-${seed}-${i}`,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.sellingPrice,
      discount: 0,
      subtotal: lineTotal,
    });
  }
  const discount = seed % 5 === 0 ? Math.floor(subtotal * 0.05) : 0;
  const total = subtotal - discount;
  return { items, subtotal, total, discount };
}

// =====================
// SEED SALES (100+)
// =====================

const seedSales: Sale[] = [];
const seedPayments: PaymentAttempt[] = [];
const seedStockMovements: StockMovement[] = [];
const seedLedger: LedgerEntry[] = [];
const seedAuditLogs: AuditLog[] = [];
const seedExpenses: Expense[] = [];

let ledgerBalance = 0;
for (let i = 0; i < 120; i++) {
  const daysAgo = Math.floor(i / 8);
  const { items, subtotal, total, discount } = generateSaleItems(i + 1);
  const cashier = users[i % 3 === 0 ? 2 : 2]; // mostly cashier
  const date = randomDate(daysAgo, 7 + (i % 12));
  const paymentStatus = i % 20 === 19 ? 'FAILED' : 'CONFIRMED';
  const saleStatus = paymentStatus === 'CONFIRMED' ? 'SALE_COMPLETED' : 'PAYMENT_FAILED';
  const receiptNo = `RCP-${String(1001 + i).padStart(5, '0')}`;
  const orderNo = `ORD-${String(1001 + i).padStart(5, '0')}`;
  const stkRef = `CO${Date.now().toString().slice(-6)}${i}`;

  const sale: Sale = {
    id: `sale-${i + 1}`,
    receiptNo,
    orderNo,
    date,
    cashierId: cashier.id,
    cashierName: cashier.name,
    shiftId: i >= 8 ? null : `shift-${Math.floor(i / 8) + 1}`,
    customerId: i % 3 === 0 ? `cus-${(i % 5) + 1}` : null,
    customerName: i % 3 === 0 ? customers[(i % 5)].name : null,
    customerPhone: i % 3 === 0 ? customers[(i % 5)].phone : null,
    items,
    subtotal,
    discount,
    tax: 0,
    total,
    paymentMethod: 'MPESA_STK',
    paymentStatus,
    saleStatus,
    paymentRef: paymentStatus === 'CONFIRMED' ? stkRef : null,
    createdAt: date,
    completedAt: paymentStatus === 'CONFIRMED' ? date : null,
    refundReason: null,
    refundedById: null,
  };
  seedSales.push(sale);

  if (paymentStatus === 'CONFIRMED') {
    ledgerBalance += total;
    seedLedger.push({
      id: `led-s-${i + 1}`,
      date,
      reference: receiptNo,
      description: `Sale ${receiptNo} - ${items.length} items`,
      debit: 0,
      credit: total,
      balance: ledgerBalance,
      type: 'SALE',
      userId: cashier.id,
      userName: cashier.name,
    });

    for (const item of items) {
      seedStockMovements.push({
        id: `sm-s-${i}-${item.productId}`,
        productId: item.productId,
        productName: item.productName,
        quantity: -item.quantity,
        previousQty: 0,
        newQty: 0,
        type: 'SALE',
        reference: receiptNo,
        userId: cashier.id,
        userName: cashier.name,
        date,
      });
    }

    seedAuditLogs.push({
      id: `aud-s-${i + 1}`,
      userId: cashier.id,
      userName: cashier.name,
      action: 'SALE_CREATED',
      entity: 'Sale',
      entityId: sale.id,
      description: `Sale ${receiptNo} completed - KSh ${total}`,
      ip: '192.168.1.x',
      timestamp: date,
    });
  }
}

// Sort sales newest first
seedSales.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const sales: Sale[] = seedSales;
export const paymentAttempts: PaymentAttempt[] = seedPayments;
export const stockMovements: StockMovement[] = seedStockMovements;
export const ledgerEntries: LedgerEntry[] = seedLedger;
export const auditLogs: AuditLog[] = seedAuditLogs;

// =====================
// SHIFTS
// =====================

export const shifts: Shift[] = [
  { id: 'shift-1', cashierId: 'u-3', cashierName: 'Peter Kamau', date: '2026-10-05', openingFloat: 5000, openingNotes: 'Normal opening', closingNotes: 'All balanced', status: 'CLOSED', openedAt: '2026-10-05T07:00:00', closedAt: '2026-10-05T18:00:00', expectedCash: 8500, actualCash: 8400, difference: -100, totalSales: 12000, transactionCount: 15, successfulPayments: 14, failedPayments: 1, refunds: 0 },
  { id: 'shift-2', cashierId: 'u-3', cashierName: 'Peter Kamau', date: '2026-10-04', openingFloat: 5000, openingNotes: 'Normal opening', closingNotes: 'All good', status: 'CLOSED', openedAt: '2026-10-04T07:00:00', closedAt: '2026-10-04T18:00:00', expectedCash: 9200, actualCash: 9200, difference: 0, totalSales: 14000, transactionCount: 18, successfulPayments: 18, failedPayments: 0, refunds: 0 },
  { id: 'shift-3', cashierId: 'u-3', cashierName: 'Peter Kamau', date: '2026-10-03', openingFloat: 3000, openingNotes: 'Low float', closingNotes: 'Slow day', status: 'CLOSED', openedAt: '2026-10-03T07:00:00', closedAt: '2026-10-03T18:00:00', expectedCash: 6500, actualCash: 6600, difference: 100, totalSales: 9000, transactionCount: 12, successfulPayments: 11, failedPayments: 1, refunds: 0 },
  { id: 'shift-4', cashierId: 'u-2', cashierName: 'Grace Wanjiku', date: '2026-10-02', openingFloat: 5000, openingNotes: 'Manager cover', closingNotes: 'Busy day', status: 'CLOSED', openedAt: '2026-10-02T07:00:00', closedAt: '2026-10-02T18:00:00', expectedCash: 11200, actualCash: 11000, difference: -200, totalSales: 18500, transactionCount: 22, successfulPayments: 21, failedPayments: 1, refunds: 0 },
  { id: 'shift-5', cashierId: 'u-3', cashierName: 'Peter Kamau', date: '2026-10-01', openingFloat: 5000, openingNotes: 'Month start', closingNotes: 'Good day', status: 'CLOSED', openedAt: '2026-10-01T07:00:00', closedAt: '2026-10-01T18:00:00', expectedCash: 7800, actualCash: 7800, difference: 0, totalSales: 10500, transactionCount: 14, successfulPayments: 14, failedPayments: 0, refunds: 0 },
];

// =====================
// PURCHASE ORDERS (20)
// =====================

export const purchaseOrders: PurchaseOrder[] = [];
for (let i = 0; i < 20; i++) {
  const supplier = suppliers[i % suppliers.length];
  const numItems = 1 + (i % 3);
  const items = [];
  let subtotal = 0;
  for (let j = 0; j < numItems; j++) {
    const product = products[(i * 5 + j * 3) % products.length];
    const qty = 10 + (i % 5) * 5;
    const cost = product.costPrice;
    const totalLine = qty * cost;
    subtotal += totalLine;
    items.push({
      id: `poi-${i}-${j}`,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitCost: cost,
      total: totalLine,
    });
  }
  const addCosts = i % 4 === 0 ? 200 : 0;
  const statuses: PurchaseOrder['status'][] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];
  const status = i < 12 ? 'RECEIVED' : statuses[i % statuses.length];
  const paymentStatuses: PurchaseOrder['paymentStatus'][] = ['PENDING', 'PAID', 'PARTIAL', 'CANCELLED'];
  const paymentStatus = i < 8 ? 'PAID' : i < 14 ? 'PENDING' : paymentStatuses[i % paymentStatuses.length];
  const date = randomDate(30 - i, 9);
  purchaseOrders.push({
    id: `po-${i + 1}`,
    poNumber: `PO-${String(101 + i).padStart(4, '0')}`,
    supplierId: supplier.id,
    supplierName: supplier.companyName,
    items,
    subtotal,
    additionalCosts: addCosts,
    total: subtotal + addCosts,
    status,
    expectedDelivery: date,
    createdBy: users[3].name,
    approvedBy: i < 12 ? users[1].name : null,
    supplierInvoiceNo: `INV-${String(201 + i).padStart(4, '0')}`,
    createdAt: date,
    paymentStatus,
  });
}

// =====================
// SUPPLIER PAYMENTS
// =====================

export const supplierPayments: SupplierPayment[] = [];
for (let i = 0; i < 12; i++) {
  const po = purchaseOrders[i];
  supplierPayments.push({
    id: `sp-${i + 1}`,
    supplierId: po.supplierId,
    supplierName: po.supplierName,
    purchaseOrderId: po.id,
    invoiceNo: po.supplierInvoiceNo,
    amount: po.total,
    outstandingAmount: 0,
    paymentRef: `PAY-${String(301 + i).padStart(4, '0')}`,
    date: po.createdAt,
    notes: 'Full payment',
    status: 'PAID',
  });
}
// Add partial/pending
for (let i = 12; i < 18; i++) {
  const po = purchaseOrders[i];
  if (!po) break;
  supplierPayments.push({
    id: `sp-${i + 1}`,
    supplierId: po.supplierId,
    supplierName: po.supplierName,
    purchaseOrderId: po.id,
    invoiceNo: po.supplierInvoiceNo,
    amount: Math.floor(po.total / 2),
    outstandingAmount: Math.ceil(po.total / 2),
    paymentRef: `PAY-${String(301 + i).padStart(4, '0')}`,
    date: po.createdAt,
    notes: 'Partial payment',
    status: 'PARTIAL',
  });
}

// =====================
// EXPENSES
// =====================

const expenseCats: Expense['category'][] = ['Utilities', 'Cleaning', 'Food supplies', 'Transport', 'Repairs', 'Maintenance', 'Stationery', 'Staff welfare', 'Other'];
for (let i = 0; i < 15; i++) {
  const date = randomDate(30 - i * 2, 10);
  const amount = 500 + (i * 350) % 5000;
  seedExpenses.push({
    id: `exp-${i + 1}`,
    description: `${expenseCats[i % expenseCats.length]} expense - October`,
    category: expenseCats[i % expenseCats.length],
    amount,
    date,
    paymentMethod: i % 3 === 0 ? 'CASH' : 'MPESA',
    reference: `EXP-${String(401 + i).padStart(4, '0')}`,
    recordedBy: users[4].name,
    notes: '',
    approvalStatus: amount > 3000 ? 'PENDING' : 'APPROVED',
  });
  ledgerBalance -= amount;
  seedLedger.push({
    id: `led-e-${i + 1}`,
    date,
    reference: `EXP-${String(401 + i).padStart(4, '0')}`,
    description: `Expense: ${expenseCats[i % expenseCats.length]}`,
    debit: amount,
    credit: 0,
    balance: ledgerBalance,
    type: 'EXPENSE',
    userId: users[4].id,
    userName: users[4].name,
  });
}
export const expenses: Expense[] = seedExpenses;

// Add purchase ledger entries
for (let i = 0; i < 12; i++) {
  const po = purchaseOrders[i];
  ledgerBalance -= po.total;
  seedLedger.push({
    id: `led-p-${i + 1}`,
    date: po.createdAt,
    reference: po.poNumber,
    description: `Purchase ${po.poNumber} from ${po.supplierName}`,
    debit: po.total,
    credit: 0,
    balance: ledgerBalance,
    type: 'PURCHASE',
    userId: users[3].id,
    userName: users[3].name,
  });
}

// Sort ledger by date
seedLedger.sort((a, b) => a.date.localeCompare(b.date));
// Recalculate balance
let runningBalance = 0;
for (const entry of seedLedger) {
  runningBalance += entry.credit - entry.debit;
  entry.balance = runningBalance;
}
export const ledgerEntriesFinal: LedgerEntry[] = seedLedger;

// =====================
// NOTIFICATIONS
// =====================

export const notifications: Notification[] = [
  { id: 'n-1', type: 'low_stock', title: 'Low Stock Alert', message: 'Nyama Choma is below reorder level (8 units)', read: false, timestamp: '2026-10-06T08:15:00', entityId: 'p-25' },
  { id: 'n-2', type: 'low_stock', title: 'Low Stock Alert', message: 'Chef Special Combo is below reorder level', read: false, timestamp: '2026-10-06T08:10:00', entityId: 'p-29' },
  { id: 'n-3', type: 'supplier_invoice_due', title: 'Invoice Due', message: 'Mountain Grains Suppliers invoice due in 3 days', read: false, timestamp: '2026-10-06T07:45:00' },
  { id: 'n-4', type: 'payment_confirmed', title: 'Payment Confirmed', message: 'M-Pesa payment of KSh 450 confirmed', read: true, timestamp: '2026-10-06T07:30:00' },
  { id: 'n-5', type: 'stock_received', title: 'Stock Received', message: 'Stock received from Kirinyaga Fresh Foods', read: true, timestamp: '2026-10-05T16:00:00' },
  { id: 'n-6', type: 'shift_open_long', title: 'Shift Duration', message: 'Cashier shift has been open for 11 hours', read: true, timestamp: '2026-10-05T18:00:00' },
];

// =====================
// HELD ORDERS (empty initially)
// =====================

export const heldOrders: HeldOrder[] = [];

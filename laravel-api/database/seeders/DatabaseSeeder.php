<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Shift;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\Expense;
use App\Models\Notification;
use App\Models\LedgerEntry;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Users ---
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@hospital.gov',
            'phone' => '254700000001',
            'password' => Hash::make('admin123'),
            'role' => 'SUPER_ADMIN',
            'status' => 'ACTIVE',
            'avatar_color' => '#dc2626',
        ]);

        $manager = User::create([
            'name' => 'Jane Mwangi',
            'email' => 'manager@hospital.gov',
            'phone' => '254700000002',
            'password' => Hash::make('manager123'),
            'role' => 'MANAGER',
            'status' => 'ACTIVE',
            'avatar_color' => '#2563eb',
        ]);

        $cashier = User::create([
            'name' => 'John Kamau',
            'email' => 'cashier@hospital.gov',
            'phone' => '254700000003',
            'password' => Hash::make('cashier123'),
            'role' => 'CASHIER',
            'status' => 'ACTIVE',
            'avatar_color' => '#16a34a',
        ]);

        $storekeeper = User::create([
            'name' => 'Peter Otieno',
            'email' => 'store@hospital.gov',
            'phone' => '254700000004',
            'password' => Hash::make('store123'),
            'role' => 'STOREKEEPER',
            'status' => 'ACTIVE',
            'avatar_color' => '#f59e0b',
        ]);

        $accountant = User::create([
            'name' => 'Mary Wanjiru',
            'email' => 'accounts@hospital.gov',
            'phone' => '254700000005',
            'password' => Hash::make('acc123'),
            'role' => 'ACCOUNTANT',
            'status' => 'ACTIVE',
            'avatar_color' => '#7c3aed',
        ]);

        // --- Categories ---
        $food = Category::create(['name' => 'Food & Beverages', 'icon' => '🍽️', 'color' => '#f59e0b', 'description' => 'Meals, snacks, drinks']);
        $pharma = Category::create(['name' => 'Pharmaceuticals', 'icon' => '💊', 'color' => '#dc2626', 'description' => 'Over-the-counter medicines']);
        $supplies = Category::create(['name' => 'Medical Supplies', 'icon' => '🩹', 'color' => '#2563eb', 'description' => 'Gloves, syringes, dressings']);
        $stationery = Category::create(['name' => 'Stationery', 'icon' => '📝', 'color' => '#16a34a', 'description' => 'Office supplies']);
        $cleaning = Category::create(['name' => 'Cleaning Supplies', 'icon' => '🧹', 'color' => '#0891b2', 'description' => 'Detergents, disinfectants']);

        // --- Suppliers ---
        $supplier1 = Supplier::create([
            'company_name' => 'MediSource Ltd',
            'contact_person' => 'David Kiprop',
            'phone' => '254712345678',
            'email' => 'orders@medisource.co.ke',
            'address' => 'Industrial Area, Nairobi',
            'kra_pin' => 'A012345678B',
            'payment_terms' => 'Net 30',
            'opening_balance' => 150000,
            'status' => 'ACTIVE',
        ]);

        $supplier2 = Supplier::create([
            'company_name' => 'Blue Nile Foods',
            'contact_person' => 'Sarah Hassan',
            'phone' => '254723456789',
            'email' => 'info@bluenile.co.ke',
            'address' => 'Mombasa Road, Nairobi',
            'payment_terms' => 'Net 14',
            'opening_balance' => 45000,
            'status' => 'ACTIVE',
        ]);

        $supplier3 = Supplier::create([
            'company_name' => 'CleanPro Distributors',
            'contact_person' => 'James Maina',
            'phone' => '254734567890',
            'email' => 'sales@cleanpro.co.ke',
            'address' => 'Ngara, Nairobi',
            'payment_terms' => 'Net 30',
            'opening_balance' => 20000,
            'status' => 'ACTIVE',
        ]);

        // --- Products ---
        $products = [
            ['sku' => 'FOOD-001', 'name' => 'Chapati & Beans', 'category_id' => $food->id, 'selling_price' => 80, 'cost_price' => 45, 'stock' => 50, 'min_stock' => 10, 'reorder_level' => 20, 'supplier_id' => $supplier2->id, 'image_emoji' => '🌯'],
            ['sku' => 'FOOD-002', 'name' => 'Rice & Stew', 'category_id' => $food->id, 'selling_price' => 120, 'cost_price' => 70, 'stock' => 40, 'min_stock' => 10, 'reorder_level' => 15, 'supplier_id' => $supplier2->id, 'image_emoji' => '🍚'],
            ['sku' => 'FOOD-003', 'name' => 'Tea (500ml)', 'category_id' => $food->id, 'selling_price' => 30, 'cost_price' => 15, 'stock' => 100, 'min_stock' => 20, 'reorder_level' => 30, 'supplier_id' => $supplier2->id, 'image_emoji' => '🫖'],
            ['sku' => 'FOOD-004', 'name' => 'Mandazi', 'category_id' => $food->id, 'selling_price' => 25, 'cost_price' => 12, 'stock' => 3, 'min_stock' => 15, 'reorder_level' => 25, 'supplier_id' => $supplier2->id, 'image_emoji' => '🍩'],
            ['sku' => 'PHARM-001', 'name' => 'Paracetamol 500mg (Strip)', 'category_id' => $pharma->id, 'selling_price' => 150, 'cost_price' => 90, 'stock' => 200, 'min_stock' => 50, 'reorder_level' => 80, 'supplier_id' => $supplier1->id, 'image_emoji' => '💊'],
            ['sku' => 'PHARM-002', 'name' => 'Amoxicillin 250mg (Strip)', 'category_id' => $pharma->id, 'selling_price' => 300, 'cost_price' => 180, 'stock' => 80, 'min_stock' => 20, 'reorder_level' => 40, 'supplier_id' => $supplier1->id, 'image_emoji' => '💊'],
            ['sku' => 'PHARM-003', 'name' => 'ORS Sachet', 'category_id' => $pharma->id, 'selling_price' => 50, 'cost_price' => 25, 'stock' => 0, 'min_stock' => 30, 'reorder_level' => 50, 'supplier_id' => $supplier1->id, 'image_emoji' => '💉'],
            ['sku' => 'SUP-001', 'name' => 'Surgical Gloves (Box)', 'category_id' => $supplies->id, 'selling_price' => 800, 'cost_price' => 550, 'stock' => 25, 'min_stock' => 10, 'reorder_level' => 15, 'supplier_id' => $supplier1->id, 'image_emoji' => '🧤'],
            ['sku' => 'SUP-002', 'name' => 'Syringes 5ml (Pack)', 'category_id' => $supplies->id, 'selling_price' => 200, 'cost_price' => 120, 'stock' => 60, 'min_stock' => 20, 'reorder_level' => 30, 'supplier_id' => $supplier1->id, 'image_emoji' => '💉'],
            ['sku' => 'SUP-003', 'name' => 'Cotton Wool 100g', 'category_id' => $supplies->id, 'selling_price' => 80, 'cost_price' => 45, 'stock' => 40, 'min_stock' => 15, 'reorder_level' => 25, 'supplier_id' => $supplier1->id, 'image_emoji' => '🧶'],
            ['sku' => 'STAT-001', 'name' => 'A4 Paper (Rim)', 'category_id' => $stationery->id, 'selling_price' => 350, 'cost_price' => 250, 'stock' => 30, 'min_stock' => 10, 'reorder_level' => 15, 'supplier_id' => null, 'image_emoji' => '📄'],
            ['sku' => 'STAT-002', 'name' => 'Ballpoint Pen', 'category_id' => $stationery->id, 'selling_price' => 25, 'cost_price' => 10, 'stock' => 200, 'min_stock' => 50, 'reorder_level' => 100, 'supplier_id' => null, 'image_emoji' => '🖊️'],
            ['sku' => 'CLN-001', 'name' => 'Dettol 1L', 'category_id' => $cleaning->id, 'selling_price' => 450, 'cost_price' => 300, 'stock' => 35, 'min_stock' => 10, 'reorder_level' => 20, 'supplier_id' => $supplier3->id, 'image_emoji' => '🧴'],
            ['sku' => 'CLN-002', 'name' => 'Hand Sanitizer 500ml', 'category_id' => $cleaning->id, 'selling_price' => 300, 'cost_price' => 180, 'stock' => 55, 'min_stock' => 15, 'reorder_level' => 25, 'supplier_id' => $supplier3->id, 'image_emoji' => '🧼'],
        ];

        $productModels = [];
        foreach ($products as $p) {
            $productModels[$p['sku']] = Product::create(array_merge($p, ['unit' => 'pc', 'active' => true]));

            StockMovement::create([
                'product_id' => $productModels[$p['sku']]->id,
                'product_name' => $p['name'],
                'quantity' => $p['stock'],
                'previous_qty' => 0,
                'new_qty' => $p['stock'],
                'type' => 'OPENING_BALANCE',
                'reference' => 'Initial stock',
                'user_id' => $storekeeper->id,
                'user_name' => $storekeeper->name,
                'date' => now()->subDays(30),
            ]);
        }

        // --- Customers ---
        $customers = [
            ['name' => 'Dr. Alice Kariuki', 'phone' => '254711111111', 'staff_number' => 'STAFF-001', 'department' => 'Surgery', 'facility' => 'Main Hospital', 'type' => 'HEALTHCARE_WORKER'],
            ['name' => 'Nurse Brian Ochieng', 'phone' => '254722222222', 'staff_number' => 'STAFF-002', 'department' => 'Emergency', 'facility' => 'Main Hospital', 'type' => 'HEALTHCARE_WORKER'],
            ['name' => 'Visitor Cynthia Wangari', 'phone' => '254733333333', 'staff_number' => null, 'department' => null, 'facility' => null, 'type' => 'VISITOR'],
            ['name' => 'Dr. Daniel Mutiso', 'phone' => '254744444444', 'staff_number' => 'STAFF-003', 'department' => 'Pediatrics', 'facility' => 'Main Hospital', 'type' => 'HEALTHCARE_WORKER'],
            ['name' => 'Staff Esther Njoki', 'phone' => '254755555555', 'staff_number' => 'STAFF-004', 'department' => 'Administration', 'facility' => 'Main Hospital', 'type' => 'STAFF'],
        ];

        foreach ($customers as $c) {
            Customer::create($c);
        }

        // --- Shift ---
        $shift = Shift::create([
            'cashier_id' => $cashier->id,
            'cashier_name' => $cashier->name,
            'date' => today(),
            'opening_float' => 5000,
            'status' => 'OPEN',
            'opened_at' => now()->startOfDay(),
            'expected_cash' => 5000,
        ]);

        // --- Sample Sales ---
        $sampleSales = [
            ['items' => [['sku' => 'FOOD-001', 'qty' => 2], ['sku' => 'FOOD-003', 'qty' => 1]], 'customer_name' => 'Dr. Alice Kariuki', 'customer_phone' => '254711111111'],
            ['items' => [['sku' => 'PHARM-001', 'qty' => 1], ['sku' => 'SUP-003', 'qty' => 2]], 'customer_name' => 'Nurse Brian Ochieng', 'customer_phone' => '254722222222'],
            ['items' => [['sku' => 'FOOD-002', 'qty' => 1], ['sku' => 'FOOD-004', 'qty' => 3]], 'customer_name' => null, 'customer_phone' => null],
            ['items' => [['sku' => 'CLN-002', 'qty' => 1], ['sku' => 'STAT-002', 'qty' => 5]], 'customer_name' => 'Staff Esther Njoki', 'customer_phone' => '254755555555'],
            ['items' => [['sku' => 'SUP-001', 'qty' => 1]], 'customer_name' => 'Dr. Daniel Mutiso', 'customer_phone' => '254744444444'],
        ];

        $balance = 0;
        foreach ($sampleSales as $i => $ss) {
            $subtotal = 0;
            $items = [];
            foreach ($ss['items'] as $item) {
                $product = $productModels[$item['sku']];
                $lineSubtotal = $product->selling_price * $item['qty'];
                $subtotal += $lineSubtotal;
                $items[] = ['product' => $product, 'qty' => $item['qty'], 'subtotal' => $lineSubtotal];
            }

            $receiptNo = 'RCP-' . date('Ymd') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
            $saleDate = now()->subHours(5 - $i);

            $sale = Sale::create([
                'receipt_no' => $receiptNo,
                'order_no' => 'ORD-' . $saleDate->format('YmdHis'),
                'date' => $saleDate,
                'cashier_id' => $cashier->id,
                'cashier_name' => $cashier->name,
                'shift_id' => $shift->id,
                'customer_name' => $ss['customer_name'],
                'customer_phone' => $ss['customer_phone'],
                'subtotal' => $subtotal,
                'discount' => 0,
                'tax' => 0,
                'total' => $subtotal,
                'payment_method' => 'MPESA_STK',
                'payment_status' => 'CONFIRMED',
                'sale_status' => 'SALE_COMPLETED',
                'payment_ref' => 'QFG' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'completed_at' => $saleDate,
            ]);

            foreach ($items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'quantity' => $item['qty'],
                    'unit_price' => $item['product']->selling_price,
                    'discount' => 0,
                    'subtotal' => $item['subtotal'],
                ]);

                $product = $item['product'];
                $prev = $product->stock;
                $product->decrement('stock', $item['qty']);
                StockMovement::create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => -$item['qty'],
                    'previous_qty' => $prev,
                    'new_qty' => $prev - $item['qty'],
                    'type' => 'SALE',
                    'reference' => $receiptNo,
                    'user_id' => $cashier->id,
                    'user_name' => $cashier->name,
                    'date' => $saleDate,
                ]);
            }

            $shift->increment('total_sales', $subtotal);
            $shift->increment('transaction_count');
            $shift->increment('expected_cash', $subtotal);

            $balance += $subtotal;
            LedgerEntry::create([
                'date' => $saleDate,
                'reference' => $receiptNo,
                'description' => "Sale {$receiptNo}",
                'debit' => $subtotal,
                'credit' => 0,
                'balance' => $balance,
                'type' => 'SALE',
                'user_id' => $cashier->id,
                'user_name' => $cashier->name,
            ]);
        }

        // --- Expenses ---
        $expenseData = [
            ['description' => 'Electricity bill', 'category' => 'Utilities', 'amount' => 15000, 'date' => now()->subDays(5)],
            ['description' => 'Dishwashing liquid', 'category' => 'Cleaning', 'amount' => 2500, 'date' => now()->subDays(3)],
            ['description' => 'Fuel for delivery van', 'category' => 'Transport', 'amount' => 5000, 'date' => now()->subDays(2)],
            ['description' => 'Staff lunch allowance', 'category' => 'Staff welfare', 'amount' => 8000, 'date' => now()->subDay()],
        ];

        foreach ($expenseData as $e) {
            $exp = Expense::create(array_merge($e, [
                'payment_method' => 'CASH',
                'reference' => 'EXP-' . $e['date']->format('YmdHis'),
                'recorded_by' => $accountant->id,
                'recorded_by_name' => $accountant->name,
            ]));

            $balance -= $e['amount'];
            LedgerEntry::create([
                'date' => $e['date'],
                'reference' => $exp->reference,
                'description' => "Expense: {$e['description']}",
                'debit' => 0,
                'credit' => $e['amount'],
                'balance' => $balance,
                'type' => 'EXPENSE',
                'user_id' => $accountant->id,
                'user_name' => $accountant->name,
            ]);
        }

        // --- Notifications ---
        Notification::create(['type' => 'LOW_STOCK', 'title' => 'Low Stock Alert', 'message' => 'Mandazi is below minimum stock level (3/15)', 'timestamp' => now()->subHour()]);
        Notification::create(['type' => 'OUT_OF_STOCK', 'title' => 'Out of Stock', 'message' => 'ORS Sachet is out of stock', 'timestamp' => now()->subHours(2)]);
        Notification::create(['type' => 'PAYMENT_FAILED', 'title' => 'Payment Failed', 'message' => 'M-PESA payment for RCP-20261006-0004 failed', 'timestamp' => now()->subHours(3)]);

        // --- Audit Log ---
        AuditLog::create(['user_id' => $admin->id, 'user_name' => $admin->name, 'action' => 'SYSTEM_INIT', 'entity' => 'System', 'description' => 'System initialized with seed data', 'timestamp' => now()->subDays(30)]);
        AuditLog::create(['user_id' => $cashier->id, 'user_name' => $cashier->name, 'action' => 'OPEN_SHIFT', 'entity' => 'Shift', 'description' => 'Opened shift with float KES 5000', 'timestamp' => now()->startOfDay()]);
    }
}

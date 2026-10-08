<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Expense;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Shift;
use App\Models\StockMovement;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $dateFrom = $request->date_from ?? now()->startOfDay();
        $dateTo = $request->date_to ?? now();

        $completedSales = Sale::where('sale_status', 'SALE_COMPLETED')
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->with('items')
            ->get();

        $totalSales = $completedSales->sum('total');
        $transactionCount = $completedSales->count();
        $avgTransaction = $transactionCount > 0 ? (int) round($totalSales / $transactionCount) : 0;

        $todaySales = Sale::where('sale_status', 'SALE_COMPLETED')
            ->whereDate('date', today())
            ->sum('total');

        $pendingPayments = Sale::whereIn('sale_status', ['ORDER_CREATED', 'PAYMENT_PENDING', 'STK_REQUESTED', 'PAYMENT_PROCESSING'])
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->count();

        $failedPayments = Sale::where('payment_status', 'FAILED')
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->count();

        $lowStockCount = Product::whereColumn('stock', '<=', 'min_stock')->count();
        $outOfStockCount = Product::where('stock', 0)->count();

        $totalProducts = Product::where('active', true)->count();
        $totalCustomers = Customer::count();
        $activeSuppliers = Supplier::where('status', 'ACTIVE')->count();
        $totalExpenses = Expense::whereBetween('date', [$dateFrom, $dateTo])->sum('amount');

        $cogs = $completedSales->sum(function ($sale) {
            return $sale->items->sum(function ($item) {
                $product = Product::find($item->product_id);
                return ($product?->cost_price ?? 0) * $item->quantity;
            });
        });

        $grossProfit = $totalSales - $cogs;
        $netProfit = $grossProfit - $totalExpenses;

        $currentBalance = LedgerEntry::orderBy('date', 'desc')->value('balance') ?? 0;

        $recentSales = Sale::with('items', 'cashier', 'customer')
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        $topProducts = $this->getTopProducts($completedSales, 5);

        $salesByCategory = $this->getSalesByCategory($completedSales);

        return response()->json([
            'total_sales' => $totalSales,
            'today_sales' => $todaySales,
            'transaction_count' => $transactionCount,
            'avg_transaction' => $avgTransaction,
            'pending_payments' => $pendingPayments,
            'failed_payments' => $failedPayments,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'total_products' => $totalProducts,
            'total_customers' => $totalCustomers,
            'active_suppliers' => $activeSuppliers,
            'total_expenses' => $totalExpenses,
            'gross_profit' => $grossProfit,
            'net_profit' => $netProfit,
            'current_balance' => $currentBalance,
            'recent_sales' => $recentSales,
            'top_products' => $topProducts,
            'sales_by_category' => $salesByCategory,
        ]);
    }

    private function getTopProducts($sales, int $limit)
    {
        $map = [];
        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                if (!isset($map[$item->product_id])) {
                    $map[$item->product_id] = [
                        'name' => $item->product_name,
                        'quantity' => 0,
                        'revenue' => 0,
                    ];
                }
                $map[$item->product_id]['quantity'] += $item->quantity;
                $map[$item->product_id]['revenue'] += $item->subtotal;
            }
        }
        return collect(array_values($map))
            ->sortByDesc('revenue')
            ->take($limit)
            ->values()
            ->all();
    }

    private function getSalesByCategory($sales)
    {
        $map = [];
        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                $product = Product::with('category')->find($item->product_id);
                $catName = $product?->category?->name ?? 'Uncategorized';
                if (!isset($map[$catName])) {
                    $map[$catName] = 0;
                }
                $map[$catName] += $item->subtotal;
            }
        }
        return $map;
    }
}

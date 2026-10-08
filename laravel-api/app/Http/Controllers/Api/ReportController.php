<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Expense;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Shift;
use App\Models\StockMovement;
use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $dateFrom = $validated['date_from'] ?? now()->startOfMonth();
        $dateTo = $validated['date_to'] ?? now();

        return match ($validated['report_type']) {
            'daily_sales' => $this->dailySales($dateFrom, $dateTo),
            'weekly_sales' => $this->weeklySales($dateFrom, $dateTo),
            'monthly_sales' => $this->monthlySales($dateFrom, $dateTo),
            'sales_by_product' => $this->salesByProduct($dateFrom, $dateTo),
            'sales_by_category' => $this->salesByCategory($dateFrom, $dateTo),
            'sales_by_cashier' => $this->salesByCashier($dateFrom, $dateTo),
            'payment_report' => $this->paymentReport($dateFrom, $dateTo),
            'refund_report' => $this->refundReport($dateFrom, $dateTo),
            'inventory_valuation' => $this->inventoryValuation(),
            'stock_movement' => $this->stockMovement($dateFrom, $dateTo),
            'low_stock' => $this->lowStock(),
            'purchase_report' => $this->purchaseReport($dateFrom, $dateTo),
            'supplier_payables' => $this->supplierPayables(),
            'expense_report' => $this->expenseReport($dateFrom, $dateTo),
            'profit_loss' => $this->profitLoss($dateFrom, $dateTo),
            'cashier_shift' => $this->cashierShift($dateFrom, $dateTo),
            'audit_report' => $this->auditReport($dateFrom, $dateTo),
            default => response()->json(['message' => 'Unknown report type'], 422),
        };
    }

    private function dailySales($from, $to)
    {
        $sales = Sale::where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = now()->subDays($i);
            $dayStr = $d->format('Y-m-d');
            $value = $sales->filter(fn($s) => $s->date->format('Y-m-d') === $dayStr)->sum('total');
            $days[] = ['label' => $d->format('D j'), 'value' => $value];
        }
        return response()->json(['type' => 'bar', 'data' => $days, 'total' => array_sum(array_column($days, 'value'))]);
    }

    private function weeklySales($from, $to)
    {
        $sales = Sale::where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $weeks = [];
        for ($i = 3; $i >= 0; $i--) {
            $start = now()->subWeeks($i)->startOfWeek();
            $end = now()->subWeeks($i)->endOfWeek();
            $value = $sales->filter(fn($s) => $s->date >= $start && $s->date <= $end)->sum('total');
            $weeks[] = ['label' => 'W' . (4 - $i), 'value' => $value];
        }
        return response()->json(['type' => 'bar', 'data' => $weeks, 'total' => array_sum(array_column($weeks, 'value'))]);
    }

    private function monthlySales($from, $to)
    {
        $sales = Sale::where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = now()->subMonths($i);
            $monthStr = $d->format('Y-m');
            $value = $sales->filter(fn($s) => $s->date->format('Y-m') === $monthStr)->sum('total');
            $months[] = ['label' => $d->format('M'), 'value' => $value];
        }
        return response()->json(['type' => 'bar', 'data' => $months, 'total' => array_sum(array_column($months, 'value'))]);
    }

    private function salesByProduct($from, $to)
    {
        $sales = Sale::with('items')->where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $map = [];
        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                if (!isset($map[$item->product_id])) {
                    $map[$item->product_id] = ['name' => $item->product_name, 'count' => 0, 'revenue' => 0];
                }
                $map[$item->product_id]['count'] += $item->quantity;
                $map[$item->product_id]['revenue'] += $item->subtotal;
            }
        }
        $rows = collect(array_values($map))->sortByDesc('revenue')->take(20)->values();
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Product', 'Units Sold', 'Revenue'], 'total' => $rows->sum('revenue')]);
    }

    private function salesByCategory($from, $to)
    {
        $sales = Sale::with('items.product.category')->where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $categories = Category::all();
        $data = $categories->map(function ($cat) use ($sales) {
            $value = $sales->sum(function ($sale) use ($cat) {
                return $sale->items->filter(fn($item) => $item->product?->category_id === $cat->id)->sum('subtotal');
            });
            return ['label' => $cat->name, 'value' => $value, 'color' => $cat->color];
        })->filter(fn($d) => $d['value'] > 0)->sortByDesc('value')->values();
        return response()->json(['type' => 'donut', 'data' => $data, 'total' => $data->sum('value')]);
    }

    private function salesByCashier($from, $to)
    {
        $sales = Sale::where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $map = [];
        foreach ($sales as $sale) {
            if (!isset($map[$sale->cashier_id])) {
                $map[$sale->cashier_id] = ['name' => $sale->cashier_name, 'count' => 0, 'revenue' => 0];
            }
            $map[$sale->cashier_id]['count']++;
            $map[$sale->cashier_id]['revenue'] += $sale->total;
        }
        $rows = collect(array_values($map))->sortByDesc('revenue')->values();
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Cashier', 'Transactions', 'Revenue'], 'total' => $rows->sum('revenue')]);
    }

    private function paymentReport($from, $to)
    {
        $confirmed = Sale::where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->count();
        $failed = Sale::where('payment_status', 'FAILED')->whereBetween('date', [$from, $to])->count();
        $totalCollected = Sale::where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->sum('total');
        $successRate = ($confirmed + $failed) > 0 ? round(($confirmed / ($confirmed + $failed)) * 100, 1) : 100;
        return response()->json(['type' => 'summary', 'cards' => [
            ['label' => 'Confirmed Payments', 'value' => (string) $confirmed, 'color' => 'green'],
            ['label' => 'Failed Payments', 'value' => (string) $failed, 'color' => 'red'],
            ['label' => 'Total Collected', 'value' => 'KES ' . number_format($totalCollected), 'color' => 'green'],
            ['label' => 'Success Rate', 'value' => $successRate . '%', 'color' => 'blue'],
        ]]);
    }

    private function refundReport($from, $to)
    {
        $refunded = Sale::where('sale_status', 'REFUNDED')->whereBetween('date', [$from, $to])->get();
        $rows = $refunded->map(fn($s) => ['receipt_no' => $s->receipt_no, 'date' => $s->date->format('Y-m-d'), 'amount' => $s->total, 'reason' => $s->refund_reason ?? '—']);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Receipt', 'Date', 'Amount', 'Reason'], 'total' => $refunded->sum('total')]);
    }

    private function inventoryValuation()
    {
        $products = Product::all();
        $rows = $products->map(fn($p) => ['name' => $p->name, 'stock' => $p->stock, 'cost' => $p->cost_price, 'value' => $p->stock * $p->cost_price])->sortByDesc('value')->values();
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Product', 'Stock', 'Unit Cost', 'Value'], 'total' => $rows->sum('value')]);
    }

    private function stockMovement($from, $to)
    {
        $movements = StockMovement::with('product')->whereBetween('date', [$from, $to])->orderBy('date', 'desc')->limit(30)->get();
        $rows = $movements->map(fn($m) => ['product' => $m->product_name, 'qty' => $m->quantity, 'type' => $m->type, 'date' => $m->date->format('Y-m-d'), 'user' => $m->user_name ?? '—']);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Product', 'Qty', 'Type', 'Date', 'User'], 'total' => $movements->count()]);
    }

    private function lowStock()
    {
        $products = Product::whereColumn('stock', '<=', 'min_stock')->get();
        $rows = $products->map(fn($p) => ['name' => $p->name, 'stock' => $p->stock, 'min' => $p->min_stock, 'reorder' => $p->reorder_level, 'status' => $p->stock_status]);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Product', 'Stock', 'Min', 'Reorder', 'Status'], 'total' => $products->count()]);
    }

    private function purchaseReport($from, $to)
    {
        $pos = PurchaseOrder::with('supplier')->whereBetween('created_at', [$from, $to])->orderBy('created_at', 'desc')->limit(20)->get();
        $rows = $pos->map(fn($po) => ['po' => $po->po_number, 'supplier' => $po->supplier_name, 'date' => $po->created_at->format('Y-m-d'), 'total' => $po->total, 'status' => $po->payment_status]);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['PO', 'Supplier', 'Date', 'Total', 'Payment'], 'total' => $pos->sum('total')]);
    }

    private function supplierPayables()
    {
        $suppliers = Supplier::all();
        $rows = $suppliers->map(fn($s) => ['name' => $s->company_name, 'opening' => $s->opening_balance, 'terms' => $s->payment_terms, 'status' => $s->status]);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Supplier', 'Opening Balance', 'Terms', 'Status'], 'total' => $suppliers->sum('opening_balance')]);
    }

    private function expenseReport($from, $to)
    {
        $expenses = Expense::whereBetween('date', [$from, $to])->orderBy('date', 'desc')->limit(20)->get();
        $rows = $expenses->map(fn($e) => ['date' => $e->date->format('Y-m-d'), 'desc' => $e->description, 'cat' => $e->category, 'amount' => $e->amount]);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Date', 'Description', 'Category', 'Amount'], 'total' => $expenses->sum('amount')]);
    }

    private function profitLoss($from, $to)
    {
        $sales = Sale::with('items')->where('sale_status', 'SALE_COMPLETED')->whereBetween('date', [$from, $to])->get();
        $revenue = $sales->sum('total');
        $cogs = $sales->sum(function ($sale) {
            return $sale->items->sum(function ($item) {
                $product = Product::find($item->product_id);
                return ($product?->cost_price ?? 0) * $item->quantity;
            });
        });
        $grossProfit = $revenue - $cogs;
        $totalExpenses = Expense::whereBetween('date', [$from, $to])->sum('amount');
        $netProfit = $grossProfit - $totalExpenses;
        $margin = $revenue > 0 ? round(($netProfit / $revenue) * 100, 1) : 0;

        return response()->json(['type' => 'summary', 'cards' => [
            ['label' => 'Revenue', 'value' => 'KES ' . number_format($revenue), 'color' => 'green'],
            ['label' => 'COGS', 'value' => 'KES ' . number_format($cogs), 'color' => 'red'],
            ['label' => 'Gross Profit', 'value' => 'KES ' . number_format($grossProfit), 'color' => 'blue'],
            ['label' => 'Expenses', 'value' => 'KES ' . number_format($totalExpenses), 'color' => 'orange'],
            ['label' => 'Net Profit', 'value' => 'KES ' . number_format($netProfit), 'color' => $netProfit >= 0 ? 'green' : 'red'],
            ['label' => 'Margin', 'value' => $margin . '%', 'color' => 'blue'],
        ]]);
    }

    private function cashierShift($from, $to)
    {
        $shifts = Shift::whereBetween('date', [$from, $to])->orderBy('date', 'desc')->get();
        $rows = $shifts->map(fn($s) => ['cashier' => $s->cashier_name, 'date' => $s->date->format('Y-m-d'), 'float' => $s->opening_float, 'sales' => $s->total_sales, 'expected' => $s->expected_cash, 'actual' => $s->actual_cash, 'diff' => $s->difference]);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['Cashier', 'Date', 'Float', 'Sales', 'Expected', 'Actual', 'Diff'], 'total' => $shifts->sum('total_sales')]);
    }

    private function auditReport($from, $to)
    {
        $logs = AuditLog::whereBetween('timestamp', [$from, $to])->orderBy('timestamp', 'desc')->limit(30)->get();
        $rows = $logs->map(fn($a) => ['user' => $a->user_name ?? '—', 'action' => $a->action, 'desc' => $a->description, 'date' => $a->timestamp->format('Y-m-d H:i')]);
        return response()->json(['type' => 'table', 'rows' => $rows, 'columns' => ['User', 'Action', 'Description', 'Date'], 'total' => $logs->count()]);
    }
}

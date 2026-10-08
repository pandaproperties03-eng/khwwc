<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth (public)
Route::post('/auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

// Co-op Bank webhook (public, verified by signature)
Route::post('/webhooks/coop-bank', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'coopBankCallback']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/auth/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::put('/auth/profile', [\App\Http\Controllers\Api\AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [\App\Http\Controllers\Api\AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);

    // Users
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    Route::patch('/users/{user}/toggle-status', [\App\Http\Controllers\Api\UserController::class, 'toggleStatus']);

    // Categories
    Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class);

    // Products
    Route::apiResource('products', \App\Http\Controllers\Api\ProductController::class);
    Route::get('/products/low-stock/list', [\App\Http\Controllers\Api\ProductController::class, 'index']);

    // Suppliers
    Route::apiResource('suppliers', \App\Http\Controllers\Api\SupplierController::class);

    // Customers
    Route::apiResource('customers', \App\Http\Controllers\Api\CustomerController::class);

    // Sales
    Route::apiResource('sales', \App\Http\Controllers\Api\SaleController::class);
    Route::post('/sales/{sale}/initiate-payment', [\App\Http\Controllers\Api\SaleController::class, 'initiatePayment']);
    Route::get('/sales/{sale}/payment-status', [\App\Http\Controllers\Api\SaleController::class, 'checkPaymentStatus']);
    Route::post('/sales/{sale}/confirm-payment', [\App\Http\Controllers\Api\SaleController::class, 'confirmPayment']);
    Route::post('/sales/{sale}/refund', [\App\Http\Controllers\Api\SaleController::class, 'refund']);
    Route::post('/sales/{sale}/cancel', [\App\Http\Controllers\Api\SaleController::class, 'cancel']);

    // Shifts
    Route::get('/shifts', [\App\Http\Controllers\Api\ShiftController::class, 'index']);
    Route::get('/shifts/{shift}', [\App\Http\Controllers\Api\ShiftController::class, 'show']);
    Route::post('/shifts/open', [\App\Http\Controllers\Api\ShiftController::class, 'open']);
    Route::post('/shifts/{shift}/close', [\App\Http\Controllers\Api\ShiftController::class, 'close']);
    Route::get('/shifts/current', [\App\Http\Controllers\Api\ShiftController::class, 'current']);

    // Purchase Orders
    Route::apiResource('purchase-orders', \App\Http\Controllers\Api\PurchaseOrderController::class);
    Route::post('/purchase-orders/{purchaseOrder}/approve', [\App\Http\Controllers\Api\PurchaseOrderController::class, 'approve']);
    Route::post('/purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\Api\PurchaseOrderController::class, 'receive']);
    Route::post('/purchase-orders/{purchaseOrder}/cancel', [\App\Http\Controllers\Api\PurchaseOrderController::class, 'cancel']);
    Route::post('/purchase-orders/{purchaseOrder}/pay', [\App\Http\Controllers\Api\PurchaseOrderController::class, 'paySupplier']);

    // Expenses
    Route::apiResource('expenses', \App\Http\Controllers\Api\ExpenseController::class);

    // Inventory
    Route::get('/inventory/movements', [\App\Http\Controllers\Api\InventoryController::class, 'index']);
    Route::post('/inventory/adjust', [\App\Http\Controllers\Api\InventoryController::class, 'adjust']);
    Route::get('/inventory/valuation', [\App\Http\Controllers\Api\InventoryController::class, 'valuation']);
    Route::get('/inventory/low-stock', [\App\Http\Controllers\Api\InventoryController::class, 'lowStock']);

    // Ledger
    Route::get('/ledger', [\App\Http\Controllers\Api\LedgerController::class, 'index']);
    Route::get('/ledger/summary', [\App\Http\Controllers\Api\LedgerController::class, 'summary']);

    // Audit Logs
    Route::get('/audit-logs', [\App\Http\Controllers\Api\AuditLogController::class, 'index']);
    Route::get('/audit-logs/{auditLog}', [\App\Http\Controllers\Api\AuditLogController::class, 'show']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markRead']);
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{notification}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);

    // Reports
    Route::post('/reports/generate', [\App\Http\Controllers\Api\ReportController::class, 'generate']);
});

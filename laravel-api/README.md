# Hospital Canteen POS — Laravel 12 API

A complete REST API backend for a hospital canteen Point of Sale system with Co-op Bank M-PESA STK Push integration.

## Quick Start

```bash
cd laravel-api
composer install
cp .env.example .env
php artisan key:generate

# Configure your database in .env (MySQL recommended)
# DB_DATABASE=hospital_canteen_pos

php artisan migrate
php artisan db:seed
php artisan serve
```

The API will be available at `http://localhost:8000/api`.

## Default Login Credentials

| Role          | Email                  | Password     |
|---------------|------------------------|--------------|
| Super Admin   | admin@hospital.gov     | admin123     |
| Manager       | manager@hospital.gov   | manager123   |
| Cashier       | cashier@hospital.gov   | cashier123   |
| Storekeeper   | store@hospital.gov     | store123     |
| Accountant    | accounts@hospital.gov  | acc123       |

## Authentication

The API uses Laravel Sanctum (bearer tokens). All routes except `/auth/login` and the webhook require a valid token.

```bash
# Login to get a token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.gov","password":"admin123"}'

# Use the token for subsequent requests
curl http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

## Roles & Permissions

| Role          | Key Capabilities |
|---------------|-----------------|
| SUPER_ADMIN   | Everything (`*`) |
| MANAGER       | All operations except user management |
| CASHIER       | POS, sales, payments, shifts |
| STOREKEEPER   | Products, inventory, purchases, suppliers |
| ACCOUNTANT    | Ledger, expenses, reports, payments |
| SUPERVISOR    | Sales, payments, shifts, reports |

Apply permission middleware in routes:
```php
Route::middleware('permission:reports.export')->get('/reports/export', ...);
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login, returns bearer token |
| POST | `/auth/logout` | Logout (revoke token) |
| GET | `/auth/me` | Current user profile |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/password` | Change password |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Aggregate stats for dashboard |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users (paginated) |
| POST | `/users` | Create user |
| GET | `/users/{user}` | Show user |
| PUT | `/users/{user}` | Update user |
| DELETE | `/users/{user}` | Deactivate user |
| PATCH | `/users/{user}/toggle-status` | Toggle active/inactive |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/{category}` | Update category |
| DELETE | `/categories/{category}` | Delete (if no products) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List (filters: category_id, search, low_stock, sort) |
| POST | `/products` | Create product |
| GET | `/products/{product}` | Show with stock movements |
| PUT | `/products/{product}` | Update product |
| DELETE | `/products/{product}` | Deactivate product |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/suppliers` | List suppliers |
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers/{supplier}` | Show with products & POs |
| PUT | `/suppliers/{supplier}` | Update supplier |
| DELETE | `/suppliers/{supplier}` | Delete (if no records) |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List (filters: search, type) |
| POST | `/customers` | Create customer |
| GET | `/customers/{customer}` | Show with sales history |
| PUT | `/customers/{customer}` | Update |
| DELETE | `/customers/{customer}` | Delete |

### Sales (POS)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales` | List (filters: cashier_id, shift_id, status, date range) |
| POST | `/sales` | Create sale (order created, pending payment) |
| GET | `/sales/{sale}` | Show with items & payment attempts |
| POST | `/sales/{sale}/initiate-payment` | Trigger M-PESA STK Push |
| GET | `/sales/{sale}/payment-status` | Check payment status |
| POST | `/sales/{sale}/confirm-payment` | Manually confirm payment |
| POST | `/sales/{sale}/refund` | Refund completed sale (restores stock) |
| POST | `/sales/{sale}/cancel` | Cancel pending sale |

### Shifts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shifts` | List shifts |
| GET | `/shifts/current` | Current open shift for logged-in cashier |
| POST | `/shifts/open` | Open new shift with float |
| POST | `/shifts/{shift}/close` | Close shift with cash count |
| GET | `/shifts/{shift}` | Show shift with sales |

### Purchase Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-orders` | List POs |
| POST | `/purchase-orders` | Create PO |
| GET | `/purchase-orders/{po}` | Show with items |
| POST | `/purchase-orders/{po}/approve` | Approve PO |
| POST | `/purchase-orders/{po}/receive` | Receive stock (updates product stock & cost) |
| POST | `/purchase-orders/{po}/cancel` | Cancel PO |
| POST | `/purchase-orders/{po}/pay` | Record supplier payment |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/movements` | List stock movements |
| POST | `/inventory/adjust` | Adjust stock (in/out/waste) |
| GET | `/inventory/valuation` | Stock valuation report |
| GET | `/inventory/low-stock` | Low stock products |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Record expense (auto ledger entry) |
| GET | `/expenses/{expense}` | Show expense |
| PUT | `/expenses/{expense}` | Update |
| DELETE | `/expenses/{expense}` | Delete |

### Ledger
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ledger` | List ledger entries |
| GET | `/ledger/summary` | Debit/credit/balance summary |

### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | List (filters: user, action, entity, date) |
| GET | `/audit-logs/{log}` | Show detail |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List + unread count |
| PATCH | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/mark-all-read` | Mark all as read |
| DELETE | `/notifications/{id}` | Delete |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports/generate` | Generate report (report_type, date_from, date_to) |

Report types: `daily_sales`, `weekly_sales`, `monthly_sales`, `sales_by_product`, `sales_by_category`, `sales_by_cashier`, `payment_report`, `refund_report`, `inventory_valuation`, `stock_movement`, `low_stock`, `purchase_report`, `supplier_payables`, `expense_report`, `profit_loss`, `cashier_shift`, `audit_report`

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/coop-bank` | M-PESA STK Push callback (public) |

## Co-op Bank M-PESA Integration

Configure in `.env`:
```
COOP_BANK_BASE_URL=https://openapi-coopbankethiopia.com
COOP_BANK_CONSUMER_KEY=your_key
COOP_BANK_CONSUMER_SECRET=your_secret
COOP_BANK_SHORT_CODE=your_shortcode
COOP_BANK_CALLBACK_URL=https://your-domain.com/api/webhooks/coop-bank
```

### Payment Flow
1. POST `/sales` creates an order (status: `ORDER_CREATED`)
2. POST `/sales/{sale}/initiate-payment` triggers STK Push
3. Customer enters M-PESA PIN on phone
4. Co-op Bank calls `/webhooks/coop-bank` callback
5. Sale status updates to `SALE_COMPLETED`, stock deducted, ledger updated
6. Alternatively, POST `/sales/{sale}/confirm-payment` for manual confirmation

## Database Schema

All tables use UUID primary keys. Money is stored as integers (KES cents not used — whole KES values).

Key tables: `users`, `categories`, `products`, `suppliers`, `customers`, `shifts`, `sales`, `sale_items`, `payment_attempts`, `purchase_orders`, `purchase_order_items`, `supplier_payments`, `stock_movements`, `expenses`, `ledger_entries`, `audit_logs`, `notifications`.

## Frontend Integration

Point your React frontend to the API:
```
VITE_API_URL=http://localhost:8000/api
```

All list endpoints return paginated results (`data`, `current_page`, `total`, `per_page`).

## CORS

For local development, the API allows requests from `localhost:5173` (Vite dev server). Configure in `config/cors.php` for production.

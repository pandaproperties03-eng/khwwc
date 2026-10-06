<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'role', 'status',
        'avatar_color', 'last_login',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['last_login' => 'datetime'];

    // --- Permission System ---
    private static array $rolePermissions = [
        'SUPER_ADMIN' => ['*'],
        'MANAGER' => [
            'dashboard.view', 'pos.access', 'sales.view', 'sales.create', 'sales.refund',
            'products.view', 'products.create', 'products.edit', 'inventory.view', 'inventory.adjust',
            'inventory.receive', 'purchases.view', 'purchases.create', 'suppliers.view', 'suppliers.create',
            'payments.view', 'payments.refund', 'shifts.open', 'shifts.close', 'ledger.view',
            'expenses.create', 'reports.view', 'reports.export', 'users.view',
        ],
        'CASHIER' => [
            'dashboard.view', 'pos.access', 'sales.view', 'sales.create',
            'products.view', 'payments.view', 'shifts.open', 'shifts.close',
        ],
        'STOREKEEPER' => [
            'dashboard.view', 'products.view', 'products.edit', 'inventory.view', 'inventory.adjust',
            'inventory.receive', 'purchases.view', 'suppliers.view',
        ],
        'ACCOUNTANT' => [
            'dashboard.view', 'sales.view', 'payments.view', 'ledger.view',
            'expenses.create', 'reports.view', 'reports.export', 'suppliers.view',
        ],
        'SUPERVISOR' => [
            'dashboard.view', 'sales.view', 'payments.view', 'shifts.open', 'shifts.close',
            'reports.view', 'users.view',
        ],
    ];

    public function hasPermission(string $permission): bool
    {
        $permissions = self::$rolePermissions[$this->role] ?? [];
        return in_array('*', $permissions) || in_array($permission, $permissions);
    }

    public function canAccess(string $permission): bool
    {
        return $this->hasPermission($permission);
    }

    // --- Relationships ---
    public function sales(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Sale::class, 'cashier_id');
    }

    public function shifts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Shift::class, 'cashier_id');
    }

    public function auditLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }
}

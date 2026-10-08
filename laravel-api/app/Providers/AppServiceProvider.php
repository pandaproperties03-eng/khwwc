<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\App\Services\CoopBankPaymentService::class);
        $this->app->singleton(\App\Services\SaleCompletionService::class);
    }

    public function boot(): void
    {
        //
    }
}

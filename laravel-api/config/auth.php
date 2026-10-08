<?php

use App\Http\Middleware\RequirePermission;

return [
    'driver' => 'sanctum',
    'provider' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],
    'password_timeout' => 10800,
];

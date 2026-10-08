<?php

return [
    'driver' => 'cookie',
    'lifetime' => 120,
    'expire_on_close' => false,
    'encrypt' => false,
    'files' => storage_path('framework/sessions'),
    'connection' => null,
    'table' => 'sessions',
    'store' => null,
    'lottery' => [2, 100],
    'cookie' => 'hospital_canteen_session',
    'path' => '/',
    'domain' => null,
    'secure' => env('SESSION_SECURE', false),
    'same_site' => 'lax',
];

<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Hospital Canteen POS API',
        'version' => '1.0.0',
        'status' => 'running',
    ]);
});

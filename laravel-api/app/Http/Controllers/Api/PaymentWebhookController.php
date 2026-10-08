<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CoopBankPaymentService;
use App\Models\Sale;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function coopBankCallback(Request $request, CoopBankPaymentService $paymentService)
    {
        $result = $paymentService->handleCallback($request->all());

        if (!$result['success']) {
            return response()->json(['message' => 'Callback processing failed'], 422);
        }

        return response()->json(['message' => 'Callback processed']);
    }
}

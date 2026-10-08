<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\PaymentAttempt;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CoopBankPaymentService
{
    private string $baseUrl;
    private string $consumerKey;
    private string $consumerSecret;
    private string $shortCode;
    private string $callbackUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.coop_bank.base_url', 'https://openapi-coopbankethiopia.com');
        $this->consumerKey = config('services.coop_bank.consumer_key', '');
        $this->consumerSecret = config('services.coop_bank.consumer_secret', '');
        $this->shortCode = config('services.coop_bank.short_code', '');
        $this->callbackUrl = config('services.coop_bank.callback_url', '');
    }

    /**
     * Initiate STK Push for a sale
     */
    public function initiateStkPush(Sale $sale, string $phoneNumber): array
    {
        $stkRef = 'STK-' . Str::upper(Str::random(12));

        $attempt = PaymentAttempt::create([
            'sale_id' => $sale->id,
            'amount' => $sale->total,
            'method' => 'MPESA_STK',
            'status' => 'PENDING',
            'phone_number' => $phoneNumber,
            'stk_ref' => $stkRef,
        ]);

        try {
            $token = $this->getAccessToken();

            $response = Http::withToken($token)
                ->timeout(30)
                ->post("{$this->baseUrl}/v1/mpesa/stk-push", [
                    'ShortCode' => $this->shortCode,
                    'Amount' => $sale->total,
                    'PartyA' => $phoneNumber,
                    'PartyB' => $this->shortCode,
                    'PhoneNumber' => $phoneNumber,
                    'CallBackURL' => $this->callbackUrl,
                    'AccountReference' => $sale->receipt_no,
                    'TransactionDesc' => "Payment for {$sale->receipt_no}",
                    'TransactionRef' => $stkRef,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $merchantRef = $data['MerchantRequestID'] ?? $data['merchantRequestID'] ?? null;

                $attempt->update([
                    'merchant_ref' => $merchantRef,
                    'status' => 'PROCESSING',
                ]);

                $sale->update([
                    'payment_status' => 'PROCESSING',
                    'sale_status' => 'STK_REQUESTED',
                ]);

                return [
                    'success' => true,
                    'stk_ref' => $stkRef,
                    'merchant_ref' => $merchantRef,
                    'message' => 'STK push sent. Customer should enter M-PESA PIN on their phone.',
                    'sale_id' => $sale->id,
                    'receipt_no' => $sale->receipt_no,
                ];
            }

            $attempt->update([
                'status' => 'FAILED',
                'failure_reason' => $response->body(),
            ]);

            $sale->update([
                'payment_status' => 'FAILED',
                'sale_status' => 'PAYMENT_FAILED',
            ]);

            return [
                'success' => false,
                'message' => 'STK push request failed',
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('Co-op Bank STK Push Error: ' . $e->getMessage());

            $attempt->update([
                'status' => 'FAILED',
                'failure_reason' => $e->getMessage(),
            ]);

            $sale->update([
                'payment_status' => 'FAILED',
                'sale_status' => 'PAYMENT_FAILED',
            ]);

            return [
                'success' => false,
                'message' => 'Payment service unavailable. Please try again.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Handle the callback from Co-op Bank / M-PESA
     */
    public function handleCallback(array $data): array
    {
        try {
            $stkRef = $data['TransactionRef'] ?? $data['stkRef'] ?? null;
            $resultCode = $data['ResultCode'] ?? $data['resultCode'] ?? null;

            $attempt = PaymentAttempt::where('stk_ref', $stkRef)->first();

            if (!$attempt) {
                Log::warning('Co-op Bank callback: No matching attempt for stk_ref: ' . $stkRef);
                return ['success' => false, 'message' => 'No matching payment attempt'];
            }

            $sale = $attempt->sale;

            if ($resultCode == 0) {
                // Success
                $mpesaRef = $data['MpesaReceiptNumber'] ?? $data['mpesaReceiptNumber'] ?? $data['TransactionID'] ?? 'N/A';

                $attempt->update(['status' => 'CONFIRMED']);

                // The confirmPayment logic on the controller handles stock deduction.
                // Here we just mark the sale as payment confirmed.
                $sale->update([
                    'payment_status' => 'CONFIRMED',
                    'sale_status' => 'PAYMENT_CONFIRMED',
                    'payment_ref' => $mpesaRef,
                ]);

                AuditLog::create([
                    'user_id' => null,
                    'user_name' => 'System',
                    'action' => 'PAYMENT_CALLBACK_SUCCESS',
                    'entity' => 'Sale',
                    'entity_id' => $sale->id,
                    'description' => "M-PESA payment confirmed for {$sale->receipt_no}. Ref: {$mpesaRef}",
                    'timestamp' => now(),
                ]);

                return ['success' => true, 'message' => 'Payment confirmed', 'mpesa_ref' => $mpesaRef];
            } else {
                // Failed
                $reason = $data['ResultDesc'] ?? $data['resultDesc'] ?? 'Payment failed';

                $attempt->update([
                    'status' => 'FAILED',
                    'failure_reason' => $reason,
                ]);

                $sale->update([
                    'payment_status' => 'FAILED',
                    'sale_status' => 'PAYMENT_FAILED',
                ]);

                AuditLog::create([
                    'user_id' => null,
                    'user_name' => 'System',
                    'action' => 'PAYMENT_CALLBACK_FAILED',
                    'entity' => 'Sale',
                    'entity_id' => $sale->id,
                    'description' => "M-PESA payment failed for {$sale->receipt_no}. Reason: {$reason}",
                    'timestamp' => now(),
                ]);

                return ['success' => true, 'message' => 'Payment failure recorded'];
            }
        } catch (\Exception $e) {
            Log::error('Co-op Bank Callback Error: ' . $e->getMessage(), $data);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Query STK Push status
     */
    public function queryStkStatus(string $stkRef): array
    {
        try {
            $token = $this->getAccessToken();

            $response = Http::withToken($token)
                ->timeout(15)
                ->post("{$this->baseUrl}/v1/mpesa/stk-query", [
                    'ShortCode' => $this->shortCode,
                    'TransactionRef' => $stkRef,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['success' => false, 'message' => 'Query failed', 'error' => $response->body()];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get OAuth access token from Co-op Bank
     */
    private function getAccessToken(): string
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->timeout(15)
            ->get("{$this->baseUrl}/oauth/token?grant_type=client_credentials");

        if (!$response->successful()) {
            throw new \Exception('Failed to get access token: ' . $response->body());
        }

        return $response->json()['access_token'];
    }
}

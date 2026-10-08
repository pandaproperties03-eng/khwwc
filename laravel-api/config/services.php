<?php

return [
    'coop_bank' => [
        'base_url' => env('COOP_BANK_BASE_URL', 'https://openapi-coopbankethiopia.com'),
        'consumer_key' => env('COOP_BANK_CONSUMER_KEY', ''),
        'consumer_secret' => env('COOP_BANK_CONSUMER_SECRET', ''),
        'short_code' => env('COOP_BANK_SHORT_CODE', ''),
        'callback_url' => env('COOP_BANK_CALLBACK_URL', 'https://your-domain.com/api/webhooks/coop-bank'),
    ],
];

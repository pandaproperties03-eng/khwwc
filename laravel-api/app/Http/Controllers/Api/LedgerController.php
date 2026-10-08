<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $query = LedgerEntry::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $entries = $query->orderBy('date', 'desc')->paginate($request->per_page ?? 30);
        return response()->json($entries);
    }

    public function summary(Request $request)
    {
        $dateFrom = $request->date_from ?? now()->startOfMonth();
        $dateTo = $request->date_to ?? now();

        $totalDebit = LedgerEntry::whereBetween('date', [$dateFrom, $dateTo])->sum('debit');
        $totalCredit = LedgerEntry::whereBetween('date', [$dateFrom, $dateTo])->sum('credit');
        $currentBalance = LedgerEntry::orderBy('date', 'desc')->value('balance') ?? 0;

        return response()->json([
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'net' => $totalDebit - $totalCredit,
            'current_balance' => $currentBalance,
            'period_from' => $dateFrom,
            'period_to' => $dateTo,
        ]);
    }
}

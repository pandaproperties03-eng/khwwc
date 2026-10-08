<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\AuditLog;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('description', 'ilike', "%{$search}%");
        }

        $expenses = $query->orderBy('date', 'desc')->paginate($request->per_page ?? 20);
        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:1000',
            'category' => 'required|string|max:100',
            'amount' => 'required|integer|min:1',
            'date' => 'required|date',
            'payment_method' => 'sometimes|string|max:50',
            'reference' => 'sometimes|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $expense = Expense::create([
                'description' => $validated['description'],
                'category' => $validated['category'],
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'payment_method' => $validated['payment_method'] ?? 'CASH',
                'reference' => $validated['reference'] ?? ('EXP-' . date('YmdHis')),
                'recorded_by' => $request->user()->id,
                'recorded_by_name' => $request->user()->name,
                'notes' => $validated['notes'] ?? null,
            ]);

            $lastBalance = LedgerEntry::orderBy('date', 'desc')->value('balance') ?? 0;
            LedgerEntry::create([
                'date' => now(),
                'reference' => $expense->reference,
                'description' => "Expense: {$validated['description']} ({$validated['category']})",
                'debit' => 0,
                'credit' => $validated['amount'],
                'balance' => $lastBalance - $validated['amount'],
                'type' => 'EXPENSE',
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'action' => 'CREATE_EXPENSE',
                'entity' => 'Expense',
                'entity_id' => $expense->id,
                'description' => "Recorded expense KES {$validated['amount']} - {$validated['description']}",
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json($expense, 201);
        });
    }

    public function show(Expense $expense)
    {
        return response()->json($expense);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'description' => 'sometimes|string|max:1000',
            'category' => 'sometimes|string|max:100',
            'amount' => 'sometimes|integer|min:1',
            'date' => 'sometimes|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(['message' => 'Expense deleted']);
    }
}

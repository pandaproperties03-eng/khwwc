<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Models\Sale;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $query = Shift::with('cashier');

        if ($request->has('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $shifts = $query->orderBy('opened_at', 'desc')->paginate($request->per_page ?? 20);
        return response()->json($shifts);
    }

    public function show(Shift $shift)
    {
        return response()->json($shift->load('cashier', 'sales'));
    }

    public function open(Request $request)
    {
        $validated = $request->validate([
            'opening_float' => 'required|integer|min:0',
            'opening_notes' => 'nullable|string|max:1000',
        ]);

        $openShift = Shift::where('cashier_id', $request->user()->id)
            ->where('status', 'OPEN')
            ->first();

        if ($openShift) {
            return response()->json(['message' => 'You already have an open shift', 'shift' => $openShift], 422);
        }

        $shift = Shift::create([
            'cashier_id' => $request->user()->id,
            'cashier_name' => $request->user()->name,
            'date' => today(),
            'opening_float' => $validated['opening_float'],
            'opening_notes' => $validated['opening_notes'] ?? null,
            'status' => 'OPEN',
            'opened_at' => now(),
            'expected_cash' => $validated['opening_float'],
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'OPEN_SHIFT',
            'entity' => 'Shift',
            'entity_id' => $shift->id,
            'description' => "Opened shift with float KES {$validated['opening_float']}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($shift, 201);
    }

    public function close(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'actual_cash' => 'required|integer|min:0',
            'closing_notes' => 'nullable|string|max:1000',
        ]);

        if ($shift->status !== 'OPEN') {
            return response()->json(['message' => 'Shift is already closed'], 422);
        }

        $difference = $validated['actual_cash'] - $shift->expected_cash;

        $shift->update([
            'status' => 'CLOSED',
            'closed_at' => now(),
            'actual_cash' => $validated['actual_cash'],
            'difference' => $difference,
            'closing_notes' => $validated['closing_notes'] ?? null,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'CLOSE_SHIFT',
            'entity' => 'Shift',
            'entity_id' => $shift->id,
            'description' => "Closed shift. Expected: KES {$shift->expected_cash}, Actual: KES {$validated['actual_cash']}, Diff: KES {$difference}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($shift->load('sales'));
    }

    public function current(Request $request)
    {
        $shift = Shift::where('cashier_id', $request->user()->id)
            ->where('status', 'OPEN')
            ->with('sales')
            ->first();

        if (!$shift) {
            return response()->json(['message' => 'No open shift'], 404);
        }

        return response()->json($shift);
    }
}

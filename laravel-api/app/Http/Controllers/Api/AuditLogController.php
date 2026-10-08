<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }
        if ($request->has('entity')) {
            $query->where('entity', $request->entity);
        }
        if ($request->has('date_from')) {
            $query->where('timestamp', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('timestamp', '<=', $request->date_to . ' 23:59:59');
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'ilike', "%{$search}%")
                  ->orWhere('action', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $logs = $query->orderBy('timestamp', 'desc')->paginate($request->per_page ?? 30);
        return response()->json($logs);
    }

    public function show(AuditLog $auditLog)
    {
        return response()->json($auditLog->load('user'));
    }
}

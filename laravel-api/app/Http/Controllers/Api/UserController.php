<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);
        return response()->json($users);
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'CREATE_USER',
            'entity' => 'User',
            'entity_id' => $user->id,
            'description' => "Created user {$user->name} ({$user->email})",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($user, 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'UPDATE_USER',
            'entity' => 'User',
            'entity_id' => $user->id,
            'description' => "Updated user {$user->name}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->update(['status' => 'INACTIVE']);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'DEACTIVATE_USER',
            'entity' => 'User',
            'entity_id' => $user->id,
            'description' => "Deactivated user {$user->name}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'User deactivated']);
    }

    public function toggleStatus(Request $request, User $user)
    {
        $newStatus = $user->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        $user->update(['status' => $newStatus]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'TOGGLE_USER_STATUS',
            'entity' => 'User',
            'entity_id' => $user->id,
            'description' => "Set {$user->name} status to {$newStatus}",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json($user);
    }
}

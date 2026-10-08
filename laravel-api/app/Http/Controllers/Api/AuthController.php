<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AuditLog;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->status !== 'ACTIVE') {
            return response()->json(['message' => 'Account inactive. Contact administrator.'], 403);
        }

        $token = $user->createToken('auth-token', ['*'], now()->addHours(12))->plainTextToken;

        $user->update(['last_login' => now()]);

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'action' => 'LOGIN',
            'entity' => 'User',
            'entity_id' => $user->id,
            'description' => "{$user->name} logged in",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'LOGOUT',
            'entity' => 'User',
            'entity_id' => $request->user()->id,
            'description' => "{$request->user()->name} logged out",
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'avatar_color' => 'sometimes|string|max:20',
        ]);

        $request->user()->update($validated);
        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);
        return response()->json(['message' => 'Password updated']);
    }
}

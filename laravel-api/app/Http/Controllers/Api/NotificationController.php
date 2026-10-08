<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::query();

        if ($request->has('read')) {
            $query->where('read', $request->boolean('read'));
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->orderBy('timestamp', 'desc')->limit(50)->get();
        $unreadCount = Notification::where('read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Notification $notification)
    {
        $notification->update(['read' => true]);
        return response()->json($notification);
    }

    public function markAllRead()
    {
        Notification::where('read', false)->update(['read' => true]);
        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }
}

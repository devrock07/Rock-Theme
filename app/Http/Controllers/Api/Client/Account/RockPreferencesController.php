<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Account;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class RockPreferencesController extends ClientApiController
{
    public function index(Request $request): JsonResponse
    {
        $preferences = null;
        $notifications = collect();

        try {
            if (Schema::hasTable('rock_user_preferences')) {
                $preferences = DB::table('rock_user_preferences')
                    ->where('user_id', $request->user()->id)
                    ->value('server_preferences');
            }
            if (Schema::hasTable('rock_notifications')) {
                $notifications = DB::table('rock_notifications')
                    ->where('user_id', $request->user()->id)
                    ->whereNull('read_at')
                    ->latest()->limit(30)->get()
                    ->map(fn ($item) => [
                        'id' => (string) $item->id,
                        'type' => $item->type,
                        'title' => $item->title,
                        'message' => $item->message,
                        'href' => $item->href,
                        'readAt' => $item->read_at,
                        'createdAt' => $item->created_at,
                    ]);
            }
        } catch (\Throwable) {
            // Local preferences and notifications remain available while storage is unavailable.
        }

        return response()->json([
            'serverPreferences' => $preferences ? json_decode($preferences, true) : new \stdClass(),
            'notifications' => $notifications,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'server_preferences' => ['required', 'array'],
            'server_preferences.*.favorite' => ['sometimes', 'boolean'],
            'server_preferences.*.group' => ['sometimes', 'string', 'max:32'],
        ]);

        try {
            if (Schema::hasTable('rock_user_preferences')) {
                DB::table('rock_user_preferences')->updateOrInsert(
                    ['user_id' => $request->user()->id],
                    [
                        'server_preferences' => json_encode($data['server_preferences']),
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        } catch (\Throwable) {
            // The client keeps a local copy and will retry on a later change.
        }

        return response()->json(['serverPreferences' => $data['server_preferences']]);
    }

    public function clearNotifications(Request $request): JsonResponse
    {
        try {
            if (Schema::hasTable('rock_notifications')) {
                DB::table('rock_notifications')
                    ->where('user_id', $request->user()->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => now(), 'updated_at' => now()]);
            }
        } catch (\Throwable) {
            // Clearing the local notification store must not fail with the remote store.
        }

        return response()->json([], 204);
    }

    public function markNotificationRead(Request $request, string $notification): JsonResponse
    {
        if (!ctype_digit($notification)) {
            return response()->json([], 204);
        }

        try {
            if (Schema::hasTable('rock_notifications')) {
                DB::table('rock_notifications')
                    ->where('id', $notification)
                    ->where('user_id', $request->user()->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => now(), 'updated_at' => now()]);
            }
        } catch (\Throwable) {
            // The browser keeps a local read marker and can retry later.
        }

        return response()->json([], 204);
    }
}

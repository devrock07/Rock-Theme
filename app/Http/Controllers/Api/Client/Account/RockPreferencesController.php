<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Account;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class RockPreferencesController extends ClientApiController
{
    public function index(Request $request): JsonResponse
    {
        $preferences = DB::table('rock_user_preferences')->where('user_id', $request->user()->id)->value('server_preferences');
        $notifications = DB::table('rock_notifications')
            ->where('user_id', $request->user()->id)
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

        DB::table('rock_user_preferences')->updateOrInsert(
            ['user_id' => $request->user()->id],
            ['server_preferences' => json_encode($data['server_preferences']), 'updated_at' => now(), 'created_at' => now()]
        );

        return response()->json(['serverPreferences' => $data['server_preferences']]);
    }

    public function clearNotifications(Request $request): JsonResponse
    {
        DB::table('rock_notifications')->where('user_id', $request->user()->id)->delete();

        return response()->json([], 204);
    }
}

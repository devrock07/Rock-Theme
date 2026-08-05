<?php

namespace Pterodactyl\Tests\Integration\Api\Client;

use Pterodactyl\Models\User;
use Illuminate\Support\Facades\DB;

class RockPreferencesControllerTest extends ClientApiIntegrationTestCase
{
    public function testOnlyUnreadNotificationsAreReturned(): void
    {
        $user = User::factory()->create();
        $unread = $this->createNotification($user, 'Unread alert');
        $this->createNotification($user, 'Read alert', now());

        $response = $this->actingAs($user)->getJson('/api/client/account/rock');

        $response->assertOk();
        $response->assertJsonCount(1, 'notifications');
        $response->assertJsonPath('notifications.0.id', (string) $unread);
        $response->assertJsonPath('notifications.0.title', 'Unread alert');
    }

    public function testNotificationCanOnlyBeMarkedReadByItsOwner(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $notification = $this->createNotification($user, 'Owned alert');
        $otherNotification = $this->createNotification($other, 'Other alert');

        $this->actingAs($user)
            ->patchJson("/api/client/account/rock/notifications/{$notification}/read")
            ->assertNoContent();
        $this->actingAs($user)
            ->patchJson("/api/client/account/rock/notifications/{$otherNotification}/read")
            ->assertNoContent();

        $this->assertNotNull(DB::table('rock_notifications')->where('id', $notification)->value('read_at'));
        $this->assertNull(DB::table('rock_notifications')->where('id', $otherNotification)->value('read_at'));
        $this->actingAs($user)->getJson('/api/client/account/rock')->assertJsonCount(0, 'notifications');
    }

    public function testClearingNotificationsMarksAllUnreadRowsAsRead(): void
    {
        $user = User::factory()->create();
        $this->createNotification($user, 'First alert');
        $this->createNotification($user, 'Second alert');

        $this->actingAs($user)->deleteJson('/api/client/account/rock/notifications')->assertNoContent();

        $this->assertSame(
            0,
            DB::table('rock_notifications')->where('user_id', $user->id)->whereNull('read_at')->count()
        );
    }

    private function createNotification(User $user, string $title, mixed $readAt = null): int
    {
        return DB::table('rock_notifications')->insertGetId([
            'user_id' => $user->id,
            'server_id' => null,
            'type' => 'recovered',
            'title' => $title,
            'message' => 'The server is responding again.',
            'href' => '/',
            'read_at' => $readAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

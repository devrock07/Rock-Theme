<?php

namespace Pterodactyl\Services\RockTheme;

use Illuminate\Support\Arr;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TelemetryRecorder
{
    public function record(Server $server, array $stats): void
    {
        if (!Schema::hasTable('rock_telemetry_samples')) {
            return;
        }

        $recordedAt = now()->startOfMinute();
        $state = Arr::get($stats, 'state', 'unknown');
        $previous = DB::table('rock_telemetry_samples')
            ->where('server_id', $server->id)->latest('recorded_at')->first();

        DB::table('rock_telemetry_samples')->updateOrInsert(
            ['server_id' => $server->id, 'recorded_at' => $recordedAt],
            [
                'state' => $state,
                'cpu' => Arr::get($stats, 'utilization.cpu_absolute', 0),
                'memory' => Arr::get($stats, 'utilization.memory_bytes', 0),
                'disk' => Arr::get($stats, 'utilization.disk_bytes', 0),
                'network_rx' => Arr::get($stats, 'utilization.network.rx_bytes', 0),
                'network_tx' => Arr::get($stats, 'utilization.network.tx_bytes', 0),
            ]
        );

        if ($previous && $previous->state !== $state && in_array($state, ['offline', 'running'], true)) {
            $this->notifyUsers(
                $server,
                $state === 'offline' ? 'offline' : 'recovered',
                $state === 'offline' ? "{$server->name} is offline" : "{$server->name} recovered",
                $state === 'offline' ? 'The server stopped responding.' : 'The server is responding again.'
            );
        }

        if ((float) Arr::get($stats, 'utilization.cpu_absolute', 0) >= 90) {
            $recent = DB::table('rock_notifications')->where('server_id', $server->id)
                ->where('type', 'cpu')->where('created_at', '>=', now()->subHour())->exists();
            if (!$recent) {
                $this->notifyUsers($server, 'cpu', "{$server->name} CPU is high", 'CPU usage crossed 90%.');
            }
        }
    }

    private function notifyUsers(Server $server, string $type, string $title, string $message): void
    {
        if (!Schema::hasTable('rock_notifications')) {
            return;
        }

        $userIds = $server->subusers()->pluck('user_id')->push($server->owner_id)->unique();
        $now = now();
        DB::table('rock_notifications')->insert($userIds->map(fn ($userId) => [
            'user_id' => $userId,
            'server_id' => $server->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'href' => "/server/{$server->uuidShort}",
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());
    }
}

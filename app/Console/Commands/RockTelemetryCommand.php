<?php

namespace Pterodactyl\Console\Commands;

use Throwable;
use Pterodactyl\Models\Server;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Services\RockTheme\TelemetryRecorder;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

class RockTelemetryCommand extends Command
{
    protected $signature = 'rock:telemetry {--prune-only}';
    protected $description = 'Collect and prune Rock Theme server telemetry.';

    public function handle(DaemonServerRepository $repository, TelemetryRecorder $recorder): int
    {
        DB::table('rock_telemetry_samples')->where('recorded_at', '<', now()->subDays(7))->delete();
        if ($this->option('prune-only')) {
            return self::SUCCESS;
        }

        Server::query()->whereNotNull('installed_at')->whereNull('status')->eachById(
            function (Server $server) use ($repository, $recorder) {
                try {
                    $recorder->record($server, $repository->setServer($server)->getDetails());
                } catch (Throwable) {
                    // A single unavailable node should not stop collection for other servers.
                }
            },
            50
        );

        return self::SUCCESS;
    }
}

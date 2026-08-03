<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\GetServerRequest;

class TelemetryHistoryController extends ClientApiController
{
    public function __invoke(GetServerRequest $request, Server $server): JsonResponse
    {
        $hours = $request->query('range') === '24h' ? 24 : 1;
        $samples = DB::table('rock_telemetry_samples')
            ->where('server_id', $server->id)
            ->where('recorded_at', '>=', now()->subHours($hours))
            ->orderBy('recorded_at')->get();
        $stride = max(1, (int) ceil($samples->count() / 120));

        return response()->json(['samples' => $samples->filter(fn ($sample, $index) => $index % $stride === 0)->values()]);
    }
}

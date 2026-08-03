<?php

namespace Pterodactyl\Http\Controllers\Base;

use Pterodactyl\Models\Node;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Repositories\Wings\DaemonConfigurationRepository;

class PublicStatusController extends Controller
{
    public function __invoke(DaemonConfigurationRepository $repository): JsonResponse
    {
        if (!config('branding.status_enabled')) {
            abort(404);
        }

        return response()->json(Cache::remember('rock:public-status', 45, function () use ($repository) {
            $nodes = Node::query()->get();
            $operational = 0;
            $maintenance = 0;

            foreach ($nodes as $node) {
                if ($node->maintenance_mode) {
                    ++$maintenance;
                    continue;
                }
                try {
                    $repository->setNode($node)->getSystemInformation();
                    ++$operational;
                } catch (\Throwable) {
                    // The total count below records this node as unavailable.
                }
            }

            $unavailable = $nodes->count() - $operational - $maintenance;

            return [
                'status' => $unavailable > 0 ? 'degraded' : ($maintenance > 0 ? 'maintenance' : 'operational'),
                'nodes' => [
                    'total' => $nodes->count(),
                    'operational' => $operational,
                    'maintenance' => $maintenance,
                    'unavailable' => $unavailable,
                ],
                'checkedAt' => now()->toIso8601String(),
            ];
        }));
    }
}

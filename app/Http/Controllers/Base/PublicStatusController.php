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

        return response()->json(Cache::remember('rock:public-status:v2', 45, function () use ($repository) {
            $nodes = Node::query()->get();
            $operational = 0;
            $maintenance = 0;
            $nodeList = [];
            $showNodes = config('branding.status_show_nodes', true);
            $mode = config('branding.status_node_mode', 'all');

            foreach ($nodes as $node) {
                $nodeStatus = 'operational';
                if ($node->maintenance_mode) {
                    ++$maintenance;
                    $nodeStatus = 'maintenance';
                } else {
                    try {
                        $repository->setNode($node)->getSystemInformation();
                        ++$operational;
                    } catch (\Throwable) {
                        $nodeStatus = 'unavailable';
                    }
                }

                if ($showNodes && $mode !== 'summary_only') {
                    if ($mode === 'operational_only' && $nodeStatus !== 'operational') {
                        continue;
                    }
                    $nodeList[] = [
                        'id' => $node->id,
                        'name' => $node->name,
                        'status' => $nodeStatus,
                    ];
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
                    'items' => $nodeList,
                ],
                'settings' => [
                    'showNodes' => (bool) $showNodes,
                    'mode' => $mode,
                ],
                'checkedAt' => now()->toIso8601String(),
            ];
        }));
    }
}

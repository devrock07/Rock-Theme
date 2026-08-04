<?php

namespace Pterodactyl\Tests\Integration\Http\Controllers\Base;

use Pterodactyl\Models\Node;
use Pterodactyl\Models\Location;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Tests\Integration\Http\HttpTestCase;
use Pterodactyl\Repositories\Wings\DaemonConfigurationRepository;

class PublicStatusControllerTest extends HttpTestCase
{
    public function testStatusEndpointReturnsAggregateAndPrivacySafeNodeDetails(): void
    {
        config()->set('branding.status_enabled', true);
        config()->set('branding.status_show_nodes', true);
        config()->set('branding.status_node_mode', 'all');
        Cache::forget('rock:public-status:v2');

        $location = Location::factory()->create();
        $onlineNode = Node::factory()->for($location)->create([
            'name' => 'Online Node',
            'fqdn' => 'private-online.example.com',
            'maintenance_mode' => false,
        ]);
        Node::factory()->for($location)->create([
            'name' => 'Maintenance Node',
            'fqdn' => 'private-maintenance.example.com',
            'maintenance_mode' => true,
        ]);
        $unavailableNode = Node::factory()->for($location)->create([
            'name' => 'Unavailable Node',
            'fqdn' => 'private-unavailable.example.com',
            'maintenance_mode' => false,
        ]);

        $total = Node::query()->count();
        $maintenance = Node::query()->where('maintenance_mode', true)->count();
        $active = $total - $maintenance;
        $currentNodeId = null;
        $repository = $this->mock(DaemonConfigurationRepository::class);
        $repository->shouldReceive('setNode')->times($active)->andReturnUsing(function (Node $node) use (&$currentNodeId, $repository) {
            $currentNodeId = $node->id;

            return $repository;
        });
        $repository->shouldReceive('getSystemInformation')->times($active)->andReturnUsing(function () use (&$currentNodeId, $unavailableNode) {
            if ($currentNodeId === $unavailableNode->id) {
                throw new \RuntimeException('Wings is unavailable.');
            }

            return [];
        });

        $response = $this->getJson(route('public.status.api'));
        $response->assertOk();
        $response->assertJsonPath('status', 'degraded');
        $response->assertJsonPath('nodes.total', $total);
        $response->assertJsonPath('nodes.operational', $active - 1);
        $response->assertJsonPath('nodes.maintenance', $maintenance);
        $response->assertJsonPath('nodes.unavailable', 1);
        $this->assertCount($total, $response->json('nodes.items'));

        $this->assertContains($onlineNode->id, array_column($response->json('nodes.items'), 'id'));
        $this->assertContains($unavailableNode->id, array_column($response->json('nodes.items'), 'id'));

        foreach ($response->json('nodes.items') as $node) {
            $this->assertArrayNotHasKey('fqdn', $node);
            $this->assertArrayNotHasKey('location_id', $node);
        }
    }

    public function testStatusEndpointCanBeDisabled(): void
    {
        config()->set('branding.status_enabled', false);

        $this->getJson(route('public.status.api'))->assertNotFound();
    }
}

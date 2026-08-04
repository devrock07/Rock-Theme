<?php

namespace Pterodactyl\Tests\Integration\Http\Controllers\Base;

use RuntimeException;
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
        Node::factory()->for($location)->create([
            'name' => 'Online Node',
            'fqdn' => 'private-online.example.com',
            'maintenance_mode' => false,
        ]);
        Node::factory()->for($location)->create([
            'name' => 'Maintenance Node',
            'fqdn' => 'private-maintenance.example.com',
            'maintenance_mode' => true,
        ]);
        Node::factory()->for($location)->create([
            'name' => 'Unavailable Node',
            'fqdn' => 'private-unavailable.example.com',
            'maintenance_mode' => false,
        ]);

        $checks = 0;
        $repository = $this->mock(DaemonConfigurationRepository::class);
        $repository->shouldReceive('setNode')->twice()->andReturnSelf();
        $repository->shouldReceive('getSystemInformation')->twice()->andReturnUsing(function () use (&$checks) {
            if ($checks++ === 0) {
                return [];
            }

            throw new RuntimeException('Wings is unavailable.');
        });

        $response = $this->getJson(route('public.status.api'));
        $response->assertOk();
        $response->assertJsonPath('status', 'degraded');
        $response->assertJsonPath('nodes.total', 3);
        $response->assertJsonPath('nodes.operational', 1);
        $response->assertJsonPath('nodes.maintenance', 1);
        $response->assertJsonPath('nodes.unavailable', 1);
        $this->assertCount(3, $response->json('nodes.items'));

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

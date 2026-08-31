<?php

namespace Pterodactyl\Tests\Unit\Http\Controllers\Admin\Settings;

use Pterodactyl\Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Contracts\Encryption\Encrypter;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Pterodactyl\Http\Controllers\Admin\Settings\MailController;
use Pterodactyl\Http\Controllers\Admin\Settings\IndexController;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Controllers\Admin\Settings\AdvancedController;
use Pterodactyl\Http\Requests\Admin\Settings\BaseSettingsFormRequest;
use Pterodactyl\Http\Requests\Admin\Settings\MailSettingsFormRequest;
use Pterodactyl\Http\Requests\Admin\Settings\AdvancedSettingsFormRequest;

class SettingsUpdateControllersTest extends TestCase
{
    private bool $insideTransaction = false;

    public function testIndexSettingsAreWrittenInATransactionAndQueueFailureIsReported(): void
    {
        $this->mockTransaction();
        $values = ['app:name' => 'Test Panel', 'app:locale' => 'en'];
        $request = \Mockery::mock(BaseSettingsFormRequest::class);
        $request->expects('normalize')->once()->andReturn($values);

        $alert = \Mockery::mock(AlertsMessageBag::class);
        $alert->expects('warning')
            ->with('Panel settings were saved, but the queue worker could not be restarted automatically. Run "php artisan queue:restart" and check the application logs.')
            ->once()
            ->andReturnSelf();
        $alert->expects('flash')->once()->andReturnSelf();
        $alert->shouldNotReceive('success');

        $kernel = \Mockery::mock(Kernel::class);
        $kernel->expects('call')->with('queue:restart')->once()->andThrow(new \RuntimeException('queue unavailable'));
        $controller = new IndexController(
            $alert,
            $kernel,
            $this->settingsRepository($values),
            \Mockery::mock(SoftwareVersionService::class),
        );

        $response = $controller->update($request);

        $this->assertSame(route('admin.settings'), $response->getTargetUrl());
    }

    public function testAdvancedSettingsAreWrittenInATransactionAndQueueFailureIsReported(): void
    {
        $this->mockTransaction();
        $values = ['recaptcha:enabled' => 'false', 'pterodactyl:guzzle:timeout' => '30'];
        $request = \Mockery::mock(AdvancedSettingsFormRequest::class);
        $request->expects('normalize')->once()->andReturn($values);

        $alert = \Mockery::mock(AlertsMessageBag::class);
        $alert->expects('warning')
            ->with('Advanced settings were saved, but the queue worker could not be restarted automatically. Run "php artisan queue:restart" and check the application logs.')
            ->once()
            ->andReturnSelf();
        $alert->expects('flash')->once()->andReturnSelf();
        $alert->shouldNotReceive('success');

        $controller = new AdvancedController(
            $alert,
            \Mockery::mock(ConfigRepository::class),
            $this->queueKernel(2),
            $this->settingsRepository($values),
        );

        $response = $controller->update($request);

        $this->assertSame(route('admin.settings.advanced'), $response->getTargetUrl());
    }

    public function testMailSettingsAreWrittenInATransaction(): void
    {
        $this->mockTransaction();
        $values = [
            'mail:mailers:smtp:host' => 'smtp.example.test',
            'mail:mailers:smtp:password' => 'plain-text-password',
        ];
        $storedValues = [
            'mail:mailers:smtp:host' => 'smtp.example.test',
            'mail:mailers:smtp:password' => 'encrypted-password',
        ];

        $request = \Mockery::mock(MailSettingsFormRequest::class);
        $request->expects('normalize')->once()->andReturn($values);

        $config = \Mockery::mock(ConfigRepository::class);
        $config->expects('get')->with('mail.default')->once()->andReturn('smtp');

        $encrypter = \Mockery::mock(Encrypter::class);
        $encrypter->expects('encrypt')
            ->with('plain-text-password')
            ->once()
            ->andReturn('encrypted-password');

        $controller = new MailController(
            $config,
            $encrypter,
            $this->queueKernel(0),
            $this->settingsRepository($storedValues),
        );

        $response = $controller->update($request);

        $this->assertSame(204, $response->getStatusCode());
        $this->assertSame('ok', $response->headers->get('X-Rock-Queue-Restart'));
    }

    public function testMailSettingsReportAQueueRestartExceptionWithoutLosingTheSave(): void
    {
        $this->mockTransaction();
        $values = ['mail:mailers:smtp:host' => 'smtp.example.test'];
        $request = \Mockery::mock(MailSettingsFormRequest::class);
        $request->expects('normalize')->once()->andReturn($values);

        $config = \Mockery::mock(ConfigRepository::class);
        $config->expects('get')->with('mail.default')->once()->andReturn('smtp');

        $kernel = \Mockery::mock(Kernel::class);
        $kernel->expects('call')->with('queue:restart')->once()->andThrow(new \RuntimeException('queue unavailable'));

        $controller = new MailController(
            $config,
            \Mockery::mock(Encrypter::class),
            $kernel,
            $this->settingsRepository($values),
        );

        $response = $controller->update($request);

        $this->assertSame(204, $response->getStatusCode());
        $this->assertSame('failed', $response->headers->get('X-Rock-Queue-Restart'));
    }

    private function queueKernel(int $exitCode): Kernel
    {
        $kernel = \Mockery::mock(Kernel::class);
        $kernel->expects('call')->with('queue:restart')->once()->andReturn($exitCode);

        return $kernel;
    }

    private function settingsRepository(array $values): SettingsRepositoryInterface
    {
        $settings = \Mockery::mock(SettingsRepositoryInterface::class);

        foreach ($values as $key => $value) {
            $settings->expects('set')
                ->with('settings::' . $key, $value)
                ->once()
                ->andReturnUsing(function () {
                    $this->assertTrue($this->insideTransaction);
                });
        }

        return $settings;
    }

    private function mockTransaction(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(function (callable $callback) {
                $this->insideTransaction = true;

                try {
                    return $callback();
                } finally {
                    $this->insideTransaction = false;
                }
            });
    }
}

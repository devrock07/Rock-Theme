<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Admin\Settings\BaseSettingsFormRequest;

class IndexController extends Controller
{
    use AvailableLanguages;

    /**
     * IndexController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
        private SoftwareVersionService $versionService,
    ) {
    }

    /**
     * Render the UI for basic Panel settings.
     */
    public function index(): View
    {
        return view('admin.settings.index', [
            'version' => $this->versionService,
            'languages' => $this->getAvailableLanguages(true),
        ]);
    }

    /**
     * Handle settings update.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(BaseSettingsFormRequest $request): RedirectResponse
    {
        $values = $request->normalize();

        DB::transaction(function () use ($values) {
            foreach ($values as $key => $value) {
                $this->settings->set('settings::' . $key, $value);
            }
        });

        try {
            $queueRestarted = $this->kernel->call('queue:restart') === 0;
        } catch (\Throwable) {
            $queueRestarted = false;
        }

        if ($queueRestarted) {
            $this->alert->success('Panel settings have been updated successfully and the queue worker was restarted to apply these changes.')->flash();
        } else {
            $this->alert->warning('Panel settings were saved, but the queue worker could not be restarted automatically. Run "php artisan queue:restart" and check the application logs.')->flash();
        }

        return redirect()->route('admin.settings');
    }
}

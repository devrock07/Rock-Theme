<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Admin\Settings\AdvancedSettingsFormRequest;

class AdvancedController extends Controller
{
    /**
     * AdvancedController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private ConfigRepository $config,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    /**
     * Render advanced Panel settings UI.
     */
    public function index(): View
    {
        $showRecaptchaWarning = false;
        if (
            $this->config->get('recaptcha._shipped_secret_key') === $this->config->get('recaptcha.secret_key')
            || $this->config->get('recaptcha._shipped_website_key') === $this->config->get('recaptcha.website_key')
        ) {
            $showRecaptchaWarning = true;
        }

        return view('admin.settings.advanced', [
            'showRecaptchaWarning' => $showRecaptchaWarning,
        ]);
    }

    /**
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(AdvancedSettingsFormRequest $request): RedirectResponse
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
            $this->alert->success('Advanced settings have been updated successfully and the queue worker was restarted to apply these changes.')->flash();
        } else {
            $this->alert->warning('Advanced settings were saved, but the queue worker could not be restarted automatically. Run "php artisan queue:restart" and check the application logs.')->flash();
        }

        return redirect()->route('admin.settings.advanced');
    }
}

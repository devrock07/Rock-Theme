<?php

namespace Pterodactyl\Http\Requests\Admin\Settings;

use Illuminate\Validation\Rule;
use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class BaseSettingsFormRequest extends AdminFormRequest
{
    use AvailableLanguages;

    public function rules(): array
    {
        return [
            'app:name' => 'required|string|max:191',
            'branding:owner' => 'required|string|max:64',
            'branding:url' => 'nullable|url|max:191',
            'branding:mark' => 'required|string|max:12',
            'branding:logo' => 'nullable|string|max:500',
            'branding:start_year' => 'required|integer|min:1900|max:' . date('Y'),
            'branding:dashboard_title' => 'required|string|max:100',
            'branding:dashboard_subtitle' => 'nullable|string|max:160',
            'branding:dashboard_image' => 'nullable|string|max:500',
            'branding:panel_pet_enabled' => 'required|boolean',
            'pterodactyl:auth:2fa_required' => 'required|integer|in:0,1,2',
            'app:locale' => ['required', 'string', Rule::in(array_keys($this->getAvailableLanguages()))],
        ];
    }

    public function attributes(): array
    {
        return [
            'app:name' => 'Panel Name',
            'branding:owner' => 'Footer Owner',
            'branding:url' => 'Footer URL',
            'branding:mark' => 'Header Mark',
            'branding:logo' => 'Logo',
            'branding:start_year' => 'Copyright Start Year',
            'branding:dashboard_title' => 'Dashboard Title',
            'branding:dashboard_subtitle' => 'Dashboard Subtitle',
            'branding:dashboard_image' => 'Dashboard Image',
            'branding:panel_pet_enabled' => 'Panel Pet',
            'pterodactyl:auth:2fa_required' => 'Require 2-Factor Authentication',
            'app:locale' => 'Default Language',
        ];
    }
}

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
            'branding:theme_preset' => 'required|string|in:makima,crimson-glass,pure-black,minimal-light',
            'branding:accent' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'branding:glass_strength' => 'required|integer|min:0|max:30',
            'branding:card_radius' => 'required|integer|min:6|max:20',
            'branding:motion_enabled' => 'required|integer|in:0,1',
            'branding:login_media' => 'nullable|string|max:500',
            'branding:login_title' => 'required|string|max:80',
            'branding:login_subtitle' => 'nullable|string|max:120',
            'branding:console_background' => 'nullable|string|max:500',
            'branding:console_background_opacity' => 'required|integer|min:5|max:45',
            'branding:console_font_size' => 'required|integer|min:10|max:18',
            'branding:console_scanlines' => 'required|integer|in:0,1',
            'branding:status_enabled' => 'required|integer|in:0,1',
            'branding:status_title' => 'required|string|max:80',
            'branding:status_message' => 'nullable|string|max:240',
            'branding:status_show_nodes' => 'required|integer|in:0,1',
            'branding:status_node_mode' => 'required|string|in:all,operational_only,summary_only',
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
            'branding:theme_preset' => 'Theme Preset',
            'branding:accent' => 'Accent Color',
            'branding:glass_strength' => 'Glass Strength',
            'branding:card_radius' => 'Card Radius',
            'branding:motion_enabled' => 'Interface Motion',
            'branding:login_media' => 'Login Media',
            'branding:login_title' => 'Login Title',
            'branding:login_subtitle' => 'Login Subtitle',
            'branding:console_background' => 'Console Background',
            'branding:console_background_opacity' => 'Console Background Opacity',
            'branding:console_font_size' => 'Console Font Size',
            'branding:console_scanlines' => 'Console Scanlines',
            'branding:status_enabled' => 'Public Status Page',
            'branding:status_title' => 'Status Title',
            'branding:status_message' => 'Status Message',
            'branding:status_show_nodes' => 'Show Node Details',
            'branding:status_node_mode' => 'Node Filter Mode',
            'pterodactyl:auth:2fa_required' => 'Require 2-Factor Authentication',
            'app:locale' => 'Default Language',
        ];
    }
}

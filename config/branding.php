<?php

return [
    'owner' => env('BRAND_OWNER', 'DevRock'),
    'url' => env('BRAND_URL', ''),
    'mark' => env('BRAND_MARK', '//'),
    'logo' => env('BRAND_LOGO', ''),
    'start_year' => (int) env('BRAND_START_YEAR', 2022),
    'dashboard_title' => env('BRAND_DASHBOARD_TITLE', 'Your infrastructure, without the noise.'),
    'dashboard_subtitle' => env('BRAND_DASHBOARD_SUBTITLE', 'Welcome back, {username}.'),
    'dashboard_image' => env('BRAND_DASHBOARD_IMAGE', ''),
    'panel_pet_enabled' => filter_var(env('BRAND_PANEL_PET_ENABLED', true), FILTER_VALIDATE_BOOL),
];

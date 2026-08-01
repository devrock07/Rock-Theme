@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Settings
@endsection

@section('content-header')
    <h1>Settings</h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">General</h3>
                </div>
                <form action="{{ route('admin.settings') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Panel Name</label>
                                <div>
                                    <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Require 2-Factor Authentication</label>
                                <div>
                                    <div class="btn-group" data-toggle="buttons">
                                        @php
                                            $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                                        @endphp
                                        <label class="btn btn-primary @if ($level == 0) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> Not Required
                                        </label>
                                        <label class="btn btn-primary @if ($level == 1) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> Admin Only
                                        </label>
                                        <label class="btn btn-primary @if ($level == 2) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> All Users
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Default Language</label>
                                <div>
                                    <select name="app:locale" class="form-control">
                                        @foreach($languages as $key => $value)
                                            <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-header with-border">
                        <h3 class="box-title">Dashboard</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Dashboard Title</label>
                                <input type="text" class="form-control" name="branding:dashboard_title" value="{{ old('branding:dashboard_title', config('branding.dashboard_title')) }}" maxlength="100" />
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Dashboard Subtitle</label>
                                <input type="text" class="form-control" name="branding:dashboard_subtitle" value="{{ old('branding:dashboard_subtitle', config('branding.dashboard_subtitle')) }}" maxlength="160" />
                                <p class="text-muted"><small>Use <code>{username}</code> for the signed-in user.</small></p>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Dashboard Image</label>
                                <input type="text" class="form-control" name="branding:dashboard_image" value="{{ old('branding:dashboard_image', config('branding.dashboard_image')) }}" placeholder="/branding/hero.png or https://..." maxlength="500" />
                            </div>
                        </div>
                    </div>
                    <div class="box-header with-border">
                        <h3 class="box-title">Console</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-8">
                                <label class="control-label">Background Media</label>
                                <input type="text" class="form-control" name="branding:console_background" value="{{ old('branding:console_background', config('branding.console_background')) }}" placeholder="/branding/console.webp, .gif, .mp4 or https://..." maxlength="500" />
                                <p class="text-muted"><small>Supports images, animated GIFs, MP4, WebM, OGG and MOV. Leave blank for the standard console.</small></p>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Media Visibility</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" name="branding:console_background_opacity" value="{{ old('branding:console_background_opacity', config('branding.console_background_opacity', 18)) }}" min="5" max="45" step="1" />
                                    <span class="input-group-addon">%</span>
                                </div>
                                <p class="text-muted"><small>Recommended: 12-24% for readable output.</small></p>
                            </div>
                        </div>
                    </div>
                    <div class="box-header with-border">
                        <h3 class="box-title">Branding</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Footer Owner</label>
                                <input type="text" class="form-control" name="branding:owner" value="{{ old('branding:owner', config('branding.owner')) }}" />
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Footer URL</label>
                                <input type="url" class="form-control" name="branding:url" value="{{ old('branding:url', config('branding.url')) }}" placeholder="https://example.com" />
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Header Mark</label>
                                <input type="text" class="form-control" name="branding:mark" value="{{ old('branding:mark', config('branding.mark')) }}" maxlength="12" />
                            </div>
                            <div class="form-group col-md-8">
                                <label class="control-label">Logo</label>
                                <input type="text" class="form-control" name="branding:logo" value="{{ old('branding:logo', config('branding.logo')) }}" placeholder="/branding/logo.png or https://..." maxlength="500" />
                                <p class="text-muted"><small>Optional. Leave blank to use the header mark.</small></p>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Start Year</label>
                                <input type="number" class="form-control" name="branding:start_year" value="{{ old('branding:start_year', config('branding.start_year')) }}" min="1900" max="{{ date('Y') }}" />
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

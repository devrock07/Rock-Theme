@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <p class="admin-kicker">Admin</p>
    <h1>Overview</h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Index</li>
    </ol>
@endsection

@section('content')
<div class="admin-status-strip">
    <div>
        <span class="admin-live-dot"></span>
        <span>Online</span>
    </div>
    <span>Panel {{ config('app.version') }}</span>
</div>
<div class="row admin-overview-grid">
    <div class="col-xs-12">
        <div class="box
            @if($version->isLatestPanel())
                box-success
            @else
                box-danger
            @endif
        ">
            <div class="box-header with-border">
                <h3 class="box-title">Version</h3>
            </div>
            <div class="box-body">
                @if ($version->isLatestPanel())
                    <span class="release-line">Theme <code>{{ config('app.fork-version') }}</code></span>
                    <span class="release-line">Panel <code>{{ config('app.version') }}</code></span>
                    <span class="release-state"><i class="fa fa-check"></i> Current</span>
                @else
                    Your panel is <strong>not up-to-date!</strong> The latest version is <a href="https://github.com/Pterodactyl/Panel/releases/v{{ $version->getPanel() }}" target="_blank" rel="noopener noreferrer"><code>{{ $version->getPanel() }}</code></a> and you are currently running version <code>{{ config('app.version') }}</code>. Review the Rockdactyl update notes on <a href="https://github.com/devrock07/Rockdactyl" target="_blank" rel="noopener noreferrer">GitHub</a>.
                @endif
            </div>
        </div>
    </div>
</div>
<div class="row admin-resource-grid">
    <div class="col-xs-6 col-sm-3">
        <a class="admin-resource-link" href="{{ $version->getDiscord() }}"><i class="fa fa-fw fa-support"></i><span>Discord</span><i class="fa fa-arrow-up"></i></a>
    </div>
    <div class="col-xs-6 col-sm-3">
        <a class="admin-resource-link" href="https://pterodactyl.io"><i class="fa fa-fw fa-link"></i><span>Docs</span><i class="fa fa-arrow-up"></i></a>
    </div>
    <div class="clearfix visible-xs-block">&nbsp;</div>
    <div class="col-xs-6 col-sm-3">
        <a class="admin-resource-link" href="https://github.com/pterodactyl/panel"><i class="fa fa-fw fa-github"></i><span>GitHub</span><i class="fa fa-arrow-up"></i></a>
    </div>
    <div class="col-xs-6 col-sm-3">
        <a class="admin-resource-link" href="{{ $version->getDonations() }}"><i class="fa fa-fw fa-heart-o"></i><span>Sponsor</span><i class="fa fa-arrow-up"></i></a>
    </div>
</div>
@endsection

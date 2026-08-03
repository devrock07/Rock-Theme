<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('rock_user_preferences', function (Blueprint $table) {
            $table->unsignedInteger('user_id')->primary();
            $table->json('server_preferences');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('rock_telemetry_samples', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('server_id');
            $table->timestamp('recorded_at');
            $table->string('state', 24)->default('unknown');
            $table->decimal('cpu', 10, 3)->default(0);
            $table->unsignedBigInteger('memory')->default(0);
            $table->unsignedBigInteger('disk')->default(0);
            $table->unsignedBigInteger('network_rx')->default(0);
            $table->unsignedBigInteger('network_tx')->default(0);
            $table->unique(['server_id', 'recorded_at']);
            $table->foreign('server_id')->references('id')->on('servers')->cascadeOnDelete();
        });

        Schema::create('rock_notifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('server_id')->nullable();
            $table->string('type', 32);
            $table->string('title');
            $table->text('message');
            $table->string('href')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('server_id')->references('id')->on('servers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rock_notifications');
        Schema::dropIfExists('rock_telemetry_samples');
        Schema::dropIfExists('rock_user_preferences');
    }
};

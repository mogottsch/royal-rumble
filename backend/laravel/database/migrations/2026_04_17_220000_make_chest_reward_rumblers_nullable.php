<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->foreignId("offender_rumbler_id")->nullable()->change();
            $table->foreignId("victim_rumbler_id")->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->foreignId("offender_rumbler_id")->nullable(false)->change();
            $table->foreignId("victim_rumbler_id")->nullable(false)->change();
        });
    }
};

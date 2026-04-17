<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->unsignedSmallInteger("minimum_self_schluecke")->default(0);
            $table->unsignedSmallInteger("minimum_self_shots")->default(0);
        });
    }

    public function down(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->dropColumn([
                "minimum_self_schluecke",
                "minimum_self_shots",
            ]);
        });
    }
};

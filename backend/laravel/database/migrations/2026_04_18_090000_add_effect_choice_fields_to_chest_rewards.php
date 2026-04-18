<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->json("choice_options")->nullable()->after("pending_shots");
            $table->string("selected_choice_key")->nullable()->after("choice_options");
        });
    }

    public function down(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->dropColumn([
                "choice_options",
                "selected_choice_key",
            ]);
        });
    }
};

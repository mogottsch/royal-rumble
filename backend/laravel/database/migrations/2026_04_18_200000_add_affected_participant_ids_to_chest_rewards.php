<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->json("affected_participant_ids")->nullable()->after("result_participant_id");
        });
    }

    public function down(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->dropColumn("affected_participant_ids");
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->foreignId("target_participant_id")->nullable()->constrained("participants")->nullOnDelete();
            $table->foreignId("result_participant_id")->nullable()->constrained("participants")->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table("chest_rewards", function (Blueprint $table) {
            $table->dropForeign(["target_participant_id"]);
            $table->dropForeign(["result_participant_id"]);
            $table->dropColumn(["target_participant_id", "result_participant_id"]);
        });
    }
};

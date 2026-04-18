<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("participants", function (Blueprint $table) {
            $table->unsignedSmallInteger("drunk_sips")->default(0)->after("rumbler_id");
            $table->unsignedSmallInteger("drunk_shots")->default(0)->after("drunk_sips");
            $table->unsignedSmallInteger("drunk_chugs")->default(0)->after("drunk_shots");
        });
    }

    public function down(): void
    {
        Schema::table("participants", function (Blueprint $table) {
            $table->dropColumn(["drunk_sips", "drunk_shots", "drunk_chugs"]);
        });
    }
};

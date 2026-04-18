<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create("royal_rumble_entries", function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId("wrestler_id")->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger("year");
            $table->unsignedSmallInteger("entrance_number");
            $table->unsignedInteger("source_cm_id")->nullable();
            $table->string("source_wrestler_name");
            $table->unique(["year", "entrance_number"]);
            $table->index(["wrestler_id", "year"]);
            $table->index(["year", "entrance_number"]);
            $table->index(["year", "source_cm_id"]);
        });
    }

    public function down()
    {
        Schema::dropIfExists("royal_rumble_entries");
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("rumblers", function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->unsignedSmallInteger("entrance_number");

            $table->foreignId("lobby_id")->constrained();
            $table->foreignId("wrestler_id")->constrained();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("rumblers");
    }
};

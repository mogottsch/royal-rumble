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
        Schema::create("participants", function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string("name");
            $table->unsignedSmallInteger("entrance_number")->nullable();

            $table->foreignId("lobby_id")->constrained();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("participants");
    }
};

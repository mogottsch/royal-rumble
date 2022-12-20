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
        Schema::create("actions", function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->unsignedInteger("index");

            $table
                ->foreignId("lobby_id")
                ->nullable()
                ->constrained();
            $table
                ->foreignId("rumbler_id")
                ->nullable()
                ->constrained();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("actions");
    }
};

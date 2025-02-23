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
        Schema::table("participants", function (Blueprint $table) {
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
        Schema::table("participants", function (Blueprint $table) {
            $table->dropForeign(["rumbler_id"]);
            $table->dropColumn("rumbler_id");
        });
    }
};

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
        Schema::table("actions", function (Blueprint $table) {
            $table
                ->foreignId("elimination_id")
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
        Schema::table("actions", function (Blueprint $table) {
            $table->dropForeign(["elimination_id"]);
            $table->dropColumn("elimination_id");
        });
    }
};

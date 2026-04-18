<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table("wrestlers", function (Blueprint $table) {
            $table->unsignedInteger("cm_id")->nullable()->unique()->after("name");
        });
    }

    public function down()
    {
        Schema::table("wrestlers", function (Blueprint $table) {
            $table->dropUnique(["cm_id"]);
            $table->dropColumn("cm_id");
        });
    }
};

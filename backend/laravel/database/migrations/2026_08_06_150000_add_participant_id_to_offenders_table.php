<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('offenders', 'participant_id')) {
            Schema::table('offenders', function (Blueprint $table) {
                $table->foreignId('participant_id')
                    ->nullable()
                    ->after('rumbler_id')
                    ->constrained()
                    ->nullOnDelete();
            });
        }

        // Historical ownership can only be reconstructed when exactly one participant
        // currently references the offender's wrestler slot. Ambiguous rows stay null
        // and retain the legacy current-owner fallback.
        DB::statement(<<<'SQL'
            UPDATE offenders
            SET participant_id = (
                SELECT MIN(participants.id)
                FROM participants
                WHERE participants.rumbler_id = offenders.rumbler_id
            )
            WHERE participant_id IS NULL
              AND (
                SELECT COUNT(*)
                FROM participants
                WHERE participants.rumbler_id = offenders.rumbler_id
              ) = 1
            SQL);
    }

    public function down(): void
    {
        Schema::table('offenders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('participant_id');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->assertNoDuplicates('rumblers', ['lobby_id', 'wrestler_id']);
        $this->assertNoDuplicates('rumblers', ['lobby_id', 'entrance_number']);
        $this->assertNoDuplicates('actions', ['lobby_id', 'index']);

        Schema::table('rumblers', function (Blueprint $table): void {
            $table->unique(['lobby_id', 'wrestler_id'], 'rumblers_lobby_wrestler_unique');
            $table->unique(['lobby_id', 'entrance_number'], 'rumblers_lobby_entrance_unique');
        });

        Schema::table('actions', function (Blueprint $table): void {
            $table->unique(['lobby_id', 'index'], 'actions_lobby_index_unique');
        });

        Schema::table('royal_rumble_entries', function (Blueprint $table): void {
            $table->boolean('entrance_order_verified')->default(false)->after('entrance_number');
        });
    }

    private function assertNoDuplicates(string $table, array $columns): void
    {
        $duplicates = DB::table($table)
            ->select($columns)
            ->selectRaw('COUNT(*) AS duplicate_count')
            ->groupBy($columns)
            ->havingRaw('COUNT(*) > 1')
            ->limit(10)
            ->get();

        if ($duplicates->isEmpty()) {
            return;
        }

        throw new RuntimeException(sprintf(
            'Cannot add game-state uniqueness constraint: duplicate %s(%s) rows exist. Resolve these groups and rerun the migration: %s',
            $table,
            implode(', ', $columns),
            $duplicates->toJson(),
        ));
    }

    public function down(): void
    {
        Schema::table('royal_rumble_entries', function (Blueprint $table): void {
            $table->dropColumn('entrance_order_verified');
        });

        Schema::table('actions', function (Blueprint $table): void {
            $table->dropUnique('actions_lobby_index_unique');
        });

        Schema::table('rumblers', function (Blueprint $table): void {
            $table->dropUnique('rumblers_lobby_wrestler_unique');
            $table->dropUnique('rumblers_lobby_entrance_unique');
        });
    }
};

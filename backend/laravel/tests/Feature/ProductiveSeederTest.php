<?php

namespace Tests\Feature;

use App\Models\Wrestler;
use Database\Seeders\ProductiveSeeder;
use File;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ProductiveSeederTest extends TestCase
{
    private string $originalStoragePath;

    private string $temporaryStoragePath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->originalStoragePath = app()->storagePath();
        $this->temporaryStoragePath = sys_get_temp_dir().'/royal-rumble-tests-'.bin2hex(random_bytes(8));
        app()->useStoragePath($this->temporaryStoragePath);

        File::ensureDirectoryExists(storage_path('app/royal_rumble_matches'));
    }

    protected function tearDown(): void
    {
        app()->useStoragePath($this->originalStoragePath);
        File::deleteDirectory($this->temporaryStoragePath);

        parent::tearDown();
    }

    public function test_alias_matching_links_historical_entries_to_existing_wrestler(): void
    {
        Wrestler::factory()->create([
            'name' => 'Undertaker',
            'cm_id' => null,
        ]);

        File::put(storage_path('app/saved_superstars.json'), json_encode([
            ['name' => 'Undertaker', 'file_name' => 'Undertaker.png'],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path('app/royal_rumble_matches/2007.json'), json_encode([
            'entrance_order' => ['status' => 'verified'],
            'wrestlers' => [
                ['name' => 'The Undertaker', 'cm_id' => 761, 'entrance_number' => 1],
            ],
        ], JSON_THROW_ON_ERROR));

        Artisan::call('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true]);

        $undertaker = Wrestler::query()->firstWhere('name', 'Undertaker');

        $this->assertNotNull($undertaker);
        $this->assertSame(761, $undertaker->cm_id);
        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 2007,
            'entrance_number' => 1,
            'wrestler_id' => $undertaker->id,
            'source_cm_id' => 761,
            'source_wrestler_name' => 'The Undertaker',
        ]);
    }

    public function test_prefers_a_verified_explicit_entrance_number(): void
    {
        Wrestler::factory()->create(['name' => 'Verified Wrestler', 'cm_id' => 456]);

        File::put(storage_path('app/saved_superstars.json'), json_encode([
            ['name' => 'Verified Wrestler', 'file_name' => null],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path('app/royal_rumble_matches/2020.json'), json_encode([
            'entrance_order' => ['status' => 'verified'],
            'wrestlers' => [[
                'name' => 'Verified Wrestler',
                'cm_id' => 456,
                'entrance_number' => 17,
            ]],
        ], JSON_THROW_ON_ERROR));

        Artisan::call('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true]);

        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 2020,
            'entrance_number' => 17,
            'source_cm_id' => 456,
        ]);
    }

    public function test_verified_known_positions_are_seeded_idempotently(): void
    {
        File::put(storage_path('app/saved_superstars.json'), json_encode([
            ['name' => 'Bret Hart', 'file_name' => null],
            ['name' => 'Hacksaw Jim Duggan', 'file_name' => null],
            ['name' => 'Rey Mysterio', 'file_name' => null],
            ['name' => 'Logan Paul', 'file_name' => null],
        ], JSON_THROW_ON_ERROR));

        $matches = [
            1988 => [1 => 'Bret Hart', 13 => 'Jim Duggan'],
            2025 => [1 => 'Rey Mysterio', 30 => 'Logan Paul'],
        ];
        foreach ($matches as $year => $knownNames) {
            $count = $year === 1988 ? 20 : 30;
            $wrestlers = [];
            for ($draw = 1; $draw <= $count; $draw++) {
                $wrestlers[] = [
                    'name' => $knownNames[$draw] ?? "Unmatched $year entrant $draw",
                    'cm_id' => null,
                    'entrance_number' => $draw,
                ];
            }
            File::put(storage_path("app/royal_rumble_matches/$year.json"), json_encode([
                'entrance_order' => ['status' => 'verified'],
                'wrestlers' => $wrestlers,
            ], JSON_THROW_ON_ERROR));
        }

        Artisan::call('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true]);
        Artisan::call('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true]);

        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 1988,
            'entrance_number' => 1,
            'wrestler_id' => Wrestler::query()->firstWhere('name', 'Bret Hart')->id,
        ]);
        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 1988,
            'entrance_number' => 13,
            'wrestler_id' => Wrestler::query()->firstWhere('name', 'Hacksaw Jim Duggan')->id,
        ]);
        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 2025,
            'entrance_number' => 1,
            'wrestler_id' => Wrestler::query()->firstWhere('name', 'Rey Mysterio')->id,
        ]);
        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 2025,
            'entrance_number' => 30,
            'wrestler_id' => Wrestler::query()->firstWhere('name', 'Logan Paul')->id,
        ]);
        $this->assertDatabaseCount('royal_rumble_entries', 50);
    }

    public function test_wrestler_seed_converges_without_erasing_historical_identity(): void
    {
        $existing = Wrestler::factory()->create([
            'name' => 'Existing Wrestler',
            'image_filename' => 'old.png',
            'cm_id' => 4242,
        ]);

        File::put(storage_path('app/saved_superstars.json'), json_encode([
            ['name' => 'Existing Wrestler', 'file_name' => 'new.webp'],
            ['name' => 'New Wrestler', 'file_name' => 'new.png'],
        ], JSON_THROW_ON_ERROR));

        Artisan::call('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true]);

        $this->assertSame(4242, $existing->fresh()->cm_id);
        $this->assertSame('new.webp', $existing->fresh()->image_filename);
        $this->assertDatabaseHas('wrestlers', [
            'name' => 'New Wrestler',
            'image_filename' => 'new.png',
        ]);
    }

    public function test_stats_preserve_legacy_appearances_without_fabricating_edge_positions(): void
    {
        File::put(storage_path('app/saved_superstars.json'), json_encode([
            ['name' => 'Edge Wrestler', 'file_name' => null],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path('app/royal_rumble_matches/2020.json'), json_encode([
            'entrance_order' => ['status' => 'verified'],
            'wrestlers' => [[
                'name' => 'Edge Wrestler',
                'cm_id' => null,
                'entrance_number' => 30,
            ]],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path('app/royal_rumble_matches/2023.json'), json_encode([
            'wrestlers' => [[
                'name' => 'Edge Wrestler',
                'cm_id' => null,
            ]],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path('app/royal_rumble_matches/legacy-unverified-years.json'), json_encode([
            'years' => ['2023' => 'source order is unverified'],
        ], JSON_THROW_ON_ERROR));

        Artisan::call('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true]);

        $wrestler = Wrestler::query()->firstWhere('name', 'Edge Wrestler');
        $this->assertSame([
            'appearances' => 2,
            'number_one_appearances' => 0,
            'number_thirty_appearances' => 1,
        ], $wrestler->royal_rumble_stats);
        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 2023,
            'entrance_number' => 1,
            'entrance_order_verified' => false,
        ]);
    }

    public function test_reports_unmatched_historical_entries(): void
    {
        File::put(storage_path('app/saved_superstars.json'), json_encode([
            ['name' => 'Known Wrestler', 'file_name' => 'Known Wrestler.png'],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path('app/royal_rumble_matches/1999.json'), json_encode([
            'entrance_order' => ['status' => 'verified'],
            'wrestlers' => [
                ['name' => 'Mystery Person', 'cm_id' => 999999, 'entrance_number' => 1],
            ],
        ], JSON_THROW_ON_ERROR));

        $this->artisan('db:seed', ['--class' => ProductiveSeeder::class, '--force' => true])
            ->expectsOutputToContain('Unmatched royal rumble entries: 1')
            ->expectsOutputToContain('1999 #1: Mystery Person')
            ->assertExitCode(0);

        $this->assertDatabaseHas('royal_rumble_entries', [
            'year' => 1999,
            'entrance_number' => 1,
            'wrestler_id' => null,
            'source_cm_id' => 999999,
            'source_wrestler_name' => 'Mystery Person',
        ]);
    }
}

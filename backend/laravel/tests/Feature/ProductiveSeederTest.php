<?php

namespace Tests\Feature;

use App\Models\RoyalRumbleEntry;
use App\Models\Wrestler;
use Database\Seeders\ProductiveSeeder;
use Illuminate\Support\Facades\Artisan;
use File;
use Tests\TestCase;

class ProductiveSeederTest extends TestCase
{
    private ?string $savedSuperstarsBackup = null;

    private array $royalRumbleMatchesBackup = [];

    protected function setUp(): void
    {
        parent::setUp();

        $savedSuperstarsPath = storage_path("app/saved_superstars.json");
        if (File::exists($savedSuperstarsPath)) {
            $this->savedSuperstarsBackup = File::get($savedSuperstarsPath);
        }

        $matchesDirectory = storage_path("app/royal_rumble_matches");
        if (File::isDirectory($matchesDirectory)) {
            foreach (File::files($matchesDirectory) as $file) {
                $this->royalRumbleMatchesBackup[$file->getFilename()] = File::get($file->getPathname());
            }
        }

        File::ensureDirectoryExists($matchesDirectory);
        File::cleanDirectory($matchesDirectory);
    }

    protected function tearDown(): void
    {
        $savedSuperstarsPath = storage_path("app/saved_superstars.json");
        if ($this->savedSuperstarsBackup === null) {
            File::delete($savedSuperstarsPath);
        } else {
            File::put($savedSuperstarsPath, $this->savedSuperstarsBackup);
        }

        $matchesDirectory = storage_path("app/royal_rumble_matches");
        File::ensureDirectoryExists($matchesDirectory);
        File::cleanDirectory($matchesDirectory);

        foreach ($this->royalRumbleMatchesBackup as $filename => $contents) {
            File::put($matchesDirectory . "/" . $filename, $contents);
        }

        parent::tearDown();
    }

    public function test_alias_matching_links_historical_entries_to_existing_wrestler(): void
    {
        Wrestler::factory()->create([
            "name" => "Undertaker",
            "cm_id" => null,
        ]);

        File::put(storage_path("app/saved_superstars.json"), json_encode([
            ["name" => "Undertaker", "file_name" => "Undertaker.png"],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path("app/royal_rumble_matches/2007.json"), json_encode([
            "wrestlers" => [
                ["name" => "The Undertaker", "cm_id" => 761],
            ],
        ], JSON_THROW_ON_ERROR));

        Artisan::call("db:seed", ["--class" => ProductiveSeeder::class, "--force" => true]);

        $undertaker = Wrestler::query()->firstWhere("name", "Undertaker");

        $this->assertNotNull($undertaker);
        $this->assertSame(761, $undertaker->cm_id);
        $this->assertDatabaseHas("royal_rumble_entries", [
            "year" => 2007,
            "entrance_number" => 1,
            "wrestler_id" => $undertaker->id,
            "source_cm_id" => 761,
            "source_wrestler_name" => "The Undertaker",
        ]);
    }

    public function test_reports_unmatched_historical_entries(): void
    {
        File::put(storage_path("app/saved_superstars.json"), json_encode([
            ["name" => "Known Wrestler", "file_name" => "Known Wrestler.png"],
        ], JSON_THROW_ON_ERROR));
        File::put(storage_path("app/royal_rumble_matches/1999.json"), json_encode([
            "wrestlers" => [
                ["name" => "Mystery Person", "cm_id" => 999999],
            ],
        ], JSON_THROW_ON_ERROR));

        $this->artisan("db:seed", ["--class" => ProductiveSeeder::class, "--force" => true])
            ->expectsOutputToContain("Unmatched royal rumble entries: 1")
            ->expectsOutputToContain("1999 #1: Mystery Person")
            ->assertExitCode(0);

        $this->assertDatabaseHas("royal_rumble_entries", [
            "year" => 1999,
            "entrance_number" => 1,
            "wrestler_id" => null,
            "source_cm_id" => 999999,
            "source_wrestler_name" => "Mystery Person",
        ]);
    }
}

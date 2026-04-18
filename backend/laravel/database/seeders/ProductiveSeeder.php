<?php

namespace Database\Seeders;

use App\Models\RoyalRumbleEntry;
use App\Models\Wrestler;
use File;
use Illuminate\Database\Seeder;

class ProductiveSeeder extends Seeder
{
    public function run()
    {
        if (!File::exists(storage_path("app/saved_superstars.json"))) {
            return;
        }

        $createdWrestlers = $this->seedWrestlers();
        $seededEntries = $this->seedRoyalRumbleEntries();

        if ($createdWrestlers > 0) {
            $this->command->info("Created $createdWrestlers wrestlers.");
        }

        if ($seededEntries > 0) {
            $this->command->info("Seeded $seededEntries royal rumble entries.");
        }
    }

    private function seedWrestlers(): int
    {
        if (Wrestler::query()->exists()) {
            return 0;
        }

        $wrestlersRaw = File::get(storage_path("app/saved_superstars.json"));
        $wrestlersJson = json_decode($wrestlersRaw, true);
        $wrestlers = [];

        foreach ($wrestlersJson as $wrestler) {
            $wrestlers[] = [
                "name" => $wrestler["name"],
                "image_filename" => $wrestler["file_name"],
            ];
        }

        Wrestler::insert($wrestlers);

        return count($wrestlers);
    }

    private function seedRoyalRumbleEntries(): int
    {
        $directory = storage_path("app/royal_rumble_matches");

        if (!File::isDirectory($directory)) {
            return 0;
        }

        $files = File::files($directory);
        $seededEntries = 0;

        foreach ($files as $file) {
            $year = (int) pathinfo($file->getFilename(), PATHINFO_FILENAME);
            $matchJson = json_decode(File::get($file->getPathname()), true);
            $wrestlers = $matchJson["wrestlers"] ?? [];

            foreach ($wrestlers as $index => $wrestlerData) {
                $wrestler = $this->matchWrestler($wrestlerData);

                RoyalRumbleEntry::updateOrCreate(
                    [
                        "year" => $year,
                        "entrance_number" => $index + 1,
                    ],
                    [
                        "wrestler_id" => $wrestler?->id,
                        "source_cm_id" => $wrestlerData["cm_id"] ?? null,
                        "source_wrestler_name" => $wrestlerData["name"],
                    ],
                );

                $seededEntries++;
            }
        }

        return $seededEntries;
    }

    private function matchWrestler(array $wrestlerData): ?Wrestler
    {
        $cmId = $wrestlerData["cm_id"] ?? null;

        if ($cmId !== null) {
            $matchedByCmId = Wrestler::query()->firstWhere("cm_id", $cmId);
            if ($matchedByCmId) {
                return $matchedByCmId;
            }
        }

        $matchedByName = Wrestler::query()->firstWhere("name", $wrestlerData["name"]);
        if (!$matchedByName) {
            return null;
        }

        if ($cmId !== null && $matchedByName->cm_id === null) {
            $matchedByName->cm_id = $cmId;
            $matchedByName->save();
        }

        return $matchedByName;
    }
}

<?php

namespace Database\Seeders;

use App\Models\RoyalRumbleEntry;
use App\Models\Wrestler;
use File;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductiveSeeder extends Seeder
{
    private const NAME_ALIASES = [
        "alexanderrusev" => "rusev",
        "andradealmas" => "andrade",
        "antoniocesaro" => "cesaro",
        "b2" => "rikishi",
        "badnewsbarrett" => "wadebarrett",
        "bigelangston" => "bige",
        "blackjackbradshaw" => "jbl",
        "bobholly" => "hardcoreholly",
        "bradshaw" => "jbl",
        "brutusbeefcake" => "brutusthebarberbeefcake",
        "buddymurphy" => "murphy",
        "butch" => "petedunne",
        "cactusjack" => "mickfoley",
        "chainsawcharlie" => "terryfunk",
        "crash" => "crashholly",
        "damienmizdow" => "damiensandow",
        "diesel" => "kevinnash",
        "dominikmysterio" => "dirtydominikmysterio",
        "doink" => "doinktheclown",
        "dudelove" => "mickfoley",
        "elmatador" => "titosantana",
        "epico" => "epicocolon",
        "faarooq" => "ronsimmons",
        "fatu" => "rikishi",
        "golga" => "earthquake",
        "gregoryhelms" => "thehurricane",
        "happycorbin" => "baroncorbin",
        "hunterhearsthelmsley" => "tripleh",
        "hunico" => "sincara",
        "huskyharris" => "braywyatt",
        "irwinrschyster" => "irs",
        "isaacyankemdds" => "kane",
        "jakeroberts" => "jakethesnakeroberts",
        "jamal" => "umaga",
        "jimduggan" => "hacksawjimduggan",
        "jimneidhart" => "jimtheanvilneidhart",
        "jessejammes" => "roaddogg",
        "johnbradshawlayfield" => "jbl",
        "johnnynitro" => "johnmorrison",
        "kkwik" => "rtruth",
        "keithlee" => "keithbearcatlee",
        "kingbooker" => "bookert",
        "kingcorbin" => "baroncorbin",
        "kingharleyrace" => "harleyrace",
        "kingsheamus" => "sheamus",
        "lashley" => "bobbylashley",
        "mankind" => "mickfoley",
        "mattcardona" => "zackryder",
        "matthardyversion10" => "matthardy",
        "mercury" => "joeymercury",
        "michaelmcgillicutty" => "curtisaxel",
        "montelvontaviousporter" => "mvp",
        "mrass" => "billygunn",
        "mrperfect" => "mrperfectcurthennig",
        "nitro" => "johnmorrison",
        "primo" => "primocolon",
        "rickrude" => "ravishingrickrude",
        "riddle" => "mattriddle",
        "rockymaivia" => "dwaynetherockjohnson",
        "sethrollins" => "sethfreakinrollins",
        "sidjustice" => "sid",
        "stardust" => "codyrhodes",
        "steveaustin" => "stonecoldsteveaustin",
        "tafkagoldust" => "goldust",
        "the1 2 3kid" => "xpac",
        "the123kid" => "xpac",
        "thegoodfather" => "thegodfather",
        "theonemangang" => "akeem",
        "theringmaster" => "stonecoldsteveaustin",
        "therock" => "dwaynetherockjohnson",
        "thesultan" => "rikishi",
        "theundertaker" => "undertaker",
        "thurmansparkyplugg" => "hardcoreholly",
        "tyedillinger" => "shawnspears",
        "typhoon" => "tugboat",
        "viscera" => "bigdaddyv",
    ];

    public function run()
    {
        if (!File::exists($this->savedSuperstarsPath())) {
            return;
        }

        $createdWrestlers = $this->seedWrestlers();
        [$seededEntries, $unmatchedEntries] = $this->seedRoyalRumbleEntries();

        if ($createdWrestlers > 0) {
            $this->command->info("Created $createdWrestlers wrestlers.");
        }

        if ($seededEntries > 0) {
            $this->command->info("Seeded $seededEntries royal rumble entries.");
        }

        if (count($unmatchedEntries) > 0) {
            $this->command->warn("Unmatched royal rumble entries: " . count($unmatchedEntries));

            foreach ($unmatchedEntries as $entry) {
                $this->command->warn(sprintf(
                    "%d #%d: %s",
                    $entry["year"],
                    $entry["entrance_number"],
                    $entry["name"],
                ));
            }
        }
    }

    private function seedWrestlers(): int
    {
        if (Wrestler::query()->exists()) {
            return 0;
        }

        $wrestlersRaw = File::get($this->savedSuperstarsPath());
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

    private function seedRoyalRumbleEntries(): array
    {
        $directory = $this->royalRumbleMatchesPath();

        if (!File::isDirectory($directory)) {
            return [0, []];
        }

        $files = File::files($directory);
        $seededEntries = 0;
        $unmatchedEntries = [];

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

                if ($wrestler === null) {
                    $unmatchedEntries[] = [
                        "year" => $year,
                        "entrance_number" => $index + 1,
                        "name" => $wrestlerData["name"],
                    ];
                }

                $seededEntries++;
            }
        }

        return [$seededEntries, $unmatchedEntries];
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
            $normalizedTarget = $this->canonicalizeName($wrestlerData["name"]);
            $matchedByName = Wrestler::query()
                ->get(["id", "name", "cm_id"])
                ->first(fn(Wrestler $wrestler) => $this->canonicalizeName($wrestler->name) === $normalizedTarget);
        }

        if (!$matchedByName) {
            return null;
        }

        if ($cmId !== null && $matchedByName->cm_id === null) {
            $matchedByName->cm_id = $cmId;
            $matchedByName->save();
        }

        return $matchedByName;
    }

    private function normalizeName(string $name): string
    {
        $normalized = Str::ascii(strtolower(trim($name)));
        $normalized = preg_replace('/^the\s+/i', '', $normalized) ?? $normalized;
        $normalized = preg_replace('/[^a-z0-9]+/', '', $normalized) ?? $normalized;

        return $normalized;
    }

    private function canonicalizeName(string $name): string
    {
        $normalized = $this->normalizeName($name);

        return self::NAME_ALIASES[$normalized] ?? $normalized;
    }

    private function savedSuperstarsPath(): string
    {
        $storagePath = storage_path("app/saved_superstars.json");
        if (File::exists($storagePath)) {
            return $storagePath;
        }

        return base_path("seed-data/saved_superstars.json");
    }

    private function royalRumbleMatchesPath(): string
    {
        $storagePath = storage_path("app/royal_rumble_matches");
        if (File::isDirectory($storagePath)) {
            return $storagePath;
        }

        return base_path("seed-data/royal_rumble_matches");
    }
}

<?php

namespace Database\Seeders;

use App\Models\RoyalRumbleEntry;
use App\Models\Wrestler;
use File;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductiveSeeder extends Seeder
{
    private const NAME_ALIASES = [
        'alexanderrusev' => 'rusev',
        'andradealmas' => 'andrade',
        'antoniocesaro' => 'cesaro',
        'b2' => 'rikishi',
        'badnewsbarrett' => 'wadebarrett',
        'bigelangston' => 'bige',
        'blackjackbradshaw' => 'jbl',
        'bobholly' => 'hardcoreholly',
        'bradshaw' => 'jbl',
        'brutusbeefcake' => 'brutusthebarberbeefcake',
        'buddymurphy' => 'murphy',
        'butch' => 'petedunne',
        'cactusjack' => 'mickfoley',
        'chainsawcharlie' => 'terryfunk',
        'crash' => 'crashholly',
        'damienmizdow' => 'damiensandow',
        'diesel' => 'kevinnash',
        'dominikmysterio' => 'dirtydominikmysterio',
        'doink' => 'doinktheclown',
        'dudelove' => 'mickfoley',
        'elmatador' => 'titosantana',
        'epico' => 'epicocolon',
        'faarooq' => 'ronsimmons',
        'fatu' => 'rikishi',
        'golga' => 'earthquake',
        'gregoryhelms' => 'thehurricane',
        'happycorbin' => 'baroncorbin',
        'hunterhearsthelmsley' => 'tripleh',
        'hunico' => 'sincara',
        'huskyharris' => 'braywyatt',
        'irwinrschyster' => 'irs',
        'isaacyankemdds' => 'kane',
        'jakeroberts' => 'jakethesnakeroberts',
        'jamal' => 'umaga',
        'jimduggan' => 'hacksawjimduggan',
        'jimneidhart' => 'jimtheanvilneidhart',
        'jessejammes' => 'roaddogg',
        'johnbradshawlayfield' => 'jbl',
        'johnnynitro' => 'johnmorrison',
        'kkwik' => 'rtruth',
        'keithlee' => 'keithbearcatlee',
        'kingbooker' => 'bookert',
        'kingcorbin' => 'baroncorbin',
        'kingharleyrace' => 'harleyrace',
        'kingsheamus' => 'sheamus',
        'lashley' => 'bobbylashley',
        'mankind' => 'mickfoley',
        'mattcardona' => 'zackryder',
        'matthardyversion10' => 'matthardy',
        'mercury' => 'joeymercury',
        'michaelmcgillicutty' => 'curtisaxel',
        'montelvontaviousporter' => 'mvp',
        'mrass' => 'billygunn',
        'mrperfect' => 'mrperfectcurthennig',
        'nitro' => 'johnmorrison',
        'primo' => 'primocolon',
        'rickrude' => 'ravishingrickrude',
        'riddle' => 'mattriddle',
        'rockymaivia' => 'dwaynetherockjohnson',
        'sethrollins' => 'sethfreakinrollins',
        'sidjustice' => 'sid',
        'stardust' => 'codyrhodes',
        'steveaustin' => 'stonecoldsteveaustin',
        'tafkagoldust' => 'goldust',
        'the1 2 3kid' => 'xpac',
        'the123kid' => 'xpac',
        'thegoodfather' => 'thegodfather',
        'theonemangang' => 'akeem',
        'theringmaster' => 'stonecoldsteveaustin',
        'therock' => 'dwaynetherockjohnson',
        'thesultan' => 'rikishi',
        'theundertaker' => 'undertaker',
        'thurmansparkyplugg' => 'hardcoreholly',
        'tyedillinger' => 'shawnspears',
        'typhoon' => 'tugboat',
        'viscera' => 'bigdaddyv',
    ];

    public function run()
    {
        if (! File::exists($this->savedSuperstarsPath())) {
            return;
        }

        $synchronizedWrestlers = $this->seedWrestlers();
        [$seededEntries, $unmatchedEntries] = $this->seedRoyalRumbleEntries();

        if ($synchronizedWrestlers > 0) {
            $this->command->info("Synchronized $synchronizedWrestlers wrestlers.");
        }

        if ($seededEntries > 0) {
            $this->command->info("Seeded $seededEntries royal rumble entries.");
        }

        if (count($unmatchedEntries) > 0) {
            $this->command->warn('Unmatched royal rumble entries: '.count($unmatchedEntries));

            foreach ($unmatchedEntries as $entry) {
                $this->command->warn(sprintf(
                    '%d #%d: %s',
                    $entry['year'],
                    $entry['entrance_number'],
                    $entry['name'],
                ));
            }
        }
    }

    private function seedWrestlers(): int
    {
        $wrestlersRaw = File::get($this->savedSuperstarsPath());
        $wrestlersJson = json_decode($wrestlersRaw, true, flags: JSON_THROW_ON_ERROR);
        $synchronized = 0;

        DB::transaction(function () use ($wrestlersJson, &$synchronized): void {
            foreach ($wrestlersJson as $wrestlerData) {
                $wrestler = Wrestler::query()->firstOrNew(['name' => $wrestlerData['name']]);
                $wrestler->image_filename = $wrestlerData['file_name'];

                if (! $wrestler->exists || $wrestler->isDirty()) {
                    $wrestler->save();
                    $synchronized++;
                }
            }
        });

        return $synchronized;
    }

    private function seedRoyalRumbleEntries(): array
    {
        $directory = $this->royalRumbleMatchesPath();

        if (! File::isDirectory($directory)) {
            return [0, []];
        }

        $files = collect(File::files($directory))
            ->filter(fn ($file) => preg_match('/^\d{4}\.json$/', $file->getFilename()) === 1)
            ->values();
        $seededEntries = 0;
        $unmatchedEntries = [];
        $legacyYears = $this->legacyUnverifiedYears($directory);
        $sourceYears = $files
            ->map(fn ($file) => (int) pathinfo($file->getFilename(), PATHINFO_FILENAME))
            ->all();

        DB::transaction(function () use (
            $files,
            $legacyYears,
            $sourceYears,
            &$seededEntries,
            &$unmatchedEntries,
        ): void {
            RoyalRumbleEntry::query()->whereNotIn('year', $sourceYears)->delete();

            foreach ($files as $file) {
                $year = (int) pathinfo($file->getFilename(), PATHINFO_FILENAME);
                $matchJson = json_decode(File::get($file->getPathname()), true, flags: JSON_THROW_ON_ERROR);
                $wrestlers = $matchJson['wrestlers'] ?? [];
                $verified = ($matchJson['entrance_order']['status'] ?? null) === 'verified';
                $legacy = array_key_exists((string) $year, $legacyYears);

                if (! $verified && ! $legacy) {
                    throw new \RuntimeException("$year has neither verified entrance order nor an explicit legacy marker.");
                }

                if ($legacy) {
                    $this->command->warn("Legacy unverified entrance order for $year: {$legacyYears[(string) $year]}");
                }

                RoyalRumbleEntry::query()->where('year', $year)->delete();

                foreach ($wrestlers as $index => $wrestlerData) {
                    if ($verified && ! isset($wrestlerData['entrance_number'])) {
                        // Preserved Cagematch objects such as managers are not entrants.
                        continue;
                    }

                    $entranceNumber = $verified
                        ? (int) $wrestlerData['entrance_number']
                        : $index + 1;
                    $wrestler = $this->matchWrestler($wrestlerData);

                    RoyalRumbleEntry::create([
                        'year' => $year,
                        'entrance_number' => $entranceNumber,
                        'entrance_order_verified' => $verified,
                        'wrestler_id' => $wrestler?->id,
                        'source_cm_id' => $wrestlerData['cm_id'] ?? null,
                        'source_wrestler_name' => $wrestlerData['name'],
                    ]);

                    if ($wrestler === null) {
                        $unmatchedEntries[] = [
                            'year' => $year,
                            'entrance_number' => $entranceNumber,
                            'name' => $wrestlerData['name'],
                        ];
                    }

                    $seededEntries++;
                }
            }
        });

        return [$seededEntries, $unmatchedEntries];
    }

    private function matchWrestler(array $wrestlerData): ?Wrestler
    {
        $cmId = $wrestlerData['cm_id'] ?? null;

        if ($cmId !== null) {
            $matchedByCmId = Wrestler::query()->firstWhere('cm_id', $cmId);
            if ($matchedByCmId) {
                return $matchedByCmId;
            }
        }

        $matchedByName = Wrestler::query()->firstWhere('name', $wrestlerData['name']);
        if (! $matchedByName) {
            $normalizedTarget = $this->canonicalizeName($wrestlerData['name']);
            $matchedByName = Wrestler::query()
                ->get(['id', 'name', 'cm_id'])
                ->first(fn (Wrestler $wrestler) => $this->canonicalizeName($wrestler->name) === $normalizedTarget);
        }

        if (! $matchedByName) {
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

    private function legacyUnverifiedYears(string $directory): array
    {
        $path = $directory.'/legacy-unverified-years.json';
        if (! File::exists($path)) {
            return [];
        }

        $payload = json_decode(File::get($path), true, flags: JSON_THROW_ON_ERROR);

        return $payload['years'] ?? [];
    }

    private function savedSuperstarsPath(): string
    {
        $storagePath = storage_path('app/saved_superstars.json');
        if (File::exists($storagePath)) {
            return $storagePath;
        }

        return $this->seedDataPath('saved_superstars.json');
    }

    private function royalRumbleMatchesPath(): string
    {
        $storagePath = storage_path('app/royal_rumble_matches');
        if (
            File::isDirectory($storagePath)
            && collect(File::files($storagePath))
                ->contains(fn ($file) => preg_match('/^\d{4}\.json$/', $file->getFilename()) === 1)
        ) {
            return $storagePath;
        }

        return $this->seedDataPath('royal_rumble_matches');
    }

    private function seedDataPath(string $relativePath): string
    {
        $root = env('SEED_DATA_PATH');

        return $root ? rtrim($root, '/').'/'.$relativePath : base_path('seed-data/'.$relativePath);
    }
}

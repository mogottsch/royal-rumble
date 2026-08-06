<?php

namespace Tests\Feature;

use App\Exceptions\DrinkDistributionException;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use App\Models\Wrestler;
use App\Services\DrinkDistributionRecorder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\CreatesApplication;
use Throwable;

class PostgresDistributionConcurrencyTest extends BaseTestCase
{
    use CreatesApplication;

    public function test_simultaneous_classic_distributions_commit_exactly_once(): void
    {
        if (config('database.default') !== 'pgsql') {
            $this->markTestSkipped('PostgreSQL concurrency test requires DB_CONNECTION=pgsql.');
        }
        if (! function_exists('pcntl_fork') || ! function_exists('pcntl_waitpid')) {
            $this->markTestSkipped('PostgreSQL concurrency test requires the pcntl extension.');
        }

        $originalConnection = DB::getDefaultConnection();
        $database = 'royal_rumble_concurrency_'.getmypid();
        $resultDirectory = sys_get_temp_dir().'/'.$database;
        $startFile = $resultDirectory.'/start';
        $adminConfig = config('database.connections.pgsql');
        $adminConfig['database'] = 'postgres';
        $testConfig = config('database.connections.pgsql');
        $testConfig['database'] = $database;

        config()->set('database.connections.concurrency_admin', $adminConfig);
        config()->set('database.connections.concurrency_pgsql', $testConfig);
        mkdir($resultDirectory, 0700, true);

        try {
            DB::connection('concurrency_admin')->statement('CREATE DATABASE "'.$database.'"');
            DB::setDefaultConnection('concurrency_pgsql');
            Artisan::call('migrate:fresh', [
                '--database' => 'concurrency_pgsql',
                '--force' => true,
            ]);

            [$lobby, $giver, $receiver, $offender, $victim, $elimination] = $this->game();
            $arguments = [
                'lobby_id' => $lobby->id,
                'giver_id' => $giver->id,
                'offender_id' => $offender->id,
                'victim_id' => $victim->id,
                'elimination_id' => $elimination->id,
                'receiver_id' => $receiver->id,
            ];

            $children = [];
            for ($worker = 1; $worker <= 2; $worker++) {
                $pid = pcntl_fork();
                if ($pid === -1) {
                    throw new RuntimeException('Unable to fork concurrency test worker.');
                }
                if ($pid === 0) {
                    $this->runWorker($worker, $startFile, $resultDirectory, $arguments);
                }
                $children[] = $pid;
            }

            touch($startFile);
            foreach ($children as $pid) {
                pcntl_waitpid($pid, $status);
                $this->assertTrue(pcntl_wifexited($status));
                $this->assertSame(0, pcntl_wexitstatus($status));
            }

            DB::purge('concurrency_pgsql');
            DB::setDefaultConnection('concurrency_pgsql');
            $results = [
                trim((string) file_get_contents($resultDirectory.'/worker-1')),
                trim((string) file_get_contents($resultDirectory.'/worker-2')),
            ];
            sort($results);

            $this->assertSame(['already-distributed', 'created'], $results);
            $this->assertSame(1, DB::table('drink_distributions')->count());
        } finally {
            DB::disconnect('concurrency_pgsql');
            DB::setDefaultConnection($originalConnection);
            DB::purge('concurrency_pgsql');

            try {
                $admin = DB::connection('concurrency_admin');
                $admin->statement(
                    'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ?',
                    [$database]
                );
                $admin->statement('DROP DATABASE IF EXISTS "'.$database.'"');
            } catch (Throwable) {
                // Preserve the primary test failure if database cleanup also fails.
            }

            DB::disconnect('concurrency_admin');
            if (is_dir($resultDirectory)) {
                foreach (glob($resultDirectory.'/*') ?: [] as $file) {
                    unlink($file);
                }
                rmdir($resultDirectory);
            }
        }
    }

    private function runWorker(
        int $worker,
        string $startFile,
        string $resultDirectory,
        array $arguments
    ): never {
        while (! file_exists($startFile)) {
            usleep(1_000);
        }

        DB::purge('concurrency_pgsql');
        DB::setDefaultConnection('concurrency_pgsql');

        try {
            app(DrinkDistributionRecorder::class)->recordEliminationReward(
                Lobby::query()->findOrFail($arguments['lobby_id']),
                Elimination::query()->findOrFail($arguments['elimination_id']),
                Rumbler::query()->findOrFail($arguments['offender_id']),
                Rumbler::query()->findOrFail($arguments['victim_id']),
                Participant::query()->findOrFail($arguments['giver_id']),
                [[
                    'receiver_participant_id' => $arguments['receiver_id'],
                    'schluecke' => 4,
                    'shots' => 1,
                ]]
            );
            $result = 'created';
        } catch (DrinkDistributionException) {
            $result = 'already-distributed';
        } catch (Throwable $exception) {
            $result = 'error:'.$exception::class.':'.$exception->getMessage();
        }

        file_put_contents($resultDirectory.'/worker-'.$worker, $result);
        exit(0);
    }

    private function game(): array
    {
        $lobby = Lobby::factory()->create([
            'schluecke_per_elimination' => 4,
            'shots_per_elimination' => 1,
            'mystery_chests_enabled' => false,
        ]);
        $giver = Participant::factory()->for($lobby)->create(['entrance_number' => 1]);
        $receiver = Participant::factory()->for($lobby)->create(['entrance_number' => 2]);
        $offender = Rumbler::factory()
            ->for($lobby)
            ->for(Wrestler::factory())
            ->create(['entrance_number' => 1]);
        $victim = Rumbler::factory()
            ->for($lobby)
            ->for(Wrestler::factory())
            ->create(['entrance_number' => 2]);
        $giver->rumbler()->associate($offender);
        $giver->save();
        $receiver->rumbler()->associate($victim);
        $receiver->save();

        $elimination = Elimination::factory()->create();
        $elimination->rumblerOffenders()->attach($offender->id, [
            'participant_id' => $giver->id,
        ]);
        $elimination->rumblerVictims()->attach($victim->id);

        return [$lobby, $giver, $receiver, $offender, $victim, $elimination];
    }
}

<?php

namespace Tests\Feature;

use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Wrestler;
use App\Services\EntranceRecorder;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\CreatesApplication;
use Throwable;

class PostgresStateConcurrencyTest extends BaseTestCase
{
    use CreatesApplication;

    public function test_simultaneous_entrances_receive_distinct_numbers_and_action_indexes(): void
    {
        $this->withPostgresDatabase(function (string $resultDirectory, string $startFile): void {
            $lobby = Lobby::factory()->create(['rumble_size' => 30]);
            $wrestlers = Wrestler::factory()->count(2)->create();

            $children = [];
            foreach ($wrestlers as $worker => $wrestler) {
                $children[] = $this->forkWorker(function () use ($worker, $wrestler, $lobby, $startFile, $resultDirectory): void {
                    $this->awaitStart($startFile);
                    $this->reconnectWorker();
                    try {
                        $rumbler = app(EntranceRecorder::class)->record(
                            Lobby::query()->findOrFail($lobby->id),
                            Wrestler::query()->findOrFail($wrestler->id)
                        );
                        $result = 'created:'.$rumbler->entrance_number;
                    } catch (Throwable $exception) {
                        $result = 'error:'.$exception::class.':'.$exception->getMessage();
                    }
                    file_put_contents($resultDirectory.'/worker-'.($worker + 1), $result);
                });
            }

            touch($startFile);
            $this->waitForChildren($children);
            $results = $this->workerResults($resultDirectory, 2);
            sort($results);

            $this->assertSame(['created:1', 'created:2'], $results);
            $this->assertSame([1, 2], DB::table('rumblers')->orderBy('entrance_number')->pluck('entrance_number')->all());
            $this->assertSame([0, 1], DB::table('actions')->orderBy('index')->pluck('index')->all());
        });
    }

    public function test_simultaneous_drink_progress_updates_merge_monotonically(): void
    {
        $this->withPostgresDatabase(function (string $resultDirectory, string $startFile): void {
            $lobby = Lobby::factory()->create();
            $participant = Participant::factory()->for($lobby)->create();
            $payloads = [
                ['drunk_sips' => 5, 'drunk_shots' => 0, 'drunk_chugs' => 0],
                ['drunk_sips' => 0, 'drunk_shots' => 3, 'drunk_chugs' => 0],
            ];

            $children = [];
            foreach ($payloads as $worker => $payload) {
                $children[] = $this->forkWorker(function () use ($worker, $payload, $lobby, $participant, $startFile, $resultDirectory): void {
                    $this->awaitStart($startFile);
                    $this->reconnectWorker();
                    $request = Request::create(
                        "/api/lobbies/{$lobby->code}/participants/{$participant->id}/drink-progress",
                        'PATCH',
                        [],
                        [],
                        [],
                        [
                            'CONTENT_TYPE' => 'application/json',
                            'HTTP_ACCEPT' => 'application/json',
                            'HTTP_X_PARTICIPANT_ID' => (string) $participant->id,
                        ],
                        json_encode($payload, JSON_THROW_ON_ERROR)
                    );
                    $kernel = app(Kernel::class);
                    $response = $kernel->handle($request);
                    $kernel->terminate($request, $response);
                    file_put_contents($resultDirectory.'/worker-'.($worker + 1), (string) $response->getStatusCode());
                });
            }

            touch($startFile);
            $this->waitForChildren($children);
            $this->assertSame(['200', '200'], $this->workerResults($resultDirectory, 2));

            $participant->refresh();
            $this->assertSame(5, $participant->drunk_sips);
            $this->assertSame(3, $participant->drunk_shots);
        });
    }

    private function withPostgresDatabase(callable $test): void
    {
        if (config('database.default') !== 'pgsql') {
            $this->markTestSkipped('PostgreSQL concurrency test requires DB_CONNECTION=pgsql.');
        }
        if (! function_exists('pcntl_fork') || ! function_exists('pcntl_waitpid')) {
            $this->markTestSkipped('PostgreSQL concurrency test requires the pcntl extension.');
        }

        $originalConnection = DB::getDefaultConnection();
        $database = 'royal_rumble_state_'.getmypid().'_'.bin2hex(random_bytes(3));
        $resultDirectory = sys_get_temp_dir().'/'.$database;
        $startFile = $resultDirectory.'/start';
        $adminConfig = config('database.connections.pgsql');
        $adminConfig['database'] = 'postgres';
        $testConfig = config('database.connections.pgsql');
        $testConfig['database'] = $database;
        config()->set('database.connections.state_admin', $adminConfig);
        config()->set('database.connections.state_pgsql', $testConfig);
        mkdir($resultDirectory, 0700, true);

        try {
            DB::connection('state_admin')->statement('CREATE DATABASE "'.$database.'"');
            DB::setDefaultConnection('state_pgsql');
            Artisan::call('migrate:fresh', ['--database' => 'state_pgsql', '--force' => true]);
            $test($resultDirectory, $startFile);
        } finally {
            DB::disconnect('state_pgsql');
            DB::setDefaultConnection($originalConnection);
            DB::purge('state_pgsql');
            try {
                $admin = DB::connection('state_admin');
                $admin->statement('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ?', [$database]);
                $admin->statement('DROP DATABASE IF EXISTS "'.$database.'"');
            } catch (Throwable) {
                // Preserve the primary assertion failure.
            }
            DB::disconnect('state_admin');
            foreach (glob($resultDirectory.'/*') ?: [] as $file) {
                unlink($file);
            }
            @rmdir($resultDirectory);
        }
    }

    private function forkWorker(callable $callback): int
    {
        $pid = pcntl_fork();
        if ($pid === -1) {
            throw new RuntimeException('Unable to fork concurrency test worker.');
        }
        if ($pid === 0) {
            try {
                $callback();
                exit(0);
            } catch (Throwable $exception) {
                fwrite(STDERR, $exception::class.': '.$exception->getMessage().PHP_EOL);
                exit(1);
            }
        }

        return $pid;
    }

    private function awaitStart(string $startFile): void
    {
        while (! file_exists($startFile)) {
            usleep(1_000);
        }
    }

    private function reconnectWorker(): void
    {
        DB::purge('state_pgsql');
        DB::setDefaultConnection('state_pgsql');
    }

    private function waitForChildren(array $children): void
    {
        foreach ($children as $pid) {
            pcntl_waitpid($pid, $status);
            $this->assertTrue(pcntl_wifexited($status));
            $this->assertSame(0, pcntl_wexitstatus($status));
        }
        DB::purge('state_pgsql');
        DB::setDefaultConnection('state_pgsql');
    }

    private function workerResults(string $resultDirectory, int $count): array
    {
        $results = [];
        for ($worker = 1; $worker <= $count; $worker++) {
            $results[] = trim((string) file_get_contents($resultDirectory.'/worker-'.$worker));
        }

        return $results;
    }
}

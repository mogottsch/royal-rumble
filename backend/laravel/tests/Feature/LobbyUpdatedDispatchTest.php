<?php

namespace Tests\Feature;

use App\Events\LobbyUpdated;
use App\Models\Lobby;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class LobbyUpdatedDispatchTest extends TestCase
{
    public function test_lobby_update_is_not_dispatched_when_transaction_rolls_back(): void
    {
        $this->withIndependentDatabase(function (Lobby $lobby): void {
            Event::fake([LobbyUpdated::class]);

            DB::beginTransaction();
            LobbyUpdated::dispatchAfterCommit($lobby);
            DB::rollBack();

            Event::assertNotDispatched(LobbyUpdated::class);
        });
    }

    public function test_lobby_update_is_dispatched_once_after_commit(): void
    {
        $this->withIndependentDatabase(function (Lobby $lobby): void {
            Event::fake([LobbyUpdated::class]);

            DB::beginTransaction();
            LobbyUpdated::dispatchAfterCommit($lobby);
            Event::assertNotDispatched(LobbyUpdated::class);
            DB::commit();

            Event::assertDispatchedTimes(LobbyUpdated::class, 1);
        });
    }

    public function test_broadcaster_failure_is_logged_without_failing_committed_mutation(): void
    {
        $this->withIndependentDatabase(function (Lobby $lobby): void {
            $originalDispatcher = app('events');
            $throwingDispatcher = Mockery::mock(Dispatcher::class);
            $throwingDispatcher
                ->shouldReceive('dispatch')
                ->once()
                ->andThrow(new RuntimeException('broadcast unavailable'));
            app()->instance('events', $throwingDispatcher);
            Log::spy();

            try {
                DB::beginTransaction();
                $lobby->code = 'COMMITTED';
                $lobby->save();
                LobbyUpdated::dispatchAfterCommit($lobby);
                DB::commit();
            } finally {
                app()->instance('events', $originalDispatcher);
            }

            $this->assertSame('COMMITTED', $lobby->fresh()->code);
            Log::shouldHaveReceived('error')
                ->once()
                ->withArgs(fn (string $message, array $context): bool => $message === 'Failed to broadcast lobby update after commit.'
                    && $context['lobby_id'] === $lobby->id
                    && $context['exception'] instanceof RuntimeException
                );
        });
    }

    private function withIndependentDatabase(callable $test): void
    {
        $originalConnection = DB::getDefaultConnection();
        config()->set('database.connections.broadcast_test', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);
        DB::purge('broadcast_test');
        DB::setDefaultConnection('broadcast_test');

        try {
            Schema::create('lobbies', function (Blueprint $table): void {
                $table->id();
                $table->string('code')->unique();
                $table->timestamps();
            });

            $lobby = new Lobby;
            $lobby->code = 'TEST';
            $lobby->save();

            $test($lobby);
        } finally {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            DB::disconnect('broadcast_test');
            DB::setDefaultConnection($originalConnection);
            DB::purge('broadcast_test');
        }
    }
}

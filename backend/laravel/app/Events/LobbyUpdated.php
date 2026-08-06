<?php

namespace App\Events;

use App\Http\Resources\LobbyResource;
use App\Models\Lobby;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class LobbyUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public LobbyResource $lobby;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(private Lobby $lobbyModel)
    {
        $this->lobby = new LobbyResource($this->lobbyModel);
    }

    public static function dispatchAfterCommit(Lobby $lobby): void
    {
        DB::afterCommit(function () use ($lobby): void {
            try {
                self::dispatch($lobby->fresh());
            } catch (Throwable $exception) {
                Log::error('Failed to broadcast lobby update after commit.', [
                    'exception' => $exception,
                    'lobby_id' => $lobby->id,
                ]);
            }
        });
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        // return new PrivateChannel("lobbies.{$this->lobby->id}");
        return new Channel("lobbies.{$this->lobby->id}");
    }

    public function broadcastAs()
    {
        return 'lobby-updated';
    }
}

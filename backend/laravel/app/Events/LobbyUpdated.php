<?php

namespace App\Events;

use App\Http\Resources\LobbyResource;
use App\Models\Lobby;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

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

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // return new PrivateChannel("lobbies.{$this->lobby->id}");
        return new Channel("lobbies.{$this->lobby->id}");
    }

    public function broadcastAs()
    {
        return "lobby-updated";
    }
}

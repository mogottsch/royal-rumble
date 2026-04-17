<?php

namespace App\Http\Resources;

use App\Models\Lobby;
use App\Services\EntranceNumberAssigner;
use Illuminate\Http\Resources\Json\JsonResource;

class LobbyResource extends JsonResource
{
    private Lobby $lobby;
    private EntranceNumberAssigner $entranceNumberAssigner;

    public function __construct($resource)
    {
        parent::__construct($resource);
        $this->entranceNumberAssigner = app(EntranceNumberAssigner::class);
    }

    public function toArray($request)
    {
        if ($this->resource instanceof Lobby) {
            $this->lobby = $this->resource;
        } else {
            throw new \Exception("Resource is not a Lobby");
        }
        $this->lobby->loadFrontendEssentials();
        return [
            "id" => $this->lobby->id,
            "code" => $this->lobby->code,
            "settings" => $this->lobby->getSettings(),
            "participants" => $this->lobby->participants,
            "rumblers" => RumblerResource::collection($this->lobby->rumblers),
            "nextEntranceNumber" => $this->entranceNumberAssigner->getNextRumblerEntranceNumber($this->lobby),
            "actions" => ActionResource::collection($this->lobby->actions),
            "drink_config" => $this->lobby->getDrinkConfig(),
            "drink_distributions" => $this->lobby->drinkDistributions,
            "chugs" => $this->lobby->chugs,
            "chest_rewards" => $this->lobby->chestRewards,
        ];
    }
}

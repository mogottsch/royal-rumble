<?php

namespace App\Http\Resources;

use App\Models\Lobby;
use Illuminate\Http\Resources\Json\JsonResource;

class LobbyResource extends JsonResource
{
    private Lobby $lobby;
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
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
            "participants" => $this->lobby->participants,
            "rumblers" => RumblerResource::collection($this->lobby->rumblers),
        ];
    }
}

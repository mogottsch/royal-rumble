<?php

namespace App\Http\Resources;

use App\Models\Rumbler;
use Illuminate\Http\Resources\Json\JsonResource;

class RumblerResource extends JsonResource
{
    private Rumbler $rumbler;
    public function toArray($request)
    {
        if ($this->resource instanceof Rumbler) {
            $this->rumbler = $this->resource;
        } else {
            throw new \Exception("Resource is not a Rumbler");
        }

        return [
            "id" => $this->rumbler->id,
            "created_at" => $this->rumbler->created_at,
            "updated_at" => $this->rumbler->updated_at,
            "entrance_number" => $this->rumbler->entrance_number,
            "lobby_id" => $this->rumbler->lobby_id,
            "wrestler_id" => $this->rumbler->wrestler_id,
            "wrestler" => $this->rumbler->wrestler,
            "is_eliminated" => $this->rumbler->isEliminated(),
            "participant" => $this->rumbler->participant,
        ];
    }
}

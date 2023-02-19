<?php

namespace App\Http\Resources;

use App\Models\Action;
use Illuminate\Http\Resources\Json\JsonResource;

class ActionResource extends JsonResource
{
    private Action $action;
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        if ($this->resource instanceof Action) {
            $this->action = $this->resource;
        } else {
            throw new \Exception("Resource is not an Action");
        }
        return [
            "id" => $this->action->id,
            "lobby_id" => $this->action->lobby_id,
            "type" => $this->action->getType(),
            "rumbler" => $this->action->rumbler,
            "elimination" => $this->action->elimination,
        ];
    }
}

<?php

namespace App\Http\Resources;

use App\Models\Action;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActionResource extends JsonResource
{
    private Action $action;

    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array|Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        if ($this->resource instanceof Action) {
            $this->action = $this->resource;
        } else {
            throw new \Exception('Resource is not an Action');
        }

        return [
            'id' => $this->action->id,
            'created_at' => $this->action->created_at,
            'updated_at' => $this->action->updated_at,
            'lobby_id' => $this->action->lobby_id,
            'type' => $this->action->getType(),
            'rumbler' => $this->action->rumbler,
            'elimination' => $this->action->elimination,
        ];
    }
}

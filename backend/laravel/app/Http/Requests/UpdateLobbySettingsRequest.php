<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLobbySettingsRequest extends FormRequest
{
    public function rules()
    {
        return [
            "rumble_size" => ["required", "integer", "min:1", "max:100"],
            "schluecke_per_elimination" => ["required", "integer", "min:0", "max:100"],
            "shots_per_elimination" => ["required", "integer", "min:0", "max:100"],
            "schluecke_on_npc_elimination" => ["required", "integer", "min:0", "max:100"],
            "shots_on_npc_elimination" => ["required", "integer", "min:0", "max:100"],
        ];
    }
}

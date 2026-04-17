<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLobbyRequest extends FormRequest
{
    public function rules()
    {
        return [
            "participants" => ["required", "array"],
            "schluecke_per_elimination" => ["nullable", "integer", "min:0", "max:100"],
            "shots_per_elimination" => ["nullable", "integer", "min:0", "max:100"],
            "schluecke_on_npc_elimination" => ["nullable", "integer", "min:0", "max:100"],
            "shots_on_npc_elimination" => ["nullable", "integer", "min:0", "max:100"],
        ];
    }
}

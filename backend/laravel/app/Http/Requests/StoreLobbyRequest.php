<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLobbyRequest extends FormRequest
{
    public function rules()
    {
        return [
            "participants" => ["required", "array"],
            "rumble_size" => ["nullable", "integer", "min:1", "max:100"],
            "schluecke_per_elimination" => ["nullable", "integer", "min:0", "max:100"],
            "shots_per_elimination" => ["nullable", "integer", "min:0", "max:100"],
            "schluecke_on_npc_elimination" => ["nullable", "integer", "min:0", "max:100"],
            "shots_on_npc_elimination" => ["nullable", "integer", "min:0", "max:100"],
        ];
    }

    public function after(): array
    {
        return [function ($validator) {
            $participants = $this->input("participants", []);
            $rumbleSize = $this->input("rumble_size", 30);
            if (!is_array($participants)) {
                return;
            }
            if ((int) $rumbleSize < count($participants)) {
                $validator->errors()->add(
                    "rumble_size",
                    "Rumble size cannot be lower than the number of participants."
                );
            }
        }];
    }
}

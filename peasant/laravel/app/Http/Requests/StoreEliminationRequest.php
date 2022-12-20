<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEliminationRequest extends FormRequest
{
    public function rules()
    {
        return [
            "victim_ids.*" => ["required", "exists:rumblers,id"],
            "offender_ids.*" => ["required", "exists:rumblers,id"],
        ];
    }
}

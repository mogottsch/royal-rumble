<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRumblerRequest extends FormRequest
{
    public function rules()
    {
        return [
            "wrestler_id" => ["required", "integer", "exists:wrestlers,id"],
        ];
    }
}

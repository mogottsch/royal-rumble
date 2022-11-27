<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLobbyRequest extends FormRequest
{
    public function rules()
    {
        return [
            "participants" => ["required", "array"],
        ];
    }
}

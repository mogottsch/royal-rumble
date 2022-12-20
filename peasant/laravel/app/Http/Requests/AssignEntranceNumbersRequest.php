<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignEntranceNumbersRequest extends FormRequest
{
    public function rules()
    {
        return [
            "participantEntranceNumbers" => ["required", "array"],
            "participantEntranceNumbers.*" => ["required", "integer", "min:1"],
        ];
    }
}

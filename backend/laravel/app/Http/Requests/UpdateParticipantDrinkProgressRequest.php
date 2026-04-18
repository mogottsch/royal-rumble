<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateParticipantDrinkProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            "drunk_sips" => ["required", "integer", "min:0", "max:1000"],
            "drunk_shots" => ["required", "integer", "min:0", "max:1000"],
            "drunk_chugs" => ["required", "integer", "min:0", "max:1000"],
        ];
    }
}

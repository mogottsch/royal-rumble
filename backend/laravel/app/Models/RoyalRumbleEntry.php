<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoyalRumbleEntry extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        "year" => "integer",
        "entrance_number" => "integer",
        "source_cm_id" => "integer",
    ];

    public function wrestler()
    {
        return $this->belongsTo(Wrestler::class);
    }
}

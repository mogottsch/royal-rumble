<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Elimination extends Model
{
    use HasFactory;

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function rumblerVictims()
    {
        return $this->belongsToMany(Rumbler::class, "victims");
    }

    public function rumblerOffenders()
    {
        return $this->belongsToMany(Rumbler::class, "offenders");
    }
}

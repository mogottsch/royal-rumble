<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rumbler extends Model
{
    use HasFactory;

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }
    public function wrestler()
    {
        return $this->belongsTo(Wrestler::class);
    }

    public function participant()
    {
        return $this->hasOne(Participant::class);
    }

    public function offenderEliminations()
    {
        return $this->belongsToMany(Elimination::class, "offenders");
    }

    public function victimEliminations()
    {
        return $this->belongsToMany(Elimination::class, "victims");
    }

    public function isEliminated()
    {
        return $this->victimEliminations->count() > 0;
    }
}

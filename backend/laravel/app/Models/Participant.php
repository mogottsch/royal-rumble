<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function rumbler()
    {
        return $this->belongsTo(Rumbler::class);
    }

    public function distributionsGiven()
    {
        return $this->hasMany(DrinkDistribution::class, "giver_participant_id");
    }

    public function distributionsReceived()
    {
        return $this->hasMany(DrinkDistribution::class, "receiver_participant_id");
    }

    public function chugs()
    {
        return $this->hasMany(Chug::class);
    }
}

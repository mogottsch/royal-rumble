<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DrinkDistribution extends Model
{
    use HasFactory;

    const KIND_ELIMINATION_REWARD = "elimination_reward";
    const KIND_NPC_ELIMINATION_PENALTY = "npc_elimination_penalty";

    protected $guarded = [];

    protected $casts = [
        "schluecke" => "integer",
        "shots" => "integer",
    ];

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function elimination()
    {
        return $this->belongsTo(Elimination::class);
    }

    public function offenderRumbler()
    {
        return $this->belongsTo(Rumbler::class, "offender_rumbler_id");
    }

    public function victimRumbler()
    {
        return $this->belongsTo(Rumbler::class, "victim_rumbler_id");
    }

    public function giver()
    {
        return $this->belongsTo(Participant::class, "giver_participant_id");
    }

    public function receiver()
    {
        return $this->belongsTo(Participant::class, "receiver_participant_id");
    }
}

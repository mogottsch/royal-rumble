<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChestReward extends Model
{
    use HasFactory;

    const STATUS_PENDING_CHOICE = "pending_choice";
    const STATUS_PENDING_DISTRIBUTION = "pending_distribution";
    const STATUS_RESOLVED = "resolved";

    protected $guarded = [];

    protected $casts = [
        "pending_schluecke" => "integer",
        "pending_shots" => "integer",
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

    public function chooser()
    {
        return $this->belongsTo(Participant::class, "chooser_participant_id");
    }
}

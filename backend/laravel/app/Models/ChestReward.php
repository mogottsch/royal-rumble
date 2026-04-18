<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChestReward extends Model
{
    use HasFactory;

    const STATUS_PENDING_CHOICE = "pending_choice";
    const STATUS_REVEALED_EFFECT_CHOICE = "revealed_effect_choice";
    const STATUS_PENDING_EFFECT_CHOICE = "pending_effect_choice";
    const STATUS_REVEALED_TARGET_PICK = "revealed_target_pick";
    const STATUS_PENDING_TARGET_PICK = "pending_target_pick";
    const STATUS_REVEALED_AUTO = "revealed_auto";
    const STATUS_REVEALED_DISTRIBUTION = "revealed_distribution";
    const STATUS_PENDING_DISTRIBUTION = "pending_distribution";
    const STATUS_RESOLVED = "resolved";

    protected $guarded = [];

    protected $casts = [
        "pending_schluecke" => "integer",
        "pending_shots" => "integer",
        "choice_options" => "array",
        "minimum_self_schluecke" => "integer",
        "minimum_self_shots" => "integer",
        "target_participant_id" => "integer",
        "result_participant_id" => "integer",
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

    public function targetParticipant()
    {
        return $this->belongsTo(Participant::class, "target_participant_id");
    }

    public function resultParticipant()
    {
        return $this->belongsTo(Participant::class, "result_participant_id");
    }
}

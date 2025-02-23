<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    const TYPE_ELIMINATION = "elimination";
    const TYPE_ENTRANCE = "entrance";

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function rumbler()
    {
        return $this->belongsTo(Rumbler::class);
    }

    public function elimination()
    {
        return $this->belongsTo(Elimination::class);
    }

    public function getType()
    {
        if ($this->elimination_id) {
            return self::TYPE_ELIMINATION;
        }
        if ($this->rumbler_id) {
            return self::TYPE_ENTRANCE;
        }
        throw new Exception("Action has no type");
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Victim extends Pivot
{
    protected $table = "victims";

    public function elimination()
    {
        return $this->belongsTo(Elimination::class);
    }

    public function rumbler()
    {
        return $this->belongsTo(Rumbler::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Offender extends Pivot
{
    protected $table = "offenders";

    public function elimination()
    {
        return $this->belongsTo(Elimination::class);
    }

    public function rumbler()
    {
        return $this->belongsTo(Rumbler::class);
    }
}

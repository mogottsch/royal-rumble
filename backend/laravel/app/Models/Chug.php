<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chug extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function elimination()
    {
        return $this->belongsTo(Elimination::class);
    }
}

<?php

namespace App\Models;

use App\Services\LobbyCodeGenerator;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lobby extends Model
{
    use HasFactory;

    public static function make()
    {
        $lobby = new Lobby();
        $lobby->initialize();
        $lobby->save();
        return $lobby;
    }

    private function initialize()
    {
        $this->code = (new LobbyCodeGenerator())->generate();
    }

    public static function create()
    {
        $lobby = self::make();
        $lobby->save();
        return $lobby;
    }

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    public function rumblers()
    {
        return $this->hasMany(Rumbler::class);
    }

    public function actions()
    {
        return $this->hasMany(Action::class);
    }

    public function latestAction()
    {
        return $this->hasMany(Action::class)
            ->latest()
            ->first();
    }
}

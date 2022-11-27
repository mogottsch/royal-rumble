<?php

namespace App\Models;

use App\Services\LobbyCodeGenerator;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lobby extends Model
{
    use HasFactory;

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

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
}

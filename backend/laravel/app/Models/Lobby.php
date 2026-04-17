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

    public function drinkDistributions()
    {
        return $this->hasMany(DrinkDistribution::class);
    }

    public function chugs()
    {
        return $this->hasMany(Chug::class);
    }

    public function getDrinkConfig(): array
    {
        return [
            "schluecke_per_elimination" => $this->schluecke_per_elimination,
            "shots_per_elimination" => $this->shots_per_elimination,
            "schluecke_on_npc_elimination" => $this->schluecke_on_npc_elimination,
            "shots_on_npc_elimination" => $this->shots_on_npc_elimination,
        ];
    }

    public function latestAction()
    {
        return $this->hasMany(Action::class)
            ->latest()
            ->first();
    }

    public function loadFrontendEssentials()
    {
        $this->loadMissing([
            "participants",
            "rumblers",
            "rumblers.wrestler",
            "rumblers.participant",
            "actions",
            "actions.rumbler.wrestler",
            "actions.elimination.rumblerVictims.wrestler",
            "actions.elimination.rumblerVictims.participant",
            "actions.elimination.rumblerOffenders.wrestler",
            "actions.elimination.rumblerOffenders.participant",
            "drinkDistributions",
            "drinkDistributions.receiver",
            "drinkDistributions.giver",
            "drinkDistributions.offenderRumbler.wrestler",
            "drinkDistributions.victimRumbler.wrestler",
            "chugs",
            "chugs.participant",
        ]);
    }
}

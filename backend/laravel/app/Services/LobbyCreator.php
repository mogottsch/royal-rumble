<?php

namespace App\Services;

use App\Models\Lobby;
use App\Models\Participant;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class LobbyCreator
{
    public function createWithParticipants(Collection $participantNames, array $drinkConfig = []): Lobby
    {
        $this->validateParticipantNames($participantNames);
        $lobby = new Lobby();
        $lobby->code = (new LobbyCodeGenerator())->generate();
        $this->applyDrinkConfig($lobby, $drinkConfig);
        $lobby->save();

        foreach ($participantNames as $participantName) {
            $participant = new Participant();
            $participant->name = $participantName;
            $participant->lobby()->associate($lobby);
            $participant->save();
        }

        $lobby->load("participants");
        return $lobby;
    }

    private function applyDrinkConfig(Lobby $lobby, array $config): void
    {
        $allowed = [
            "schluecke_per_elimination",
            "shots_per_elimination",
            "schluecke_on_npc_elimination",
            "shots_on_npc_elimination",
        ];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $config) && $config[$key] !== null) {
                $lobby->{$key} = (int) $config[$key];
            }
        }
    }

    private function validateParticipantNames(Collection $participantNames)
    {
        if ($participantNames->isEmpty()) {
            throw new InvalidArgumentException("No participants provided");
        }

        if ($participantNames->contains("")) {
            throw new InvalidArgumentException(
                "Empty participant name provided"
            );
        }

        if (
            $participantNames->count() !== $participantNames->unique()->count()
        ) {
            throw new InvalidArgumentException(
                "Duplicate participant name provided"
            );
        }
    }
}

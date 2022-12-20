<?php

namespace App\Services;

use App\Models\Lobby;
use App\Models\Participant;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class LobbyCreator
{
    public function createWithParticipants(Collection $participantNames): Lobby
    {
        $this->validateParticipantNames($participantNames);
        $lobby = Lobby::create();
        foreach ($participantNames as $participantName) {
            $participant = new Participant();
            $participant->name = $participantName;
            $participant->lobby()->associate($lobby);
            $participant->save();
        }

        $lobby->load("participants");
        return $lobby;
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

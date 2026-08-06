<?php

namespace App\Services;

use App\Models\Lobby;
use App\Models\Participant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LobbyCreator
{
    public function createWithParticipants(Collection $participantNames, array $drinkConfig = []): Lobby
    {
        $this->validateParticipantNames($participantNames);

        return DB::transaction(function () use ($participantNames, $drinkConfig): Lobby {
            $lobby = new Lobby;
            $lobby->code = (new LobbyCodeGenerator)->generate();
            $this->applyDrinkConfig($lobby, $drinkConfig);
            $lobby->save();

            foreach ($participantNames as $participantName) {
                $participant = new Participant;
                $participant->name = $participantName;
                $participant->lobby()->associate($lobby);
                $participant->save();
            }

            $lobby->load('participants');

            return $lobby;
        });
    }

    private function applyDrinkConfig(Lobby $lobby, array $config): void
    {
        $allowed = [
            'rumble_size',
            'schluecke_per_elimination',
            'shots_per_elimination',
            'schluecke_on_npc_elimination',
            'shots_on_npc_elimination',
            'mystery_chests_enabled',
            'chest_aggression_multiplier',
        ];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $config) && $config[$key] !== null) {
                $lobby->{$key} = $key === 'chest_aggression_multiplier'
                    ? (float) $config[$key]
                    : (is_bool($config[$key]) ? $config[$key] : (int) $config[$key]);
            }
        }
    }

    private function validateParticipantNames(Collection $participantNames)
    {
        if ($participantNames->isEmpty()) {
            throw new InvalidArgumentException('No participants provided');
        }

        if ($participantNames->contains(
            fn ($name) => ! is_string($name) || trim($name) === '' || mb_strlen($name) > 100
        )) {
            throw new InvalidArgumentException(
                'Invalid participant name provided'
            );
        }

        if (
            $participantNames->count() !== $participantNames->uniqueStrict()->count()
        ) {
            throw new InvalidArgumentException(
                'Duplicate participant name provided'
            );
        }
    }
}

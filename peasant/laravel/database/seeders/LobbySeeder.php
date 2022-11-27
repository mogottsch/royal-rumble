<?php

namespace Database\Seeders;

use App\Models\Lobby;
use Illuminate\Database\Seeder;

class LobbySeeder extends Seeder
{
    const LOBBY_COUNT = 2;
    const LOBBY_PARTICIPANT_COUNT = 5;

    public function run()
    {
        $lobbies = Lobby::factory()
            ->count(self::LOBBY_COUNT)
            ->hasParticipants(self::LOBBY_PARTICIPANT_COUNT)
            ->create();

        $this->updateParticipantEntranceNumbers($lobbies);
    }

    private function updateParticipantEntranceNumbers($lobbies)
    {
        foreach ($lobbies as $lobby) {
            $this->updateParticipantEntranceNumbersIn($lobby);
        }
    }

    private function updateParticipantEntranceNumbersIn(Lobby $lobby)
    {
        $participants = $lobby->participants;
        $participants->each(function ($participant, $index) {
            $participant->entrance_number = $index + 1;
            $participant->save();
        });
    }
}

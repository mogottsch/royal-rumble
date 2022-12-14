<?php

namespace Database\Seeders;

use App\Models\Lobby;
use App\Models\Rumbler;
use App\Models\Wrestler;
use Illuminate\Database\Seeder;

class LobbySeeder extends Seeder
{
    const LOBBY_COUNT = 2;
    const LOBBY_PARTICIPANT_COUNT = 5;
    const LOBBY_RUMBLER_COUNT = 10;

    public function run()
    {
        $wrestlers = Wrestler::all();

        $lobbies = Lobby::factory()
            ->count(self::LOBBY_COUNT)
            ->hasParticipants(self::LOBBY_PARTICIPANT_COUNT)
            ->hasRumblers(self::LOBBY_RUMBLER_COUNT, [
                "wrestler_id" => $wrestlers->random()->id,
            ])
            ->create();

        $this->updateParticipantEntranceNumbers($lobbies);
        $this->updateRumblersEntranceNumbers($lobbies);
        $this->assignRumblersToParticipants($lobbies);
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

    private function updateRumblersEntranceNumbers($lobbies)
    {
        foreach ($lobbies as $lobby) {
            $this->updateRumblersEntranceNumbersIn($lobby);
        }
    }

    private function updateRumblersEntranceNumbersIn(Lobby $lobby)
    {
        $rumblers = $lobby->rumblers;
        $rumblers->each(function ($rumbler, $index) {
            $rumbler->entrance_number = $index + 1;
            $rumbler->save();
        });
    }

    private function assignRumblersToParticipants($lobbies)
    {
        foreach ($lobbies as $lobby) {
            $this->assignRumblersToParticipantsIn($lobby);
        }
    }

    private function assignRumblersToParticipantsIn(Lobby $lobby)
    {
        $participants = $lobby->participants;
        $rumblers = $lobby->rumblers;
        foreach ($rumblers as $rumbler) {
            $participant = $participants->firstWhere(
                "entrance_number",
                $rumbler->entrance_number
            );
            if (!$participant) {
                continue;
            }
            $participant->rumbler()->associate($rumbler);
            $participant->save();
        }
    }
}

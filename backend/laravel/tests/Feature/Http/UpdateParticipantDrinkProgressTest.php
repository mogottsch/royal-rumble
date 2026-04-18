<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use Illuminate\Http\Response;
use Tests\TestCase;

class UpdateParticipantDrinkProgressTest extends TestCase
{
    public function test_updates_participant_drink_progress()
    {
        $lobby = Lobby::factory()->hasParticipants(3)->create();
        $participant = $lobby->participants()->firstOrFail();

        $response = $this->patchJson(
            route("lobbies.participants.drinkProgress.update", [
                "lobby" => $lobby,
                "participant" => $participant,
            ]),
            [
                "drunk_sips" => 7,
                "drunk_shots" => 2,
                "drunk_chugs" => 1,
            ],
            ["X-Participant-Id" => (string) $participant->id]
        );

        $response->assertStatus(Response::HTTP_OK);
        $this->assertDatabaseHas("participants", [
            "id" => $participant->id,
            "lobby_id" => $lobby->id,
            "drunk_sips" => 7,
            "drunk_shots" => 2,
            "drunk_chugs" => 1,
        ]);
    }

    public function test_rejects_participant_from_other_lobby()
    {
        $lobby = Lobby::factory()->hasParticipants(2)->create();
        $otherLobby = Lobby::factory()->hasParticipants(2)->create();
        $participant = $otherLobby->participants()->firstOrFail();

        $response = $this->patchJson(
            route("lobbies.participants.drinkProgress.update", [
                "lobby" => $lobby,
                "participant" => $participant,
            ]),
            [
                "drunk_sips" => 1,
                "drunk_shots" => 0,
                "drunk_chugs" => 0,
            ],
            ["X-Participant-Id" => (string) $participant->id]
        );

        $response->assertStatus(Response::HTTP_NOT_FOUND);
    }

    public function test_rejects_progress_update_without_matching_participant_header()
    {
        $lobby = Lobby::factory()->hasParticipants(2)->create();
        $participants = $lobby->participants()->get();
        $participant = $participants[0];
        $otherParticipant = $participants[1];

        $response = $this->patchJson(
            route("lobbies.participants.drinkProgress.update", [
                "lobby" => $lobby,
                "participant" => $participant,
            ]),
            [
                "drunk_sips" => 1,
                "drunk_shots" => 0,
                "drunk_chugs" => 0,
            ],
            ["X-Participant-Id" => (string) $otherParticipant->id]
        );

        $response->assertStatus(Response::HTTP_FORBIDDEN);
    }
}

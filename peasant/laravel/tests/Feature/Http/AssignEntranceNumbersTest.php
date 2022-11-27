<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use Illuminate\Http\Response;
use Tests\TestCase;

class AssignEntranceNumbersTest extends TestCase
{
    private Lobby $lobby;

    public function setUp(): void
    {
        parent::setUp();
        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();
    }

    public function test_assign_entrance_numbers()
    {
        $participantsEntranceNumbersMap = [
            $this->lobby->participants[0]->id => 1,
            $this->lobby->participants[1]->id => 2,
            $this->lobby->participants[2]->id => 3,
            $this->lobby->participants[3]->id => 4,
        ];
        $body = [
            "participantEntranceNumbers" => $participantsEntranceNumbersMap,
        ];
        $response = $this->put(
            route("lobbies.assignEntranceNumbers", $this->lobby),
            $body
        );

        $this->lobby = $this->lobby->fresh("participants");

        $response->assertStatus(Response::HTTP_OK);
        $this->assertEquals(
            $participantsEntranceNumbersMap,
            $this->lobby->participants
                ->pluck("entrance_number", "id")
                ->toArray()
        );
    }

    public function test_assign_entrance_numbers_with_missing_entrance_number()
    {
        $participantsEntranceNumbersMap = [
            $this->lobby->participants[0]->id => 1,
            $this->lobby->participants[1]->id => 2,
            $this->lobby->participants[2]->id => 3,
        ];
        $body = [
            "participantEntranceNumbers" => $participantsEntranceNumbersMap,
        ];
        $response = $this->put(
            route("lobbies.assignEntranceNumbers", $this->lobby),
            $body
        );

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function test_malformed_request()
    {
        $body = [
            "participantEntranceNumbers" => "not a map",
        ];
        $response = $this->putJson(
            route("lobbies.assignEntranceNumbers", $this->lobby),
            $body
        );

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

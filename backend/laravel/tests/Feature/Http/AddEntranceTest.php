<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use App\Models\Wrestler;
use Illuminate\Http\Response;
use Tests\TestCase;

class AddEntranceTest extends TestCase
{
    private Lobby $lobby;

    public function setUp(): void
    {
        parent::setUp();
        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();
    }

    public function test_records_two_entrances()
    {
        $wrestlers = Wrestler::factory()->count(2)->create();

        foreach ($wrestlers as $wrestler) {
            $body = ["wrestler_id" => $wrestler->id];
            $response = $this->postJson(
                route("lobbies.entrance", $this->lobby),
                $body
            );

            $response->assertStatus(Response::HTTP_CREATED);
            $this->assertDatabaseHas("rumblers", [
                "wrestler_id" => $wrestler->id,
                "lobby_id" => $this->lobby->id,
            ]);
        }
    }

    public function test_does_not_record_same_wrestler()
    {
        $wrestler = Wrestler::factory()->create();

        $body = ["wrestler_id" => $wrestler->id];
        $response = $this->postJson(
            route("lobbies.entrance", $this->lobby),
            $body
        );

        $response->assertStatus(Response::HTTP_CREATED);
        $this->assertDatabaseHas("rumblers", [
            "wrestler_id" => $wrestler->id,
            "lobby_id" => $this->lobby->id,
        ]);

        $response = $this->postJson(
            route("lobbies.entrance", $this->lobby),
            $body
        );

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
        $wrestlerInLobby = $this->lobby
            ->rumblers()
            ->where("wrestler_id", $wrestler->id)
            ->count();
        $this->assertEquals(1, $wrestlerInLobby);
    }
}

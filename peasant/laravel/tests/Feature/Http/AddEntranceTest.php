<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use App\Models\Wrestler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\Response;
use Tests\TestCase;

class AddEntranceTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();
    }

    public function test_records_two_entrances()
    {
        $wrestlers = Wrestler::all()->take(2);

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
        $wrestler = Wrestler::first();

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

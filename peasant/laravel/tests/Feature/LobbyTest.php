<?php

namespace Tests\Feature;

use App\Models\Lobby;
use Tests\TestCase;

class LobbyTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_create_lobby()
    {
        $lobby = Lobby::factory()->create();
        $this->assertNotNull($lobby->id);
    }

    public function test_create_lobby_with_participants()
    {
        $lobby = Lobby::factory()
            ->hasParticipants(5)
            ->create();
        $this->assertNotNull($lobby->participants->first()->id);
    }

    public function test_find_lobby_by_code()
    {
        $lobby = Lobby::factory()->create();
        $foundLobby = Lobby::where("code", $lobby->code)->first();
        $this->assertEquals($lobby->id, $foundLobby->id);
    }

    public function test_lobby_has_participants()
    {
        $lobby = Lobby::factory()
            ->hasParticipants(5)
            ->create();
        $this->assertEquals(5, $lobby->participants()->count());
    }
}

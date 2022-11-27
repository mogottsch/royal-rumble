<?php

namespace Tests\Feature\Database;

use App\Models\Lobby;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LobbySeederTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_lobby_seeder()
    {
        $this->seed();

        $lobby = Lobby::first();

        $this->assertNotNull($lobby);
        $this->assertNotNull($lobby->participants);
    }
}

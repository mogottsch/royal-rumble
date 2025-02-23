<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use App\Models\Wrestler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\Response;
use Tests\TestCase;

class AddEliminationTest extends TestCase
{
    private Lobby $lobby;
    public function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->lobby = Lobby::all()->last();
    }

    public function test_1o1_elimination()
    {
        $rumblers = $this->lobby->rumblers;

        $victim_ids = [$rumblers[0]->id];
        $offender_ids = [$rumblers[1]->id];

        $response = $this->postJson(
            route("lobbies.elimination", ["lobby" => $this->lobby]),
            [
                "victim_ids" => $victim_ids,
                "offender_ids" => $offender_ids,
            ]
        );

        $response->assertStatus(Response::HTTP_CREATED);
    }

    public function test_1o2_elimination()
    {
        $rumblers = $this->lobby->rumblers;

        $victim_ids = [$rumblers[0]->id];
        $offender_ids = [$rumblers[1]->id, $rumblers[2]->id];

        $response = $this->postJson(
            route("lobbies.elimination", ["lobby" => $this->lobby]),
            [
                "victim_ids" => $victim_ids,
                "offender_ids" => $offender_ids,
            ]
        );

        $response->assertStatus(Response::HTTP_CREATED);
    }

    public function test_missing_victim_ids()
    {
        $rumblers = $this->lobby->rumblers;

        $victim_ids = [];
        $offender_ids = [$rumblers[1]->id, $rumblers[2]->id];

        $response = $this->postJson(
            route("lobbies.elimination", ["lobby" => $this->lobby]),
            [
                "victim_ids" => $victim_ids,
                "offender_ids" => $offender_ids,
            ]
        );

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function test_unknown_id()
    {
        $rumblers = $this->lobby->rumblers;

        $victim_ids = [999];
        $offender_ids = [$rumblers[1]->id, $rumblers[2]->id];

        $response = $this->postJson(
            route("lobbies.elimination", ["lobby" => $this->lobby]),
            [
                "victim_ids" => $victim_ids,
                "offender_ids" => $offender_ids,
            ]
        );

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

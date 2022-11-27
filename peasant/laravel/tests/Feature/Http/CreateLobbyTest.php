<?php

namespace Tests\Feature\Http;

use Illuminate\Http\Response;
use Tests\TestCase;

class CreateLobbyTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_create_lobby()
    {
        $body = [
            "participants" => ["Mo", "Kate", "Niklas", "Markus"],
        ];
        $response = $this->post(route("lobbies.store"), $body);

        $response->assertStatus(Response::HTTP_CREATED);
        $response->assertJsonStructure([
            "data" => ["lobby" => ["id", "participants", "code"]],
        ]);
    }

    public function test_malfomed_request()
    {
        $body = [
            "participants" => "Mo",
        ];
        $response = $this->postJson(route("lobbies.store"), $body);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

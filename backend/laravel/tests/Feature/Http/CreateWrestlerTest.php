<?php

namespace Tests\Feature\Http;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Tests\TestCase;

class CreateWrestlerTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_wrestler()
    {
        $url = route("wrestlers.create", ["name" => "John Cena"]);
        $response = $this->post($url);

        $response->assertStatus(Response::HTTP_CREATED);
        $response->assertJsonPath("data.wrestler.name", "John Cena");
        $this->assertDatabaseHas("wrestlers", ["name" => "John Cena"]);
    }

    public function test_creates_wrestler_with_empty_name()
    {
        $url = route("wrestlers.create");
        $response = $this->post($url, ["name" => ""], ["Accept" => "application/json"]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function test_creates_wrestler_without_name()
    {
        $url = route("wrestlers.create");
        $response = $this->post($url, [], ["Accept" => "application/json"]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

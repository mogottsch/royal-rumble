<?php

namespace Tests\Feature\Http;

use App\Models\Wrestler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Tests\TestCase;

class SearchWrestlerTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_finds_wrestler()
    {
        Wrestler::factory()->create([
            "name" => "John Cena",
        ]);
        $url = route("wrestlers.search", ["search" => "John Cena"]);
        $response = $this->get($url);

        $response->assertStatus(Response::HTTP_OK);
        $response->assertJsonPath("data.0.name", "John Cena");
    }
}

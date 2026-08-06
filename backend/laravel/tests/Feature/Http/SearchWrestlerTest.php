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
            'name' => 'John Cena',
        ]);
        $url = route('wrestlers.search', ['search' => 'John Cena']);
        $response = $this->get($url);

        $response->assertStatus(Response::HTTP_OK);
        $response->assertJsonPath('data.0.name', 'John Cena');
    }

    public function test_uses_trusted_forwarded_scheme_for_public_asset_urls(): void
    {
        Wrestler::factory()->create([
            'name' => 'John Cena',
            'image_filename' => 'John Cena.png',
        ]);

        $response = $this
            ->withHeaders([
                'X-Forwarded-Host' => 'suffroyale.com',
                'X-Forwarded-Proto' => 'https',
            ])
            ->getJson('/api/wrestlers/search?search=John%20Cena');

        $response->assertOk();
        $this->assertStringStartsWith(
            'https://suffroyale.com/storage/wrestlers/',
            $response->json('data.0.thumbnail_url'),
        );
    }
}

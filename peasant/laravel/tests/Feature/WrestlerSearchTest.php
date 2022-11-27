<?php

namespace Tests\Feature;

use App\Models\Wrestler;
use App\Services\WrestlerSearcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class WrestlerSearchTest extends TestCase
{
    private WrestlerSearcher $wrestlerSearcher;

    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        $this->wrestlerSearcher = $this->app->make(WrestlerSearcher::class);
    }

    public function test_finds_wrestler()
    {
        Wrestler::factory()->create([
            "name" => "John Cena",
        ]);

        $wrestlers = $this->wrestlerSearcher->search("John Cena");

        $this->assertEquals(1, $wrestlers->count());
        $this->assertEquals("John Cena", $wrestlers->first()->name);
    }

    public function test_finds_wrestler_with_partial_name()
    {
        Wrestler::factory()->create([
            "name" => "John Cena",
        ]);

        $wrestlers = $this->wrestlerSearcher->search("John");

        $this->assertEquals(1, $wrestlers->count());
        $this->assertEquals("John Cena", $wrestlers->first()->name);
    }
}

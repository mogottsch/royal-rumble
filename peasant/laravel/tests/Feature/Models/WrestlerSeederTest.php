<?php

namespace Tests\Feature\Database;

use App\Models\Wrestler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WrestlerSeederTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_wrestler_seeder()
    {
        $this->seed();

        $wrestler = Wrestler::first();

        $this->assertNotNull($wrestler);
        $this->assertNotNull($wrestler->name);
    }
}

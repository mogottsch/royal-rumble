<?php

namespace Tests\Feature\Database;

use Database\Seeders\LobbySeeder;
use Database\Seeders\WrestlerSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_database_seeder()
    {
        Artisan::call("db:seed");

        $this->assertDatabaseCount("lobbies", LobbySeeder::LOBBY_COUNT);
        $this->assertDatabaseCount("wrestlers", WrestlerSeeder::WRESTLER_COUNT);
    }
}

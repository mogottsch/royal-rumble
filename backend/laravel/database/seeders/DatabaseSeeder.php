<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([WrestlerSeeder::class, LobbySeeder::class]);
    }
}

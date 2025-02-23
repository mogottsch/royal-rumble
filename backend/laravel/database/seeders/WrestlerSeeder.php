<?php

namespace Database\Seeders;

use App\Models\Wrestler;
use Illuminate\Database\Seeder;

class WrestlerSeeder extends Seeder
{
    const WRESTLER_COUNT = 10;

    public function run()
    {
        Wrestler::factory()
            ->count(self::WRESTLER_COUNT)
            ->create();
    }
}

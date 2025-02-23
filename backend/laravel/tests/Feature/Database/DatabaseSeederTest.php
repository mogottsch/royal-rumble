<?php

namespace Tests\Feature\Database;

use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_database_seeder()
    {
        Artisan::call("db:seed");
    }
}

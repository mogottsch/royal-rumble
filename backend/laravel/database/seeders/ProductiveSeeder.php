<?php

namespace Database\Seeders;

use App\Models\Wrestler;
use Artisan;
use File;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductiveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Artisan::call("migrate:fresh");

        // Read names.txt from storage/app and create one wrestler per line
        $names = File::get(storage_path("app/names.txt"));
        $names = explode("\n", $names);

        $wrestlers = [];
        foreach ($names as $name) {
            $name = trim($name);
            if (!empty($name)) {
                $wrestlers[] = ["name" => $name];
            }
        }

        // Insert all wrestlers in a single bulk transaction
        Wrestler::insert($wrestlers);

        // Output information about the created wrestlers
        $count = count($wrestlers);
        $this->command->info("Created $count wrestlers.");
    }
}

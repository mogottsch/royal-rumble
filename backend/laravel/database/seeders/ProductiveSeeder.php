<?php

namespace Database\Seeders;

use App\Models\Wrestler;
use Artisan;
use File;
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

        $wrestlers_raw = File::get(storage_path("app/saved_superstars.json"));
        $wrestlers_json = json_decode($wrestlers_raw, true);
        // json contains "name" and "file_name". should be mapped to "name" and "image_filename"
        $wrestlers = [];
        foreach ($wrestlers_json as $wrestler) {
            $wrestlers[] = [
                "name" => $wrestler["name"],
                "image_filename" => $wrestler["file_name"],
            ];
        }

        // Insert all wrestlers in a single bulk transaction
        Wrestler::insert($wrestlers);

        // $names = explode("\n", $names);
        //
        // $wrestlers = [];
        // foreach ($names as $name) {
        //     $name = trim($name);
        //     if (!empty($name)) {
        //         $wrestlers[] = ["name" => $name];
        //     }
        // }
        //
        // // Insert all wrestlers in a single bulk transaction
        // Wrestler::insert($wrestlers);

        // Output information about the created wrestlers
        $count = count($wrestlers);
        $this->command->info("Created $count wrestlers.");
    }
}

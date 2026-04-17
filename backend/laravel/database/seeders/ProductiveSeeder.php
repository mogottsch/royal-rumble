<?php

namespace Database\Seeders;

use App\Models\Wrestler;
use File;
use Illuminate\Database\Seeder;

class ProductiveSeeder extends Seeder
{
    public function run()
    {
        if (Wrestler::query()->exists()) {
            return;
        }

        $wrestlers_raw = File::get(storage_path("app/saved_superstars.json"));
        $wrestlers_json = json_decode($wrestlers_raw, true);
        $wrestlers = [];
        foreach ($wrestlers_json as $wrestler) {
            $wrestlers[] = [
                "name" => $wrestler["name"],
                "image_filename" => $wrestler["file_name"],
            ];
        }

        Wrestler::insert($wrestlers);

        $count = count($wrestlers);
        $this->command->info("Created $count wrestlers.");
    }
}

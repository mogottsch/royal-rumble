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
        // read names.txt from storage/app and create one wrestler per line
        $names = File::get(storage_path("app/names.txt"));
        $names = explode("\n", $names);
        foreach ($names as $name) {
            $name = trim($name);
            if (empty($name)) {
                continue;
            }
            $wrestler = new Wrestler();
            $wrestler->name = $name;
            $wrestler->save();
        }
    }
}

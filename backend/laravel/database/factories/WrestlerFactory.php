<?php

namespace Database\Factories;

use App\Models\Wrestler;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wrestler>
 */
class WrestlerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

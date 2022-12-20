<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RumblerFactory extends Factory
{
    public function definition()
    {
        return [
            "entrance_number" => $this->faker->numberBetween(1, 30),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Services\LobbyCodeGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lobby>
 */
class LobbyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $lobbyCodeGenerator = new LobbyCodeGenerator();
        return [
            "code" => $lobbyCodeGenerator->generate(),
        ];
    }
}

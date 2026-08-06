<?php

namespace Database\Factories;

use App\Models\Lobby;
use App\Services\LobbyCodeGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lobby>
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
        $lobbyCodeGenerator = new LobbyCodeGenerator;

        return [
            'code' => $lobbyCodeGenerator->generate(),
            'rumble_size' => 30,
        ];
    }
}

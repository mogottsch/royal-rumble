<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use Tests\TestCase;

class LobbyContractTest extends TestCase
{
    public function test_lobby_can_be_created_read_and_updated_without_changing_resource_shape(): void
    {
        $created = $this->postJson('/api/lobbies', [
            'participants' => ['Alice', 'Bob'],
            'rumble_size' => 20,
            'schluecke_per_elimination' => 4,
            'shots_per_elimination' => 1,
            'schluecke_on_npc_elimination' => 2,
            'shots_on_npc_elimination' => 0,
            'mystery_chests_enabled' => false,
            'chest_aggression_multiplier' => 1.25,
        ])->assertCreated();

        $code = $created->json('data.lobby.code');

        $this->getJson("/api/lobbies/{$code}")
            ->assertOk()
            ->assertJsonPath('data.lobby.code', $code)
            ->assertJsonCount(2, 'data.lobby.participants')
            ->assertJsonStructure([
                'data' => ['lobby' => [
                    'id',
                    'code',
                    'participants',
                    'rumblers',
                    'actions',
                    'nextEntranceNumber',
                    'settings',
                    'drink_config',
                    'drink_distributions',
                    'chugs',
                    'chest_rewards',
                ]],
            ]);

        $this->patchJson("/api/lobbies/{$code}/settings", [
            'rumble_size' => 24,
            'schluecke_per_elimination' => 5,
            'shots_per_elimination' => 2,
            'schluecke_on_npc_elimination' => 3,
            'shots_on_npc_elimination' => 1,
            'mystery_chests_enabled' => true,
            'chest_aggression_multiplier' => 1.5,
        ])
            ->assertOk()
            ->assertJsonPath('data.lobby.settings.rumble_size', 24)
            ->assertJsonPath('data.lobby.settings.mystery_chests_enabled', true)
            ->assertJsonPath('data.lobby.drink_config.shots_per_elimination', 2);
    }

    public function test_create_lobby_rejects_malformed_participant_names_without_persisting_a_lobby(): void
    {
        foreach ([
            ['Alice', ' '],
            ['Alice', 'Alice'],
            ['Alice', null],
            ['Alice', ['nested']],
            ['only-one'],
        ] as $participants) {
            $this->postJson('/api/lobbies', ['participants' => $participants])
                ->assertUnprocessable();
        }

        $this->assertSame(0, Lobby::query()->count());
    }
}

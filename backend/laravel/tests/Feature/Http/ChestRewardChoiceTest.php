<?php

namespace Tests\Feature\Http;

use App\Models\ChestReward;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use Illuminate\Http\Response;
use Tests\TestCase;

class ChestRewardChoiceTest extends TestCase
{
    private Lobby $lobby;
    private Participant $chooser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->lobby = Lobby::factory()->create([
            "mystery_chests_enabled" => true,
            "chest_aggression_multiplier" => 1,
        ]);

        $this->chooser = Participant::factory()->create([
            "lobby_id" => $this->lobby->id,
            "name" => "Chooser",
        ]);
    }

    public function test_choice_card_can_resolve_to_an_auto_effect(): void
    {
        $chestReward = $this->createEffectChoiceReward(
            [
                [
                    "key" => "test_self_hit",
                    "mode" => "auto",
                    "effect" => "chooser_only",
                    "schluecke" => 2,
                    "shots" => 0,
                ],
                [
                    "key" => "test_spread",
                    "mode" => "auto",
                    "effect" => "everyone_else",
                    "schluecke" => 1,
                    "shots" => 0,
                ],
            ],
            ChestReward::STATUS_REVEALED_EFFECT_CHOICE
        );

        $this->postJson(
            route("lobbies.chestRewards.acknowledge", [$this->lobby, $chestReward->id]),
            [],
            ["X-Participant-Id" => (string) $this->chooser->id]
        )
            ->assertStatus(Response::HTTP_OK)
            ->assertJsonPath("data.next_status", "pending_effect_choice");

        $resolveResponse = $this->postJson(
            route("lobbies.chestRewards.resolveChoice", [$this->lobby, $chestReward->id]),
            ["choice_key" => "test_self_hit"],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $resolveResponse
            ->assertStatus(Response::HTTP_OK)
            ->assertJsonPath("data.next_status", "resolved")
            ->assertJsonPath("data.selected_choice_key", "test_self_hit");

        $this->assertDatabaseHas("chest_rewards", [
            "id" => $chestReward->id,
            "status" => "resolved",
            "card_mode" => "effect_choice",
            "selected_choice_key" => "test_self_hit",
            "pending_schluecke" => 2,
            "pending_shots" => 0,
        ]);

        $this->assertDatabaseHas("drink_distributions", [
            "lobby_id" => $this->lobby->id,
            "elimination_id" => $chestReward->elimination_id,
            "giver_participant_id" => $this->chooser->id,
            "receiver_participant_id" => $this->chooser->id,
            "schluecke" => 2,
            "shots" => 0,
            "kind" => "chest_reward",
        ]);
    }

    public function test_choice_card_can_transition_into_pending_distribution(): void
    {
        $chestReward = $this->createEffectChoiceReward([
            [
                "key" => "test_pool",
                "mode" => "give_out",
                "schluecke" => 5,
                "shots" => 0,
            ],
            [
                "key" => "test_table",
                "mode" => "auto",
                "effect" => "everyone",
                "schluecke" => 1,
                "shots" => 0,
            ],
        ]);

        $resolveResponse = $this->postJson(
            route("lobbies.chestRewards.resolveChoice", [$this->lobby, $chestReward->id]),
            ["choice_key" => "test_pool"],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $resolveResponse
            ->assertStatus(Response::HTTP_OK)
            ->assertJsonPath("data.next_status", "pending_distribution")
            ->assertJsonPath("data.selected_choice_key", "test_pool");

        $this->assertDatabaseHas("chest_rewards", [
            "id" => $chestReward->id,
            "status" => "pending_distribution",
            "card_mode" => "effect_choice",
            "selected_choice_key" => "test_pool",
            "pending_schluecke" => 5,
            "pending_shots" => 0,
        ]);
    }

    private function createEffectChoiceReward(
        array $options,
        string $status = ChestReward::STATUS_PENDING_EFFECT_CHOICE
    ): ChestReward {
        $elimination = Elimination::factory()->create();

        return ChestReward::create([
            "lobby_id" => $this->lobby->id,
            "elimination_id" => $elimination->id,
            "offender_rumbler_id" => null,
            "victim_rumbler_id" => null,
            "chooser_participant_id" => $this->chooser->id,
            "status" => $status,
            "chest_type" => "group",
            "card_key" => "test_effect_choice",
            "card_mode" => "effect_choice",
            "choice_options" => $options,
        ]);
    }
}

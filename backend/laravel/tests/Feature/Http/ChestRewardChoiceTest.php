<?php

namespace Tests\Feature\Http;

use App\Models\ChestReward;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use App\Models\Wrestler;
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
            "name" => "MoritzA",
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

    public function test_historical_cards_only_target_players_with_active_wrestlers(): void
    {
        $activeLegend = Wrestler::factory()->create([
            "name" => "Legend",
        ]);
        $benchLegend = Wrestler::factory()->create([
            "name" => "Bench Legend",
        ]);

        $activeLegend->royalRumbleEntries()->createMany([
            ["year" => 2000, "entrance_number" => 5, "source_wrestler_name" => "Legend"],
            ["year" => 2001, "entrance_number" => 8, "source_wrestler_name" => "Legend"],
            ["year" => 2002, "entrance_number" => 12, "source_wrestler_name" => "Legend"],
        ]);

        $benchLegend->royalRumbleEntries()->createMany([
            ["year" => 2000, "entrance_number" => 1, "source_wrestler_name" => "Bench Legend"],
            ["year" => 2001, "entrance_number" => 30, "source_wrestler_name" => "Bench Legend"],
            ["year" => 2002, "entrance_number" => 4, "source_wrestler_name" => "Bench Legend"],
            ["year" => 2003, "entrance_number" => 7, "source_wrestler_name" => "Bench Legend"],
        ]);

        $activeRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $activeLegend->id,
        ]);
        $benchRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $benchLegend->id,
        ]);

        $this->chooser->rumbler_id = $activeRumbler->id;
        $this->chooser->save();

        $benchParticipant = Participant::factory()->create([
            "lobby_id" => $this->lobby->id,
            "name" => "Bench Player",
        ]);
        $benchParticipant->rumbler_id = $benchRumbler->id;
        $benchParticipant->save();

        Elimination::factory()->create()->rumblerVictims()->attach($benchRumbler->id);

        $response = $this->postJson(
            route("lobbies.admin.chestRewards.trigger", $this->lobby),
            [
                "participant_id" => $this->chooser->id,
                "chest_type" => "chaos",
                "card_key" => "chaos_legends_due",
            ],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $response
            ->assertStatus(Response::HTTP_CREATED)
            ->assertJsonPath("data.affected_participant_ids", [$this->chooser->id]);

        $this->assertDatabaseHas("drink_distributions", [
            "lobby_id" => $this->lobby->id,
            "receiver_participant_id" => $this->chooser->id,
            "shots" => 1,
            "kind" => "chest_reward",
        ]);

        $this->assertDatabaseMissing("drink_distributions", [
            "lobby_id" => $this->lobby->id,
            "receiver_participant_id" => $benchParticipant->id,
            "kind" => "chest_reward",
        ]);
    }

    public function test_choice_card_random_outcome_is_resolved_once_and_persisted(): void
    {
        $chestReward = $this->createEffectChoiceReward([
            [
                "key" => "test_random_auto",
                "mode" => "auto",
                "random_outcomes" => [
                    [
                        "weight" => 100,
                        "mode" => "auto",
                        "effect" => "chooser_only",
                        "schluecke" => 0,
                        "shots" => 0,
                        "self_shots" => 2,
                    ],
                ],
            ],
            [
                "key" => "test_fallback",
                "mode" => "give_out",
                "schluecke" => 1,
                "shots" => 0,
            ],
        ]);

        $this->postJson(
            route("lobbies.chestRewards.resolveChoice", [$this->lobby, $chestReward->id]),
            ["choice_key" => "test_random_auto"],
            ["X-Participant-Id" => (string) $this->chooser->id]
        )
            ->assertStatus(Response::HTTP_OK)
            ->assertJsonPath("data.next_status", "resolved")
            ->assertJsonPath("data.selected_choice_key", "test_random_auto")
            ->assertJsonPath("data.resolved_option.self_shots", 2);

        $this->assertDatabaseHas("chest_rewards", [
            "id" => $chestReward->id,
            "status" => "resolved",
            "selected_choice_key" => "test_random_auto",
            "pending_schluecke" => 0,
            "pending_shots" => 0,
        ]);

        $this->assertDatabaseHas("drink_distributions", [
            "lobby_id" => $this->lobby->id,
            "elimination_id" => $chestReward->elimination_id,
            "giver_participant_id" => $this->chooser->id,
            "receiver_participant_id" => $this->chooser->id,
            "schluecke" => 0,
            "shots" => 2,
            "kind" => "chest_reward",
        ]);
    }

    public function test_safe_current_body_count_uses_current_wrestler_eliminations(): void
    {
        $wrestler = Wrestler::factory()->create(["name" => "Current Killer"]);
        $rumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $wrestler->id,
            "entrance_number" => 4,
        ]);

        $this->chooser->entrance_number = 4;
        $this->chooser->rumbler_id = $rumbler->id;
        $this->chooser->save();

        $eliminations = Elimination::factory()->count(3)->create();
        foreach ($eliminations as $elimination) {
            $elimination->rumblerOffenders()->attach($rumbler->id);
        }

        $response = $this->postJson(
            route("lobbies.admin.chestRewards.trigger", $this->lobby),
            [
                "participant_id" => $this->chooser->id,
                "chest_type" => "safe",
                "card_key" => "safe_current_body_count",
            ],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $response
            ->assertStatus(Response::HTTP_CREATED)
            ->assertJsonPath("data.card_key", "safe_current_body_count")
            ->assertJsonPath("data.card_mode", "give_out")
            ->assertJsonPath("data.schluecke", 3);
    }

    public function test_safe_stable_hands_uses_all_owned_wrestler_eliminations_for_same_entrance_slot(): void
    {
        $current = Wrestler::factory()->create(["name" => "Current"]);
        $past = Wrestler::factory()->create(["name" => "Past"]);

        $currentRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $current->id,
            "entrance_number" => 7,
        ]);
        $pastRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $past->id,
            "entrance_number" => 7,
        ]);
        $otherRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => Wrestler::factory()->create()->id,
            "entrance_number" => 8,
        ]);

        $this->chooser->entrance_number = 7;
        $this->chooser->rumbler_id = $currentRumbler->id;
        $this->chooser->save();

        Elimination::factory()->create()->rumblerOffenders()->attach($currentRumbler->id);
        Elimination::factory()->create()->rumblerOffenders()->attach($pastRumbler->id);
        Elimination::factory()->create()->rumblerOffenders()->attach($pastRumbler->id);
        Elimination::factory()->create()->rumblerOffenders()->attach($otherRumbler->id);

        $response = $this->postJson(
            route("lobbies.admin.chestRewards.trigger", $this->lobby),
            [
                "participant_id" => $this->chooser->id,
                "chest_type" => "safe",
                "card_key" => "safe_stable_hands",
            ],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $response
            ->assertStatus(Response::HTTP_CREATED)
            ->assertJsonPath("data.schluecke", 3);
    }

    public function test_safe_stable_hands_counts_each_victim_in_multi_elimination(): void
    {
        $current = Wrestler::factory()->create(["name" => "Current"]);
        $currentRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $current->id,
            "entrance_number" => 9,
        ]);

        $this->chooser->entrance_number = 9;
        $this->chooser->rumbler_id = $currentRumbler->id;
        $this->chooser->save();

        $victims = Rumbler::factory()->count(4)->create([
            "lobby_id" => $this->lobby->id,
        ]);

        $elimination = Elimination::factory()->create();
        $elimination->rumblerOffenders()->attach($currentRumbler->id);
        $elimination->rumblerVictims()->attach($victims->pluck("id"));

        $response = $this->postJson(
            route("lobbies.admin.chestRewards.trigger", $this->lobby),
            [
                "participant_id" => $this->chooser->id,
                "chest_type" => "safe",
                "card_key" => "safe_stable_hands",
            ],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $response
            ->assertStatus(Response::HTTP_CREATED)
            ->assertJsonPath("data.schluecke", 4);
    }

    public function test_safe_burned_slots_and_blank_check_use_same_entrance_slot_rumblers(): void
    {
        $current = Wrestler::factory()->create(["name" => "Current"]);
        $burned = Wrestler::factory()->create(["name" => "Burned"]);
        $blank = Wrestler::factory()->create(["name" => "Blank"]);

        $currentRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $current->id,
            "entrance_number" => 12,
        ]);
        $burnedRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $burned->id,
            "entrance_number" => 12,
        ]);
        $blankRumbler = Rumbler::factory()->create([
            "lobby_id" => $this->lobby->id,
            "wrestler_id" => $blank->id,
            "entrance_number" => 12,
        ]);

        $this->chooser->entrance_number = 12;
        $this->chooser->rumbler_id = $currentRumbler->id;
        $this->chooser->save();

        Elimination::factory()->create()->rumblerVictims()->attach($burnedRumbler->id);
        Elimination::factory()->create()->rumblerOffenders()->attach($currentRumbler->id);

        $burnedSlots = $this->postJson(
            route("lobbies.admin.chestRewards.trigger", $this->lobby),
            [
                "participant_id" => $this->chooser->id,
                "chest_type" => "safe",
                "card_key" => "safe_burned_slots",
            ],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $burnedSlots
            ->assertStatus(Response::HTTP_CREATED)
            ->assertJsonPath("data.schluecke", 1);

        $blankCheck = $this->postJson(
            route("lobbies.admin.chestRewards.trigger", $this->lobby),
            [
                "participant_id" => $this->chooser->id,
                "chest_type" => "safe",
                "card_key" => "safe_blank_check",
            ],
            ["X-Participant-Id" => (string) $this->chooser->id]
        );

        $blankCheck
            ->assertStatus(Response::HTTP_CREATED)
            ->assertJsonPath("data.schluecke", 2);
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

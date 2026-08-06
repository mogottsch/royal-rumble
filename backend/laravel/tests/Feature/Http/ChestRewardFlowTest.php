<?php

namespace Tests\Feature\Http;

use App\Events\LobbyUpdated;
use App\Models\ChestReward;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use App\Models\Wrestler;
use App\Services\ChestRewardResolver;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ChestRewardFlowTest extends TestCase
{
    public function test_roll_and_acknowledge_return_422_when_participant_header_is_missing(): void
    {
        [$lobby, $chooser, , $offender, $victim] = $this->game();
        $pending = $this->reward($lobby, $chooser, $offender, $victim);

        $this->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$pending->id}/roll", [
            'chest_type' => 'safe',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Missing X-Participant-Id header.');

        $revealed = $this->reward(
            $lobby,
            $chooser,
            $offender,
            $victim,
            ChestReward::STATUS_REVEALED_AUTO
        );

        $this->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$revealed->id}/acknowledge")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Missing X-Participant-Id header.');
    }

    public function test_chest_distribution_payload_only_requires_chest_and_splits(): void
    {
        [$lobby, $chooser, $receiver, $offender, $victim] = $this->game();
        $reward = $this->reward(
            $lobby,
            $chooser,
            $offender,
            $victim,
            ChestReward::STATUS_PENDING_DISTRIBUTION,
            ['pending_schluecke' => 3]
        );

        $this->withHeader('X-Participant-Id', (string) $chooser->id)
            ->postJson("/api/lobbies/{$lobby->code}/distributions", [
                'chest_reward_id' => $reward->id,
                'splits' => [[
                    'receiver_participant_id' => $receiver->id,
                    'schluecke' => 3,
                    'shots' => 0,
                ]],
            ])
            ->assertCreated();

        $this->assertDatabaseHas('chest_rewards', [
            'id' => $reward->id,
            'status' => ChestReward::STATUS_RESOLVED,
        ]);
        $this->assertDatabaseCount('drink_distributions', 1);
    }

    public function test_deterministic_give_out_card_moves_through_reveal_acknowledge_and_distribution(): void
    {
        [$lobby, $chooser, $receiver] = $this->game();
        $resolver = app(ChestRewardResolver::class);

        $result = $resolver->createAdminReward($lobby, $chooser, 'safe', 'safe_give_sips');
        $reward = ChestReward::query()->findOrFail($result['chest_reward_id']);
        $this->assertSame(ChestReward::STATUS_REVEALED_DISTRIBUTION, $reward->status);
        $this->assertSame(3, $reward->pending_schluecke);

        $resolver->acknowledge($lobby, $reward, $chooser);
        $this->assertSame(ChestReward::STATUS_PENDING_DISTRIBUTION, $reward->fresh()->status);

        $this->withHeader('X-Participant-Id', (string) $chooser->id)
            ->postJson("/api/lobbies/{$lobby->code}/distributions", [
                'chest_reward_id' => $reward->id,
                'splits' => [[
                    'receiver_participant_id' => $receiver->id,
                    'schluecke' => 3,
                    'shots' => 0,
                ]],
            ])
            ->assertCreated();

        $this->assertSame(ChestReward::STATUS_RESOLVED, $reward->fresh()->status);
    }

    public function test_effect_choice_can_resolve_an_auto_effect_and_reject_replay(): void
    {
        [$lobby, $chooser] = $this->game();
        $reward = $this->prepareEffectChoice(
            $lobby,
            $chooser,
            'chaos',
            'chaos_high_treason'
        );

        $response = $this->withHeader('X-Participant-Id', (string) $chooser->id)
            ->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$reward->id}/resolve-choice", [
                'choice_key' => 'take_the_fall',
            ])
            ->assertOk()
            ->assertJsonPath('data.next_status', ChestReward::STATUS_RESOLVED);

        $this->assertSame('take_the_fall', $response->json('data.selected_choice_key'));
        $this->assertSame(ChestReward::STATUS_RESOLVED, $reward->fresh()->status);
        $this->assertDatabaseHas('drink_distributions', [
            'receiver_participant_id' => $chooser->id,
            'shots' => 1,
            'kind' => 'chest_reward',
        ]);

        $this->withHeader('X-Participant-Id', (string) $chooser->id)
            ->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$reward->id}/resolve-choice", [
                'choice_key' => 'take_the_fall',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This chest is not waiting for a choice.');
    }

    public function test_effect_choice_can_transition_to_pending_distribution(): void
    {
        [$lobby, $chooser] = $this->game();
        $reward = $this->prepareEffectChoice(
            $lobby,
            $chooser,
            'safe',
            'safe_sweet_deal'
        );

        $this->withHeader('X-Participant-Id', (string) $chooser->id)
            ->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$reward->id}/resolve-choice", [
                'choice_key' => 'give_three',
            ])
            ->assertOk()
            ->assertJsonPath('data.next_status', ChestReward::STATUS_PENDING_DISTRIBUTION)
            ->assertJsonPath('data.selected_choice_key', 'give_three');

        $reward->refresh();
        $this->assertSame(ChestReward::STATUS_PENDING_DISTRIBUTION, $reward->status);
        $this->assertSame(3, $reward->pending_schluecke);
        $this->assertSame(0, $reward->pending_shots);
    }

    public function test_effect_choice_rejects_wrong_chooser_and_unknown_choice(): void
    {
        [$lobby, $chooser, $other] = $this->game();
        $reward = $this->prepareEffectChoice(
            $lobby,
            $chooser,
            'safe',
            'safe_sweet_deal'
        );

        $this->withHeader('X-Participant-Id', (string) $other->id)
            ->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$reward->id}/resolve-choice", [
                'choice_key' => 'give_three',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot resolve this chest.');

        $this->withHeader('X-Participant-Id', (string) $chooser->id)
            ->postJson("/api/lobbies/{$lobby->code}/chest-rewards/{$reward->id}/resolve-choice", [
                'choice_key' => 'not-a-real-choice',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Unknown effect choice.');

        $this->assertSame(ChestReward::STATUS_PENDING_EFFECT_CHOICE, $reward->fresh()->status);
    }

    public function test_zero_value_give_out_card_broadcasts_its_revealed_state(): void
    {
        Event::fake([LobbyUpdated::class]);
        [$lobby, $chooser] = $this->game();

        $result = app(ChestRewardResolver::class)
            ->createAdminReward($lobby, $chooser, 'safe', 'safe_current_body_count');

        $this->assertSame(0, $result['schluecke']);
        $this->assertSame(ChestReward::STATUS_REVEALED_AUTO, ChestReward::findOrFail($result['chest_reward_id'])->status);
        Event::assertDispatched(LobbyUpdated::class);
    }

    public function test_blood_price_creates_shots_only(): void
    {
        [$lobby, $chooser, , $offender, $victim] = $this->game();
        $this->recordHistoricalElimination($chooser, $offender, $victim);

        $result = app(ChestRewardResolver::class)
            ->createAdminReward($lobby, $chooser, 'chaos', 'chaos_blood_price');

        $this->assertSame(0, $result['schluecke']);
        $this->assertSame(1, $result['shots']);
        $this->assertDatabaseHas('drink_distributions', [
            'receiver_participant_id' => $chooser->id,
            'schluecke' => 0,
            'shots' => 1,
        ]);
    }

    public function test_russian_roulette_adds_an_outstanding_chug_without_marking_it_consumed(): void
    {
        [$lobby, $chooser, $target] = $this->game();
        $resolver = app(ChestRewardResolver::class);
        $result = $resolver->createAdminReward($lobby, $chooser, 'chaos', 'chaos_russian_roulette');
        $reward = ChestReward::query()->findOrFail($result['chest_reward_id']);

        $resolver->acknowledge($lobby, $reward, $chooser);
        $resolved = $resolver->resolveTargetPick($lobby, $reward->fresh(), $chooser, $target);

        $loser = Participant::query()->findOrFail($resolved['result_participant_id']);
        $this->assertContains($loser->id, [$chooser->id, $target->id]);
        $this->assertSame(0, $loser->drunk_chugs);
        $this->assertDatabaseHas('chugs', [
            'participant_id' => $loser->id,
            'elimination_id' => $reward->elimination_id,
        ]);
    }

    public function test_self_tax_includes_chooser_in_affected_participants(): void
    {
        [$lobby, $chooser, $other] = $this->game();

        $result = app(ChestRewardResolver::class)
            ->createAdminReward($lobby, $chooser, 'chaos', 'chaos_blackout_tax');

        $this->assertContains($chooser->id, $result['affected_participant_ids']);
        $this->assertContains($other->id, $result['affected_participant_ids']);
    }

    private function game(): array
    {
        $lobby = Lobby::factory()->create([
            'mystery_chests_enabled' => true,
            'chest_aggression_multiplier' => 1,
        ]);
        $chooser = Participant::factory()->for($lobby)->create([
            'name' => 'MoritzA',
            'entrance_number' => 1,
        ]);
        $receiver = Participant::factory()->for($lobby)->create([
            'name' => 'Other',
            'entrance_number' => 2,
        ]);
        $offender = $this->rumbler($lobby, 1);
        $victim = $this->rumbler($lobby, 2);
        $chooser->rumbler()->associate($offender);
        $chooser->save();
        $receiver->rumbler()->associate($victim);
        $receiver->save();

        return [$lobby, $chooser, $receiver, $offender, $victim];
    }

    private function rumbler(Lobby $lobby, int $entranceNumber): Rumbler
    {
        return Rumbler::factory()
            ->for($lobby)
            ->for(Wrestler::factory())
            ->create(['entrance_number' => $entranceNumber]);
    }

    private function reward(
        Lobby $lobby,
        Participant $chooser,
        Rumbler $offender,
        Rumbler $victim,
        string $status = ChestReward::STATUS_PENDING_CHOICE,
        array $attributes = []
    ): ChestReward {
        $elimination = Elimination::factory()->create();

        return ChestReward::query()->create(array_merge([
            'lobby_id' => $lobby->id,
            'elimination_id' => $elimination->id,
            'offender_rumbler_id' => $offender->id,
            'victim_rumbler_id' => $victim->id,
            'chooser_participant_id' => $chooser->id,
            'status' => $status,
        ], $attributes));
    }

    private function prepareEffectChoice(
        Lobby $lobby,
        Participant $chooser,
        string $chestType,
        string $cardKey
    ): ChestReward {
        $result = app(ChestRewardResolver::class)
            ->createAdminReward($lobby, $chooser, $chestType, $cardKey);
        $reward = ChestReward::query()->findOrFail($result['chest_reward_id']);
        $this->assertSame(ChestReward::STATUS_REVEALED_EFFECT_CHOICE, $reward->status);

        app(ChestRewardResolver::class)->acknowledge($lobby, $reward, $chooser);
        $reward->refresh();
        $this->assertSame(ChestReward::STATUS_PENDING_EFFECT_CHOICE, $reward->status);

        return $reward;
    }

    private function recordHistoricalElimination(
        Participant $chooser,
        Rumbler $offender,
        Rumbler $victim
    ): void {
        $elimination = Elimination::factory()->create();
        $elimination->rumblerOffenders()->attach($offender->id, [
            'participant_id' => $chooser->id,
        ]);
        $elimination->rumblerVictims()->attach($victim->id);
    }
}

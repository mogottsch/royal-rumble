<?php

namespace Tests\Feature\Http;

use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use App\Models\Wrestler;
use Tests\TestCase;

class EliminationAndDistributionTest extends TestCase
{
    public function test_elimination_records_all_core_effects_and_snapshots_reward_owner(): void
    {
        [$lobby, $giver, $receiver, $offender, $victim] = $this->game();

        $response = $this->postJson("/api/lobbies/{$lobby->code}/elimination", [
            'offender_ids' => [$offender->id],
            'victim_ids' => [$victim->id],
        ])->assertCreated();

        $eliminationId = $response->json('elimination_id');

        $this->assertDatabaseHas('offenders', [
            'elimination_id' => $eliminationId,
            'rumbler_id' => $offender->id,
            'participant_id' => $giver->id,
        ]);
        $this->assertDatabaseHas('victims', [
            'elimination_id' => $eliminationId,
            'rumbler_id' => $victim->id,
        ]);
        $this->assertDatabaseHas('chugs', [
            'lobby_id' => $lobby->id,
            'participant_id' => $receiver->id,
            'elimination_id' => $eliminationId,
        ]);
        $this->assertDatabaseHas('actions', [
            'lobby_id' => $lobby->id,
            'elimination_id' => $eliminationId,
        ]);

        $this->getJson("/api/lobbies/{$lobby->code}")
            ->assertOk()
            ->assertJsonPath('data.lobby.actions.0.elimination.rumbler_offenders.0.pivot.participant_id', $giver->id);
    }

    public function test_classic_distribution_uses_snapshotted_owner_after_wrestler_rotation_and_rejects_replay(): void
    {
        [$lobby, $giver, $receiver, $offender, $victim] = $this->game();

        $eliminationId = $this->postJson("/api/lobbies/{$lobby->code}/elimination", [
            'offender_ids' => [$offender->id],
            'victim_ids' => [$victim->id],
        ])->assertCreated()->json('elimination_id');

        $replacement = $this->rumbler($lobby, 3);
        $giver->rumbler()->associate($replacement);
        $giver->save();

        $payload = [
            'elimination_id' => $eliminationId,
            'offender_rumbler_id' => $offender->id,
            'victim_rumbler_id' => $victim->id,
            'splits' => [[
                'receiver_participant_id' => $receiver->id,
                'schluecke' => 4,
                'shots' => 1,
            ]],
        ];

        $this->withHeader('X-Participant-Id', (string) $giver->id)
            ->postJson("/api/lobbies/{$lobby->code}/distributions", $payload)
            ->assertCreated();

        $this->assertDatabaseHas('drink_distributions', [
            'elimination_id' => $eliminationId,
            'giver_participant_id' => $giver->id,
            'receiver_participant_id' => $receiver->id,
            'schluecke' => 4,
            'shots' => 1,
            'kind' => 'elimination_reward',
        ]);

        $this->withHeader('X-Participant-Id', (string) $giver->id)
            ->postJson("/api/lobbies/{$lobby->code}/distributions", $payload)
            ->assertUnprocessable();

        $this->assertDatabaseCount('drink_distributions', 1);
    }

    public function test_distribution_does_not_accept_an_elimination_from_another_lobby(): void
    {
        [$lobby, $giver, $receiver, $offender, $victim] = $this->game();
        [$foreignLobby, , , $foreignOffender, $foreignVictim] = $this->game();

        $foreignEliminationId = $this->postJson("/api/lobbies/{$foreignLobby->code}/elimination", [
            'offender_ids' => [$foreignOffender->id],
            'victim_ids' => [$foreignVictim->id],
        ])->assertCreated()->json('elimination_id');

        $this->withHeader('X-Participant-Id', (string) $giver->id)
            ->postJson("/api/lobbies/{$lobby->code}/distributions", [
                'elimination_id' => $foreignEliminationId,
                'offender_rumbler_id' => $offender->id,
                'victim_rumbler_id' => $victim->id,
                'splits' => [[
                    'receiver_participant_id' => $receiver->id,
                    'schluecke' => 4,
                    'shots' => 1,
                ]],
            ])
            ->assertNotFound();
    }

    private function game(): array
    {
        $lobby = Lobby::factory()->create([
            'schluecke_per_elimination' => 4,
            'shots_per_elimination' => 1,
            'mystery_chests_enabled' => false,
        ]);
        $giver = Participant::factory()->for($lobby)->create(['entrance_number' => 1]);
        $receiver = Participant::factory()->for($lobby)->create(['entrance_number' => 2]);
        $offender = $this->rumbler($lobby, 1);
        $victim = $this->rumbler($lobby, 2);
        $giver->rumbler()->associate($offender);
        $giver->save();
        $receiver->rumbler()->associate($victim);
        $receiver->save();

        return [$lobby, $giver, $receiver, $offender, $victim];
    }

    private function rumbler(Lobby $lobby, int $entranceNumber): Rumbler
    {
        return Rumbler::factory()
            ->for($lobby)
            ->for(Wrestler::factory())
            ->create(['entrance_number' => $entranceNumber]);
    }
}

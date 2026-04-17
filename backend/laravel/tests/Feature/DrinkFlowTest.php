<?php

namespace Tests\Feature;

use App\Exceptions\DrinkDistributionException;
use App\Models\Chug;
use App\Models\DrinkDistribution;
use App\Models\Lobby;
use App\Models\Rumbler;
use App\Services\DrinkDistributionRecorder;
use App\Services\EliminationRecorder;
use Illuminate\Support\Collection;
use Tests\TestCase;

class DrinkFlowTest extends TestCase
{
    private Lobby $lobby;
    private EliminationRecorder $eliminationRecorder;
    private DrinkDistributionRecorder $drinkDistributionRecorder;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->lobby = Lobby::all()->last();
        $this->lobby->schluecke_per_elimination = 2;
        $this->lobby->shots_per_elimination = 1;
        $this->lobby->schluecke_on_npc_elimination = 1;
        $this->lobby->shots_on_npc_elimination = 0;
        $this->lobby->save();
        $this->eliminationRecorder = app(EliminationRecorder::class);
        $this->drinkDistributionRecorder = app(DrinkDistributionRecorder::class);
    }

    public function test_elimination_of_owned_victim_creates_chug(): void
    {
        $owned = $this->lobby->rumblers->filter(fn($r) => $r->participant !== null)->values();
        $victim = $owned[0];
        $offender = $owned[1];

        $this->eliminationRecorder->record(
            $this->lobby,
            new Collection([$victim]),
            new Collection([$offender])
        );

        $chugs = Chug::where("lobby_id", $this->lobby->id)->get();
        $this->assertCount(1, $chugs);
        $this->assertEquals($victim->participant->id, $chugs[0]->participant_id);
    }

    public function test_npc_offender_creates_penalty_distributions_for_all_participants(): void
    {
        $npcRumbler = $this->lobby->rumblers->filter(fn($r) => $r->participant === null)->first();
        $this->assertNotNull($npcRumbler, "Need at least one NPC rumbler for this test");

        $victim = $this->lobby->rumblers->filter(fn($r) => $r->participant !== null)->first();

        $this->eliminationRecorder->record(
            $this->lobby,
            new Collection([$victim]),
            new Collection([$npcRumbler])
        );

        $distributions = DrinkDistribution::where("lobby_id", $this->lobby->id)
            ->where("kind", DrinkDistribution::KIND_NPC_ELIMINATION_PENALTY)
            ->get();

        $this->assertCount($this->lobby->participants->count(), $distributions);
        foreach ($distributions as $d) {
            $this->assertEquals(1, $d->schluecke);
            $this->assertEquals(0, $d->shots);
            $this->assertNull($d->giver_participant_id);
        }
    }

    public function test_distribution_happy_path(): void
    {
        $owned = $this->lobby->rumblers->filter(fn($r) => $r->participant !== null)->values();
        $offender = $owned[0];
        $victim = $owned[1];
        $giver = $offender->participant;
        $receiver = $victim->participant;

        $elimination = $this->eliminationRecorder->record(
            $this->lobby,
            new Collection([$victim]),
            new Collection([$offender])
        );

        $this->drinkDistributionRecorder->recordEliminationReward(
            $this->lobby,
            $elimination,
            $offender,
            $victim,
            $giver,
            [["receiver_participant_id" => $receiver->id, "schluecke" => 2, "shots" => 1]]
        );

        $rewards = DrinkDistribution::where("elimination_id", $elimination->id)
            ->where("kind", DrinkDistribution::KIND_ELIMINATION_REWARD)
            ->get();
        $this->assertCount(1, $rewards);
        $this->assertEquals(2, $rewards[0]->schluecke);
        $this->assertEquals(1, $rewards[0]->shots);
        $this->assertEquals($giver->id, $rewards[0]->giver_participant_id);
    }

    public function test_distribution_rejects_wrong_sum(): void
    {
        $owned = $this->lobby->rumblers->filter(fn($r) => $r->participant !== null)->values();
        $offender = $owned[0];
        $victim = $owned[1];
        $giver = $offender->participant;
        $receiver = $victim->participant;

        $elimination = $this->eliminationRecorder->record(
            $this->lobby,
            new Collection([$victim]),
            new Collection([$offender])
        );

        $this->expectException(DrinkDistributionException::class);
        $this->drinkDistributionRecorder->recordEliminationReward(
            $this->lobby,
            $elimination,
            $offender,
            $victim,
            $giver,
            [["receiver_participant_id" => $receiver->id, "schluecke" => 1, "shots" => 0]]
        );
    }

    public function test_distribution_rejects_wrong_giver(): void
    {
        $owned = $this->lobby->rumblers->filter(fn($r) => $r->participant !== null)->values();
        $offender = $owned[0];
        $victim = $owned[1];
        $wrongGiver = $victim->participant;

        $elimination = $this->eliminationRecorder->record(
            $this->lobby,
            new Collection([$victim]),
            new Collection([$offender])
        );

        $this->expectException(DrinkDistributionException::class);
        $this->drinkDistributionRecorder->recordEliminationReward(
            $this->lobby,
            $elimination,
            $offender,
            $victim,
            $wrongGiver,
            [["receiver_participant_id" => $wrongGiver->id, "schluecke" => 2, "shots" => 1]]
        );
    }

    public function test_distribution_rejects_duplicate(): void
    {
        $owned = $this->lobby->rumblers->filter(fn($r) => $r->participant !== null)->values();
        $offender = $owned[0];
        $victim = $owned[1];
        $giver = $offender->participant;
        $receiver = $victim->participant;

        $elimination = $this->eliminationRecorder->record(
            $this->lobby,
            new Collection([$victim]),
            new Collection([$offender])
        );

        $splits = [["receiver_participant_id" => $receiver->id, "schluecke" => 2, "shots" => 1]];

        $this->drinkDistributionRecorder->recordEliminationReward(
            $this->lobby, $elimination, $offender, $victim, $giver, $splits
        );

        $this->expectException(DrinkDistributionException::class);
        $this->drinkDistributionRecorder->recordEliminationReward(
            $this->lobby, $elimination, $offender, $victim, $giver, $splits
        );
    }
}

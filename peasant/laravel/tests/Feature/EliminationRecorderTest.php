<?php

namespace Tests\Feature;

use App\Exceptions\EliminationRecorderErrorCode;
use App\Exceptions\EliminationRecorderException;
use App\Models\Action;
use App\Models\Lobby;
use App\Models\Wrestler;
use App\Services\EliminationRecorder;
use App\Services\EntranceNumberAssigner;
use Illuminate\Support\Collection;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class EliminationRecorderTest extends TestCase
{
    private Lobby $lobby;
    private EliminationRecorder $eliminationRecorder;
    private EntranceNumberAssigner $entranceNumberAssigner;

    const FIRST_RUMBLER = 0; // eliminated
    const SECOND_RUMBLER = 1;
    const THIRD_RUMBLER = 2;
    const FOURTH_RUMBLER = 3; // eliminated
    const FIFTH_RUMBLER = 4; // eliminated
    const SIXTH_RUMBLER = 5; // eliminated
    const SEVENTH_RUMBLER = 6; // eliminated
    const EIGHTH_RUMBLER = 7; // eliminated

    public function setUp(): void
    {
        parent::setUp();

        $this->seed();
        $this->lobby = Lobby::all()->last();

        $this->eliminationRecorder = app(EliminationRecorder::class);
        $this->entranceNumberAssigner = app(EntranceNumberAssigner::class);
    }

    public function test_record_1o1_elimination()
    {
        $rumblers = $this->lobby->rumblers;

        $victims = new Collection([$rumblers[self::FIRST_RUMBLER]]);
        $offenders = new Collection([$rumblers[self::SECOND_RUMBLER]]);

        $nActionsBefore = $this->lobby->actions->count();
        $victimParticipant = $victims->first()->participant;
        $entranceNumberBefore = $victimParticipant->entrance_number;
        $expectedEntranceNumberAfter = $this->entranceNumberAssigner->getNextParticipantEntranceNumber(
            $this->lobby
        );

        $this->eliminationRecorder->record($this->lobby, $offenders, $victims);

        $nActionsAfter = $this->lobby->fresh("actions")->actions->count();
        $latestAction = $this->lobby->latestAction();
        $elimination = $latestAction->elimination;
        $eliminationOffenders = $elimination->rumblerOffenders;
        $eliminationVictims = $elimination->rumblerVictims;
        $victimParticipantAfter = $victimParticipant->fresh();
        $entranceNumberAfter = $victimParticipantAfter->entrance_number;

        $this->assertEquals($nActionsBefore + 1, $nActionsAfter);
        $this->assertEquals($latestAction->getType(), Action::TYPE_ELIMINATION);

        $this->assertEquals($eliminationOffenders->count(), 1);
        $this->assertEquals($eliminationOffenders[0]->id, $offenders[0]->id);

        $this->assertEquals($eliminationVictims->count(), 1);
        $this->assertEquals($eliminationVictims[0]->id, $victims[0]->id);
        $this->assertGreaterThan($entranceNumberBefore, $entranceNumberAfter);
        $this->assertEquals($entranceNumberAfter, $expectedEntranceNumberAfter);
    }

    public function test_record_1o2_elimination()
    {
        $rumblers = $this->lobby->rumblers;

        $victims = new Collection([$rumblers[self::FOURTH_RUMBLER]]);
        $offenders = new Collection([
            $rumblers[self::SECOND_RUMBLER],
            $rumblers[self::THIRD_RUMBLER],
        ]);

        $nActionsBefore = $this->lobby->actions->count();

        $this->eliminationRecorder->record($this->lobby, $offenders, $victims);

        $nActionsAfter = $this->lobby->fresh("actions")->actions->count();
        $latestAction = $this->lobby->latestAction();
        $elimination = $latestAction->elimination;
        $eliminationOffenders = $elimination->rumblerOffenders;
        $eliminationVictims = $elimination->rumblerVictims;

        $this->assertEquals($nActionsBefore + 1, $nActionsAfter);
        $this->assertEquals($latestAction->getType(), Action::TYPE_ELIMINATION);

        $this->assertEquals($eliminationOffenders->count(), 2);
        $this->assertEquals($eliminationOffenders[0]->id, $offenders[0]->id);
        $this->assertEquals($eliminationOffenders[1]->id, $offenders[1]->id);

        $this->assertEquals($eliminationVictims->count(), 1);
        $this->assertEquals($eliminationVictims[0]->id, $victims[0]->id);
    }

    public function test_record_2o1_elimination()
    {
        $rumblers = $this->lobby->rumblers;

        $victims = new Collection([
            $rumblers[self::FIFTH_RUMBLER],
            $rumblers[self::SIXTH_RUMBLER],
        ]);
        $offenders = new Collection([$rumblers[self::SECOND_RUMBLER]]);

        $nActionsBefore = $this->lobby->actions->count();

        $this->eliminationRecorder->record($this->lobby, $offenders, $victims);

        $nActionsAfter = $this->lobby->fresh("actions")->actions->count();
        $latestAction = $this->lobby->latestAction();
        $elimination = $latestAction->elimination;
        $eliminationOffenders = $elimination->rumblerOffenders;
        $eliminationVictims = $elimination->rumblerVictims;

        $this->assertEquals($nActionsBefore + 1, $nActionsAfter);
        $this->assertEquals($latestAction->getType(), Action::TYPE_ELIMINATION);

        $this->assertEquals($eliminationOffenders->count(), 1);
        $this->assertEquals($eliminationOffenders[0]->id, $offenders[0]->id);

        $this->assertEquals($eliminationVictims->count(), 2);
        $this->assertEquals($eliminationVictims[0]->id, $victims[0]->id);
        $this->assertEquals($eliminationVictims[1]->id, $victims[1]->id);
    }

    public function test_record_2o2_elimination()
    {
        $rumblers = $this->lobby->rumblers;

        $victims = new Collection([
            $rumblers[self::SEVENTH_RUMBLER],
            $rumblers[self::EIGHTH_RUMBLER],
        ]);
        $offenders = new Collection([
            $rumblers[self::SECOND_RUMBLER],
            $rumblers[self::THIRD_RUMBLER],
        ]);

        $nActionsBefore = $this->lobby->actions->count();

        $this->eliminationRecorder->record($this->lobby, $offenders, $victims);

        $nActionsAfter = $this->lobby->fresh("actions")->actions->count();
        $latestAction = $this->lobby->latestAction();
        $elimination = $latestAction->elimination;
        $eliminationOffenders = $elimination->rumblerOffenders;
        $eliminationVictims = $elimination->rumblerVictims;

        $this->assertEquals($nActionsBefore + 1, $nActionsAfter);
        $this->assertEquals($latestAction->getType(), Action::TYPE_ELIMINATION);

        $this->assertEquals($eliminationOffenders->count(), 2);
        $this->assertEquals($eliminationOffenders[0]->id, $offenders[0]->id);
        $this->assertEquals($eliminationOffenders[1]->id, $offenders[1]->id);

        $this->assertEquals($eliminationVictims->count(), 2);
        $this->assertEquals($eliminationVictims[0]->id, $victims[0]->id);
        $this->assertEquals($eliminationVictims[1]->id, $victims[1]->id);
    }

    public function test_cannot_record_eliminated_victim()
    {
        $rumblers = $this->lobby->rumblers;

        $victims = new Collection([$rumblers[self::FIRST_RUMBLER]]);
        $offenders = new Collection([$rumblers[self::SECOND_RUMBLER]]);

        $this->expectException(EliminationRecorderException::class);

        $this->eliminationRecorder->record($this->lobby, $offenders, $victims);
        $this->eliminationRecorder->record($this->lobby, $offenders, $victims);
    }

    public function test_cannot_record_eliminated_offender()
    {
        $rumblers = $this->lobby->rumblers;

        $this->expectException(EliminationRecorderException::class);

        $this->eliminationRecorder->record(
            $this->lobby,
            collect([$rumblers[self::FIRST_RUMBLER]]),
            collect([$rumblers[self::SECOND_RUMBLER]])
        );
        $this->eliminationRecorder->record(
            $this->lobby,
            collect([$rumblers[self::SECOND_RUMBLER]]),
            collect([$rumblers[self::THIRD_RUMBLER]])
        );
    }
}

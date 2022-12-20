<?php

namespace Tests\Feature;

use App\Models\Lobby;
use App\Models\Wrestler;
use App\Services\EntranceNumberAssigner;
use App\Services\EntranceRecorder;
use Tests\TestCase;

class EntranceRecorderTest extends TestCase
{
    private Lobby $lobby;
    private EntranceRecorder $entranceRecorder;
    private EntranceNumberAssigner $entranceNumberAssigner;

    public function setUp(): void
    {
        parent::setUp();

        $this->entranceRecorder = app(EntranceRecorder::class);
        $this->entranceNumberAssigner = app(EntranceNumberAssigner::class);

        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();

        foreach ($this->lobby->participants as $participant) {
            $participant->entrance_number = $this->entranceNumberAssigner->getNextParticipantEntranceNumber(
                $this->lobby
            );
            $participant->save();
        }
    }
    public function test_records_multiple_entrances()
    {
        $wrestlers = Wrestler::factory()
            ->count(4)
            ->create();
        foreach ($wrestlers as $wrestler) {
            $this->entranceRecorder->record($this->lobby, $wrestler);
        }

        $rumblers = $this->lobby->fresh("rumblers.participant")->rumblers;

        foreach ($rumblers as $i => $rumbler) {
            $this->assertContains(
                $rumbler->wrestler_id,
                $wrestlers->pluck("id")->toArray()
            );

            $this->assertEquals($rumbler->entrance_number, $i + 1);
        }

        foreach ($rumblers as $i => $rumbler) {
            $this->assertNotNull($rumbler->participant);
            $this->assertSame(
                $rumbler->participant->entrance_number,
                $rumbler->entrance_number
            );
        }
    }
}

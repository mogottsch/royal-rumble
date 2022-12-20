<?php

namespace Tests\Feature;

use App\Models\Lobby;
use App\Models\Rumbler;
use App\Models\Wrestler;
use App\Services\ActionRecorder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActionRecorderTest extends TestCase
{
    private Lobby $lobby;
    private ActionRecorder $actionRecorder;

    public function setUp(): void
    {
        parent::setUp();

        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();

        $this->actionRecorder = new ActionRecorder();
    }

    public function test_records_multiple_entrances()
    {
        $wrestlers = Wrestler::all()->take(4);

        foreach ($wrestlers as $i => $wrestler) {
            $rumbler = new Rumbler();
            $rumbler->wrestler()->associate($wrestler);
            $rumbler->entranceNumber = $i + 1;
            $this->actionRecorder->recordEntrance($this->lobby, $rumbler);
        }

        $actions = $this->lobby->fresh("actions")->actions;

        foreach ($actions as $i => $action) {
            $this->assertEquals($i, $action->index);
        }
    }
}

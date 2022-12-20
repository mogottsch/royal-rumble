<?php

namespace Tests\Feature;

use App\Models\Lobby;
use App\Models\Wrestler;
use App\Services\EntranceRecorder;
use Tests\TestCase;

class EntranceRecorderTest extends TestCase
{
    private Lobby $lobby;
    private EntranceRecorder $entranceRecorder;

    public function setUp(): void
    {
        parent::setUp();

        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();

        $this->entranceRecorder = app(EntranceRecorder::class);
    }
    public function test_records_multiple_entrances()
    {
        $wrestlers = Wrestler::factory()
            ->count(4)
            ->create();
        foreach ($wrestlers as $wrestler) {
            $this->entranceRecorder->record($this->lobby, $wrestler);
        }

        $rumblers = $this->lobby->fresh("rumblers")->rumblers;

        foreach ($rumblers as $rumbler) {
            $this->assertContains(
                $rumbler->wrestler_id,
                $wrestlers->pluck("id")->toArray()
            );

            $this->assertContains($rumbler->entrance_number, [1, 2, 3, 4]);
        }
    }
}

<?php

namespace Tests\Feature;

use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use App\Models\Wrestler;
use Tests\TestCase;

class OffenderOwnerBackfillTest extends TestCase
{
    public function test_backfill_sets_only_unambiguous_offender_owners(): void
    {
        $lobby = Lobby::factory()->create();
        $ownedRumbler = Rumbler::factory()->for($lobby)->for(Wrestler::factory())->create(['entrance_number' => 1]);
        $ambiguousRumbler = Rumbler::factory()->for($lobby)->for(Wrestler::factory())->create(['entrance_number' => 2]);

        $owner = Participant::factory()->for($lobby)->create(['rumbler_id' => $ownedRumbler->id]);
        Participant::factory()->count(2)->for($lobby)->create(['rumbler_id' => $ambiguousRumbler->id]);

        $ownedElimination = Elimination::factory()->create();
        $ownedElimination->rumblerOffenders()->attach($ownedRumbler->id);
        $ambiguousElimination = Elimination::factory()->create();
        $ambiguousElimination->rumblerOffenders()->attach($ambiguousRumbler->id);

        $migration = require database_path('migrations/2026_08_06_150000_add_participant_id_to_offenders_table.php');
        $migration->up();

        $this->assertDatabaseHas('offenders', [
            'elimination_id' => $ownedElimination->id,
            'rumbler_id' => $ownedRumbler->id,
            'participant_id' => $owner->id,
        ]);
        $this->assertDatabaseHas('offenders', [
            'elimination_id' => $ambiguousElimination->id,
            'rumbler_id' => $ambiguousRumbler->id,
            'participant_id' => null,
        ]);
    }
}

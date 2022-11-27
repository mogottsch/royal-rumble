<?php

namespace Tests\Feature;

use App\Exceptions\EntranceNumberAssignerErrorCode;
use App\Exceptions\EntranceNumberAssignerException;
use App\Models\Lobby;
use App\Services\EntranceNumberAssigner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class EntranceNumberAssignerTest extends TestCase
{
    private EntranceNumberAssigner $entranceNumberAssigner;
    private Lobby $lobby;

    public function setUp(): void
    {
        parent::setUp();
        $this->entranceNumberAssigner = new EntranceNumberAssigner();
        $this->lobby = Lobby::factory()
            ->hasParticipants(4)
            ->create();
    }

    public function test_assigns_entrance_numbers()
    {
        $participantsEntranceNumbersMap = [
            $this->lobby->participants[0]->id => 1,
            $this->lobby->participants[1]->id => 2,
            $this->lobby->participants[2]->id => 3,
            $this->lobby->participants[3]->id => 4,
        ];

        $this->entranceNumberAssigner->assignEntranceNumbers(
            $this->lobby,
            $participantsEntranceNumbersMap
        );

        $this->assertEquals(
            $participantsEntranceNumbersMap,
            $this->lobby->participants
                ->pluck("entrance_number", "id")
                ->toArray()
        );
    }

    public function test_throws_exception_if_not_all_participants_have_an_entrance_number()
    {
        $participantsEntranceNumbersMap = [
            $this->lobby->participants[0]->id => 1,
            $this->lobby->participants[1]->id => 2,
            $this->lobby->participants[2]->id => 3,
        ];

        $this->expectException(EntranceNumberAssignerException::class);

        $this->entranceNumberAssigner->assignEntranceNumbers(
            $this->lobby,
            $participantsEntranceNumbersMap
        );
    }

    public function test_throws_exception_if_entrance_numbers_are_not_unique()
    {
        $participantsEntranceNumbersMap = [
            $this->lobby->participants[0]->id => 1,
            $this->lobby->participants[1]->id => 2,
            $this->lobby->participants[2]->id => 3,
            $this->lobby->participants[3]->id => 3,
        ];

        $this->expectException(EntranceNumberAssignerException::class);

        $this->entranceNumberAssigner->assignEntranceNumbers(
            $this->lobby,
            $participantsEntranceNumbersMap
        );
    }

    public function test_throws_exception_if_entrance_numbers_are_not_sequential()
    {
        $participantsEntranceNumbersMap = [
            $this->lobby->participants[0]->id => 1,
            $this->lobby->participants[1]->id => 2,
            $this->lobby->participants[2]->id => 4,
            $this->lobby->participants[3]->id => 5,
        ];

        $this->expectException(EntranceNumberAssignerException::class);

        $this->entranceNumberAssigner->assignEntranceNumbers(
            $this->lobby,
            $participantsEntranceNumbersMap
        );
    }
}

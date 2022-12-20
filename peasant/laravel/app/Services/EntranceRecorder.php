<?php

namespace App\Services;

use App\Exceptions\EntranceRecorderErrorCode;
use App\Exceptions\EntranceRecorderException;
use App\Models\Lobby;
use App\Models\Rumbler;
use App\Models\Wrestler;

class EntranceRecorder
{
    private Lobby $lobby;

    public function __construct(
        private ActionRecorder $actionRecorder,
        private EntranceNumberAssigner $entranceNumberAssigner
    ) {
    }

    public function record(Lobby $lobby, Wrestler $wrestler): Rumbler
    {
        $this->lobby = $lobby;
        if ($this->wrestlerAlreadyEntered($wrestler)) {
            throw new EntranceRecorderException(
                EntranceRecorderErrorCode::WRESTLER_ALREADY_ENTERED
            );
        }
        $rumbler = $this->createRumbler($wrestler);
        $this->assignParticipantIfSameEntranceNumber($this->lobby, $rumbler);

        $this->actionRecorder->recordEntrance($lobby, $rumbler);

        return $rumbler;
    }

    private function createRumbler(Wrestler $wrestler): Rumbler
    {
        $rumbler = new Rumbler();

        $rumbler->lobby()->associate($this->lobby);
        $rumbler->wrestler()->associate($wrestler);
        $rumbler->entrance_number = $this->entranceNumberAssigner->getNextRumblerEntranceNumber(
            $this->lobby
        );

        $rumbler->save();

        $this->lobby = $this->lobby->fresh("rumblers");

        return $rumbler;
    }

    private function wrestlerAlreadyEntered(Wrestler $wrestler): bool
    {
        return $this->lobby->rumblers->contains("wrestler_id", $wrestler->id);
    }

    private function assignParticipantIfSameEntranceNumber(
        Lobby $lobby,
        Rumbler $rumbler
    ): void {
        $participant = $lobby
            ->participants()
            ->where("entrance_number", $rumbler->entranceNumber)
            ->first();

        if (!$participant) {
            return;
        }
        $participant->rumbler()->associate($rumbler);
        $participant->save();
    }
}

<?php

namespace App\Services;

use App\Exceptions\EliminationRecorderErrorCode;
use App\Exceptions\EliminationRecorderException;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Offender;
use App\Models\Rumbler;
use App\Models\Victim;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class EliminationRecorder
{
    public function __construct(
        private ActionRecorder $actionRecorder,
        private EntranceNumberAssigner $entranceNumberAssigner
    ) {
    }

    public function record(
        Lobby $lobby,
        Collection $offenders,
        Collection $victims
    ) {
        $this->validateRumblers($lobby, $offenders, $victims);

        $elimination = $this->createElimination($offenders, $victims);

        $this->assignNewEntranceNumbers($lobby, $victims);

        $this->actionRecorder->recordElimination($lobby, $elimination);

        return $elimination;
    }

    private function validateRumblers(
        Lobby $lobby,
        Collection $victims,
        Collection $offenders
    ) {
        if (!$this->isRumblerCollection($offenders)) {
            throw new EliminationRecorderException(
                EliminationRecorderErrorCode::OFFENDERS_NOT_RUMBLERS
            );
        }

        if (!$this->isRumblerCollection($victims)) {
            throw new EliminationRecorderException(
                EliminationRecorderErrorCode::VICTIMS_NOT_RUMBLERS
            );
        }

        if (
            $this->anyRumblerIsEliminated($victims) ||
            $this->anyRumblerIsEliminated($offenders)
        ) {
            throw new EliminationRecorderException(
                EliminationRecorderErrorCode::RUMBLER_ALREADY_ELIMINATED
            );
        }

        if (
            $this->anyRumblerIsNotInLobby($lobby, $victims) ||
            $this->anyRumblerIsNotInLobby($lobby, $offenders)
        ) {
            throw new EliminationRecorderException(
                EliminationRecorderErrorCode::RUMBLER_NOT_IN_LOBBY
            );
        }
    }

    private function isRumblerCollection(Collection $collection): bool
    {
        return $collection->every(function ($item) {
            return $item instanceof Rumbler;
        });
    }

    private function anyRumblerIsEliminated(Collection $rumblers): bool
    {
        return $rumblers->some(function (Rumbler $rumbler) {
            return $this->isEliminated($rumbler);
        });
    }

    private function anyRumblerIsNotInLobby(
        Lobby $lobby,
        Collection $rumblers
    ): bool {
        return $rumblers->some(function (Rumbler $rumbler) use ($lobby) {
            return $rumbler->lobby_id !== $lobby->id;
        });
    }

    private function isEliminated(Rumbler $rumbler): bool
    {
        $rumbler = $rumbler->fresh("victimEliminations");
        return $rumbler->isEliminated();
    }

    private function createElimination(
        Collection $offenders,
        Collection $victims
    ): Elimination {
        $elimination = new Elimination();
        $elimination->save();

        $this->recordOffenders($elimination, $offenders);
        $this->recordVictims($elimination, $victims);

        $elimination->fresh(["rumblerOffenders", "rumblerVictims"]);

        return $elimination;
    }

    private function recordOffenders(
        Elimination $elimination,
        Collection $offenders
    ) {
        foreach ($offenders as $rumbler) {
            $this->createOffender($elimination, $rumbler);
        }
    }

    private function createOffender(
        Elimination $elimination,
        $rumbler
    ): Offender {
        if (!$rumbler instanceof Rumbler) {
            throw new InvalidArgumentException(
                "Rumbler must be an instance of Rumbler"
            );
        }

        $offender = new Offender();
        $offender->elimination()->associate($elimination);
        $offender->rumbler()->associate($rumbler);
        $offender->save();

        return $offender;
    }

    private function recordVictims(
        Elimination $elimination,
        Collection $victims
    ) {
        foreach ($victims as $rumbler) {
            $this->createVictim($elimination, $rumbler);
        }
    }

    private function createVictim(Elimination $elimination, $rumbler): Victim
    {
        if (!$rumbler instanceof Rumbler) {
            throw new InvalidArgumentException(
                "Rumbler must be an instance of Rumbler"
            );
        }

        $victim = new Victim();
        $victim->elimination()->associate($elimination);
        $victim->rumbler()->associate($rumbler);
        $victim->save();

        return $victim;
    }

    private function assignNewEntranceNumbers(Lobby $lobby, Collection $victims)
    {
        foreach ($victims as $rumbler) {
            if (!$rumbler->participant) {
                continue;
            }

            $this->entranceNumberAssigner->assignParticipantNextEntranceNumber(
                $lobby,
                $rumbler->participant
            );
        }
    }
}

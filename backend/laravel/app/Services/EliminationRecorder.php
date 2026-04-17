<?php

namespace App\Services;

use App\Exceptions\EliminationRecorderErrorCode;
use App\Exceptions\EliminationRecorderException;
use App\Models\Chug;
use App\Models\DrinkDistribution;
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
        Collection $victims,
        Collection $offenders
    ) {
        $this->validateRumblers($lobby, $offenders, $victims);

        $elimination = $this->createElimination($offenders, $victims);

        $this->recordChugs($lobby, $elimination, $victims);
        $this->recordNpcPenalties($lobby, $elimination, $offenders, $victims);

        $this->assignNewEntranceNumbers($lobby, $victims);

        $this->actionRecorder->recordElimination($lobby, $elimination);

        return $elimination;
    }

    private function recordChugs(Lobby $lobby, Elimination $elimination, Collection $victims): void
    {
        foreach ($victims as $victim) {
            $participant = $victim->participant;
            if (!$participant) {
                continue;
            }
            Chug::create([
                "lobby_id" => $lobby->id,
                "participant_id" => $participant->id,
                "elimination_id" => $elimination->id,
            ]);
        }
    }

    private function recordNpcPenalties(
        Lobby $lobby,
        Elimination $elimination,
        Collection $offenders,
        Collection $victims
    ): void {
        $schluecke = (int) $lobby->schluecke_on_npc_elimination;
        $shots = (int) $lobby->shots_on_npc_elimination;
        if ($schluecke === 0 && $shots === 0) {
            return;
        }

        $participants = $lobby->participants()->get();
        foreach ($offenders as $offender) {
            if ($offender->participant) {
                continue;
            }
            foreach ($victims as $victim) {
                foreach ($participants as $participant) {
                    DrinkDistribution::create([
                        "lobby_id" => $lobby->id,
                        "elimination_id" => $elimination->id,
                        "offender_rumbler_id" => $offender->id,
                        "victim_rumbler_id" => $victim->id,
                        "giver_participant_id" => null,
                        "receiver_participant_id" => $participant->id,
                        "schluecke" => $schluecke,
                        "shots" => $shots,
                        "kind" => DrinkDistribution::KIND_NPC_ELIMINATION_PENALTY,
                    ]);
                }
            }
        }
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

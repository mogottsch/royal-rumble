<?php

namespace App\Services;

use App\Exceptions\EntranceNumberAssignerErrorCode;
use App\Exceptions\EntranceNumberAssignerException;
use App\Models\Lobby;
use App\Models\Participant;

class EntranceNumberAssigner
{
    const NEXT_OFFSET = 1;

    public function assignEntranceNumbers(
        Lobby $lobby,
        array $participantsEntranceNumbersMap
    ) {
        $this->validateParticipantsEntranceNumbersMap(
            $lobby,
            $participantsEntranceNumbersMap
        );

        foreach ($lobby->participants as $participant) {
            $participant->entrance_number =
                $participantsEntranceNumbersMap[$participant->id];
            $participant->save();
        }
    }

    private function validateParticipantsEntranceNumbersMap(
        Lobby $lobby,
        array $participantsEntranceNumbersMap
    ) {
        if (
            !$this->correctNumberOfParticipants(
                $lobby,
                $participantsEntranceNumbersMap
            )
        ) {
            throw new EntranceNumberAssignerException(
                EntranceNumberAssignerErrorCode::UNEXPECTED_NUMBER_OF_PARTICIPANTS
            );
        }

        if (
            !$this->allParticipantsHaveAnEntranceNumber(
                $lobby,
                $participantsEntranceNumbersMap
            )
        ) {
            throw new EntranceNumberAssignerException(
                EntranceNumberAssignerErrorCode::NOT_ALL_PARTICIPANTS_HAVE_AN_ENTRANCE_NUMBER
            );
        }

        if (
            !$this->allEntranceNumbersAreUnique($participantsEntranceNumbersMap)
        ) {
            throw new EntranceNumberAssignerException(
                EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_ARE_NOT_UNIQUE
            );
        }
        if (
            !$this->allEntranceNumbersArePositive(
                $participantsEntranceNumbersMap
            )
        ) {
            throw new EntranceNumberAssignerException(
                EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_ARE_NOT_POSITIVE
            );
        }
        if (
            !$this->allEntranceNumbersAreSequential(
                $participantsEntranceNumbersMap
            )
        ) {
            throw new EntranceNumberAssignerException(
                EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_ARE_NOT_SEQUENTIAL
            );
        }

        if (
            !$this->entranceNumbersStartWithOne($participantsEntranceNumbersMap)
        ) {
            throw new EntranceNumberAssignerException(
                EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_DO_NOT_START_WITH_ONE
            );
        }
    }

    private function correctNumberOfParticipants(
        Lobby $lobby,
        array $participantsEntranceNumbersMap
    ) {
        return count($participantsEntranceNumbersMap) ===
            $lobby->participants->count();
    }

    private function allParticipantsHaveAnEntranceNumber(
        Lobby $lobby,
        array $participantsEntranceNumbersMap
    ) {
        foreach ($lobby->participants as $participant) {
            if (!isset($participantsEntranceNumbersMap[$participant->id])) {
                return false;
            }
        }
        return true;
    }

    private function allEntranceNumbersAreUnique(
        array $participantsEntranceNumbersMap
    ) {
        return count(array_unique($participantsEntranceNumbersMap)) ===
            count($participantsEntranceNumbersMap);
    }

    private function allEntranceNumbersArePositive(
        array $participantsEntranceNumbersMap
    ) {
        foreach ($participantsEntranceNumbersMap as $entranceNumber) {
            if ($entranceNumber <= 0) {
                return false;
            }
        }
        return true;
    }

    private function allEntranceNumbersAreSequential(
        array $participantsEntranceNumbersMap
    ) {
        $sortedEntranceNumbers = $participantsEntranceNumbersMap;
        sort($sortedEntranceNumbers);
        $expectedEntranceNumbers = range(
            1,
            count($participantsEntranceNumbersMap)
        );
        return $sortedEntranceNumbers === $expectedEntranceNumbers;
    }

    private function entranceNumbersStartWithOne(
        array $participantsEntranceNumbersMap
    ) {
        return min($participantsEntranceNumbersMap) === 1;
    }

    public function getNextRumblerEntranceNumber(Lobby $lobby): int
    {
        $nRumblers = $lobby->fresh("rumblers")->rumblers->count();

        return $nRumblers + self::NEXT_OFFSET;
    }

    public function getNextParticipantEntranceNumber(Lobby $lobby)
    {
        $nextParticipantEntranceNumber =
            $this->getHighestParticipantEntranceNumber($lobby) +
            self::NEXT_OFFSET;

        $nextRumblerEntranceNumber = $this->getNextRumblerEntranceNumber(
            $lobby
        );
        return max($nextParticipantEntranceNumber, $nextRumblerEntranceNumber);
    }

    private function getHighestParticipantEntranceNumber(Lobby $lobby)
    {
        return $lobby
            ->fresh("participants")
            ->participants->max("entrance_number");
    }

    public function assignParticipantNextEntranceNumber(
        Lobby $lobby,
        Participant $participant
    ) {
        $participant->entrance_number = $this->getNextParticipantEntranceNumber(
            $lobby
        );
        $participant->save();
    }
}

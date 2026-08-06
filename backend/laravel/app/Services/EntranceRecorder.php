<?php

namespace App\Services;

use App\Exceptions\EntranceRecorderErrorCode;
use App\Exceptions\EntranceRecorderException;
use App\Models\Lobby;
use App\Models\Rumbler;
use App\Models\Wrestler;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class EntranceRecorder
{
    private Lobby $lobby;

    public function __construct(
        private ActionRecorder $actionRecorder,
        private EntranceNumberAssigner $entranceNumberAssigner
    ) {}

    public function record(Lobby $lobby, Wrestler $wrestler): Rumbler
    {
        try {
            return DB::transaction(function () use ($lobby, $wrestler): Rumbler {
                $this->lobby = Lobby::query()
                    ->whereKey($lobby->id)
                    ->lockForUpdate()
                    ->firstOrFail();
                $this->lobby->load('rumblers');

                if ($this->rumbleAlreadyFull()) {
                    throw new EntranceRecorderException(
                        EntranceRecorderErrorCode::RUMBLE_ALREADY_FULL
                    );
                }
                if ($this->wrestlerAlreadyEntered($wrestler)) {
                    throw new EntranceRecorderException(
                        EntranceRecorderErrorCode::WRESTLER_ALREADY_ENTERED
                    );
                }

                $rumbler = $this->createRumbler($wrestler);
                $this->assignParticipantIfSameEntranceNumber($this->lobby, $rumbler);
                $this->actionRecorder->recordEntrance($this->lobby, $rumbler);

                return $rumbler;
            }, 3);
        } catch (QueryException $exception) {
            if (! $this->isUniqueConstraintViolation($exception)) {
                throw $exception;
            }

            if (Rumbler::query()
                ->where('lobby_id', $lobby->id)
                ->where('wrestler_id', $wrestler->id)
                ->exists()) {
                throw new EntranceRecorderException(
                    EntranceRecorderErrorCode::WRESTLER_ALREADY_ENTERED,
                    previous: $exception
                );
            }

            throw new EntranceRecorderException(
                EntranceRecorderErrorCode::ENTRANCE_CONFLICT,
                previous: $exception
            );
        }
    }

    private function createRumbler(Wrestler $wrestler): Rumbler
    {
        $rumbler = new Rumbler;

        $rumbler->lobby()->associate($this->lobby);
        $rumbler->wrestler()->associate($wrestler);
        $rumbler->entrance_number = $this->entranceNumberAssigner->getNextRumblerEntranceNumber(
            $this->lobby
        );

        $this->lobby->rumblers()->save($rumbler);
        $this->lobby = $this->lobby->fresh('rumblers');

        return $rumbler;
    }

    private function wrestlerAlreadyEntered(Wrestler $wrestler): bool
    {
        return $this->lobby->rumblers->contains('wrestler_id', $wrestler->id);
    }

    private function rumbleAlreadyFull(): bool
    {
        return $this->lobby->rumblers->count() >= (int) $this->lobby->rumble_size;
    }

    private function assignParticipantIfSameEntranceNumber(
        Lobby $lobby,
        Rumbler $rumbler
    ): void {
        assert($rumbler->entrance_number > 0);
        $participant = $lobby
            ->participants()
            ->where('entrance_number', $rumbler->entrance_number)
            ->lockForUpdate()
            ->first();

        if (! $participant) {
            return;
        }
        $participant->rumbler()->associate($rumbler);
        $participant->save();
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        return in_array((string) $exception->getCode(), ['23000', '23505'], true);
    }
}

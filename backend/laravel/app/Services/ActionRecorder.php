<?php

namespace App\Services;

use App\Events\LobbyUpdated;
use App\Models\Action;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Rumbler;
use Illuminate\Support\Facades\DB;

class ActionRecorder
{
    public function recordEntrance(Lobby $lobby, Rumbler $rumbler): void
    {
        DB::transaction(function () use ($lobby, $rumbler): void {
            $lobby = $this->lockedLobby($lobby);
            $action = $this->createAction($lobby);
            $action->rumbler()->associate($rumbler);
            $action->save();
            LobbyUpdated::dispatchAfterCommit($lobby);
        }, 3);
    }

    public function recordElimination(Lobby $lobby, Elimination $elimination): void
    {
        DB::transaction(function () use ($lobby, $elimination): void {
            $lobby = $this->lockedLobby($lobby);
            $action = $this->createAction($lobby);
            $action->elimination()->associate($elimination);
            $action->save();
            LobbyUpdated::dispatchAfterCommit($lobby);
        }, 3);
    }

    private function lockedLobby(Lobby $lobby): Lobby
    {
        return Lobby::query()->whereKey($lobby->id)->lockForUpdate()->firstOrFail();
    }

    private function createAction(Lobby $lobby): Action
    {
        $action = new Action;
        $action->lobby()->associate($lobby);
        $currentMaximum = $lobby->actions()->max('index');
        $action->index = $currentMaximum === null ? 0 : ((int) $currentMaximum) + 1;
        $action->save();

        return $action;
    }
}

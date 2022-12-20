<?php

namespace App\Services;

use App\Models\Action;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Rumbler;

class ActionRecorder
{
    public function recordEntrance(Lobby $lobby, Rumbler $rumbler)
    {
        $action = $this->createAction($lobby, $rumbler);

        $action->rumbler()->associate($rumbler);

        $action->save();
    }

    public function recordElimination(Lobby $lobby, Elimination $elimination)
    {
        $action = $this->createAction($lobby);

        $action->elimination()->associate($elimination);

        $action->save();
    }

    private function createAction(Lobby $lobby)
    {
        $action = new Action();
        $action->lobby()->associate($lobby);
        $action->index = $this->getNextActionIndex($lobby);

        $action->save();

        return $action;
    }

    private function getNextActionIndex(Lobby $lobby)
    {
        return $lobby->fresh("actions")->actions->count();
    }
}

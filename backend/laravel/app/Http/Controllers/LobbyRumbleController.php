<?php

namespace App\Http\Controllers;

use App\Exceptions\EliminationRecorderException;
use App\Exceptions\EntranceRecorderException;
use App\Http\Requests\StoreEliminationRequest;
use App\Http\Requests\StoreRumblerRequest;
use App\Models\Lobby;
use App\Models\Wrestler;
use App\Services\EliminationRecorder;
use App\Services\EntranceRecorder;
use Illuminate\Http\Response;

class LobbyRumbleController extends Controller
{
    public function entrance(
        StoreRumblerRequest $request,
        Lobby $lobby,
        EntranceRecorder $entranceRecorder
    ) {
        $wrestler_id = $request->validated()["wrestler_id"];
        $wrestler = Wrestler::findOrFail($wrestler_id);

        try {
            $rumbler = $entranceRecorder->record($lobby, $wrestler);
        } catch (EntranceRecorderException $e) {
            return response()->json(
                ["message" => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response(status: Response::HTTP_CREATED);
    }

    public function elimination(
        StoreEliminationRequest $request,
        Lobby $lobby,
        EliminationRecorder $eliminationRecorder
    ) {
        $victim_ids = $request->victim_ids;
        $offender_ids = $request->offender_ids;

        if (!$victim_ids || !$offender_ids) {
            return response()->json(
                [
                    "message" =>
                        "You must provide at least one victim and one offender",
                ],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $victimRumblers = $lobby
            ->rumblers()
            ->whereIn("id", $victim_ids)
            ->get();
        $offenderRumblers = $lobby
            ->rumblers()
            ->whereIn("id", $offender_ids)
            ->get();

        if ($victimRumblers->count() !== count($victim_ids)) {
            return response()->json(
                ["message" => "One or more victims could not be found"],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if ($offenderRumblers->count() !== count($offender_ids)) {
            return response()->json(
                ["message" => "One or more offenders could not be found"],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        try {
            $eliminationRecorder->record(
                $lobby,
                $victimRumblers,
                $offenderRumblers
            );
        } catch (EliminationRecorderException $e) {
            return response()->json(
                ["message" => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response(status: Response::HTTP_CREATED);
    }
}

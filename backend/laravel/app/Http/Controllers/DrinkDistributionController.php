<?php

namespace App\Http\Controllers;

use App\Exceptions\DrinkDistributionException;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use App\Services\DrinkDistributionRecorder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DrinkDistributionController extends Controller
{
    public function store(
        Request $request,
        Lobby $lobby,
        DrinkDistributionRecorder $recorder
    ) {
        $data = $request->validate([
            "elimination_id" => ["required", "integer"],
            "offender_rumbler_id" => ["required", "integer"],
            "victim_rumbler_id" => ["required", "integer"],
            "splits" => ["required", "array", "min:1"],
            "splits.*.receiver_participant_id" => ["required", "integer"],
            "splits.*.schluecke" => ["nullable", "integer", "min:0"],
            "splits.*.shots" => ["nullable", "integer", "min:0"],
        ]);

        $giverId = (int) $request->header("X-Participant-Id", 0);
        if ($giverId <= 0) {
            return response()->json(
                ["message" => "Missing X-Participant-Id header."],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $giver = Participant::where("lobby_id", $lobby->id)->find($giverId);
        if (!$giver) {
            return response()->json(
                ["message" => "Giver participant not found in lobby."],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $elimination = Elimination::find($data["elimination_id"]);
        $offender = Rumbler::where("lobby_id", $lobby->id)->find($data["offender_rumbler_id"]);
        $victim = Rumbler::where("lobby_id", $lobby->id)->find($data["victim_rumbler_id"]);

        if (!$elimination || !$offender || !$victim) {
            return response()->json(
                ["message" => "Elimination, offender or victim not found."],
                Response::HTTP_NOT_FOUND
            );
        }

        try {
            $recorder->recordEliminationReward(
                $lobby,
                $elimination,
                $offender,
                $victim,
                $giver,
                $data["splits"]
            );
        } catch (DrinkDistributionException $e) {
            return response()->json(
                ["message" => $e->getMessage(), "code" => $e->errorCode->name],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response(status: Response::HTTP_CREATED);
    }
}

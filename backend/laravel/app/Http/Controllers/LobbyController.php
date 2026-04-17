<?php

namespace App\Http\Controllers;

use App\Exceptions\EntranceNumberAssignerException;
use App\Http\Requests\AssignEntranceNumbersRequest;
use App\Http\Requests\StoreLobbyRequest;
use App\Http\Resources\LobbyResource;
use App\Models\Lobby;
use App\Services\EntranceNumberAssigner;
use App\Services\LobbyCreator;
use Illuminate\Http\Response;

class LobbyController extends Controller
{
    public function get(Lobby $lobby)
    {
        return response()->json(
            ["data" => ["lobby" => new LobbyResource($lobby)]],
            Response::HTTP_OK
        );
    }

    public function store(
        StoreLobbyRequest $request,
        LobbyCreator $lobbyCreator
    ) {
        $lobby = $lobbyCreator->createWithParticipants(
            collect($request->get("participants")),
            $request->only([
                "schluecke_per_elimination",
                "shots_per_elimination",
                "schluecke_on_npc_elimination",
                "shots_on_npc_elimination",
            ])
        );
        return response()->json(
            ["data" => ["lobby" => new LobbyResource($lobby)]],
            Response::HTTP_CREATED
        );
    }

    public function assignEntranceNumbers(
        AssignEntranceNumbersRequest $request,
        Lobby $lobby,
        EntranceNumberAssigner $entranceNumberAssigner
    ) {
        $participantEntranceNumbersMap = $request->validated()[
            "participantEntranceNumbers"
        ];
        try {
            $entranceNumberAssigner->assignEntranceNumbers(
                $lobby,
                $participantEntranceNumbersMap
            );
        } catch (EntranceNumberAssignerException $e) {
            return response()->json(
                ["message" => $e->getMessage(), "code" => $e->getCode()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response()->json(
            ["data" => ["lobby" => $lobby]],
            Response::HTTP_OK
        );
    }
}

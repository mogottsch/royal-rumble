<?php

namespace App\Http\Controllers;

use App\Exceptions\EntranceNumberAssignerException;
use App\Http\Requests\AssignEntranceNumbersRequest;
use App\Http\Requests\StoreLobbyRequest;
use App\Models\Lobby;
use App\Services\EntranceNumberAssigner;
use App\Services\LobbyCreator;
use Illuminate\Http\Response;

class LobbyController extends Controller
{
    public function get(Lobby $lobby)
    {
        $lobby->load(["participants", "rumblers", "actions"]);
        return response()->json(
            ["data" => ["lobby" => $lobby]],
            Response::HTTP_CREATED
        );
    }

    public function store(
        StoreLobbyRequest $request,
        LobbyCreator $lobbyCreator
    ) {
        $lobby = $lobbyCreator->createWithParticipants(
            collect($request->get("participants"))
        );
        return response()->json(
            ["data" => ["lobby" => $lobby]],
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

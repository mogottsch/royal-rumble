<?php

namespace App\Http\Controllers;

use App\Events\LobbyUpdated;
use App\Exceptions\EntranceNumberAssignerException;
use App\Http\Requests\AssignEntranceNumbersRequest;
use App\Http\Requests\StoreLobbyRequest;
use App\Http\Requests\UpdateLobbySettingsRequest;
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
                "rumble_size",
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

    public function updateSettings(
        UpdateLobbySettingsRequest $request,
        Lobby $lobby
    ) {
        $validated = $request->validated();
        $minRumbleSize = max(
            $lobby->participants()->count(),
            $lobby->rumblers()->count(),
            (int) ($lobby->participants()->max("entrance_number") ?? 0),
            1
        );

        if ((int) $validated["rumble_size"] < $minRumbleSize) {
            return response()->json(
                [
                    "message" =>
                        "Rumble size cannot be lower than the current match state.",
                ],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        foreach ($validated as $key => $value) {
            $lobby->{$key} = $value;
        }
        $lobby->save();

        LobbyUpdated::dispatch($lobby->fresh());

        return response()->json(
            ["data" => ["lobby" => new LobbyResource($lobby->fresh())]],
            Response::HTTP_OK
        );
    }
}

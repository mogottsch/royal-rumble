<?php

namespace App\Http\Controllers;

use App\Exceptions\EntranceNumberAssignerException;
use App\Http\Requests\AssignEntranceNumbersRequest;
use App\Http\Requests\StoreLobbyRequest;
use App\Models\Lobby;
use App\Models\Participant;
use App\Services\EntranceNumberAssigner;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\Feature\Http\AssignEntranceNumbers;

class LobbyController extends Controller
{
    public function store(StoreLobbyRequest $request)
    {
        $lobby = Lobby::create();
        foreach ($request->participants as $participantName) {
            $participant = new Participant();
            $participant->name = $participantName;
            $participant->lobby()->associate($lobby);
            $participant->save();
        }

        $lobby->load("participants");
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

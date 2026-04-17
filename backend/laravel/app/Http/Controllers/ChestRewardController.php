<?php

namespace App\Http\Controllers;

use App\Models\ChestReward;
use App\Models\Lobby;
use App\Models\Participant;
use App\Services\ChestRewardResolver;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ChestRewardController extends Controller
{
    public function roll(
        Request $request,
        Lobby $lobby,
        ChestReward $chestReward,
        ChestRewardResolver $resolver
    ) {
        $data = $request->validate([
            "chest_type" => ["required", "string", "in:safe,group,chaos"],
        ]);

        if ($chestReward->lobby_id !== $lobby->id) {
            return response()->json(
                ["message" => "Chest reward not found in lobby."],
                Response::HTTP_NOT_FOUND
            );
        }

        $chooser = $this->resolveChooser($request, $lobby);
        if ($chooser instanceof Response) {
            return $chooser;
        }

        try {
            $result = $resolver->resolve($lobby, $chestReward, $chooser, $data["chest_type"]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(
                ["message" => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response()->json(["data" => $result], Response::HTTP_CREATED);
    }

    public function acknowledge(
        Request $request,
        Lobby $lobby,
        ChestReward $chestReward,
        ChestRewardResolver $resolver
    ) {
        if ($chestReward->lobby_id !== $lobby->id) {
            return response()->json(
                ["message" => "Chest reward not found in lobby."],
                Response::HTTP_NOT_FOUND
            );
        }

        $chooser = $this->resolveChooser($request, $lobby);
        if ($chooser instanceof Response) {
            return $chooser;
        }

        try {
            $result = $resolver->acknowledge($lobby, $chestReward, $chooser);
        } catch (\InvalidArgumentException $e) {
            return response()->json(
                ["message" => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response()->json(["data" => $result], Response::HTTP_OK);
    }

    private function resolveChooser(Request $request, Lobby $lobby): Participant|JsonResponse
    {
        $chooserId = (int) $request->header("X-Participant-Id", 0);
        if ($chooserId <= 0) {
            return response()->json(
                ["message" => "Missing X-Participant-Id header."],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $chooser = Participant::where("lobby_id", $lobby->id)->find($chooserId);
        if (!$chooser) {
            return response()->json(
                ["message" => "Chooser participant not found in lobby."],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return $chooser;
    }
}

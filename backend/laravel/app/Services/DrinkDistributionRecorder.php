<?php

namespace App\Services;

use App\Events\LobbyUpdated;
use App\Models\ChestReward;
use App\Exceptions\DrinkDistributionErrorCode;
use App\Exceptions\DrinkDistributionException;
use App\Models\DrinkDistribution;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;

class DrinkDistributionRecorder
{
    public function recordEliminationReward(
        Lobby $lobby,
        Elimination $elimination,
        Rumbler $offender,
        Rumbler $victim,
        Participant $giver,
        array $splits
    ): void {
        $this->validate($lobby, $elimination, $offender, $victim, $giver, $splits);

        foreach ($splits as $split) {
            DrinkDistribution::create([
                "lobby_id" => $lobby->id,
                "elimination_id" => $elimination->id,
                "offender_rumbler_id" => $offender->id,
                "victim_rumbler_id" => $victim->id,
                "giver_participant_id" => $giver->id,
                "receiver_participant_id" => (int) $split["receiver_participant_id"],
                "schluecke" => (int) ($split["schluecke"] ?? 0),
                "shots" => (int) ($split["shots"] ?? 0),
                "kind" => DrinkDistribution::KIND_ELIMINATION_REWARD,
            ]);
        }

        LobbyUpdated::dispatch($lobby->fresh());
    }

    public function recordChestRewardDistribution(
        Lobby $lobby,
        ChestReward $chestReward,
        Participant $giver,
        array $splits
    ): void {
        $this->validateChestReward($lobby, $chestReward, $giver, $splits);

        foreach ($splits as $split) {
            DrinkDistribution::create([
                "lobby_id" => $lobby->id,
                "elimination_id" => $chestReward->elimination_id,
                "offender_rumbler_id" => $chestReward->offender_rumbler_id,
                "victim_rumbler_id" => $chestReward->victim_rumbler_id,
                "giver_participant_id" => $giver->id,
                "receiver_participant_id" => (int) $split["receiver_participant_id"],
                "schluecke" => (int) ($split["schluecke"] ?? 0),
                "shots" => (int) ($split["shots"] ?? 0),
                "kind" => DrinkDistribution::KIND_CHEST_REWARD,
            ]);
        }

        $chestReward->status = ChestReward::STATUS_RESOLVED;
        $chestReward->save();

        LobbyUpdated::dispatch($lobby->fresh());
    }

    private function validate(
        Lobby $lobby,
        Elimination $elimination,
        Rumbler $offender,
        Rumbler $victim,
        Participant $giver,
        array $splits
    ): void {
        if ($giver->lobby_id !== $lobby->id) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::GIVER_NOT_IN_LOBBY);
        }
        if ($giver->rumbler_id !== $offender->id) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::GIVER_DOES_NOT_OWN_OFFENDER);
        }
        if ($offender->lobby_id !== $lobby->id || $victim->lobby_id !== $lobby->id) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::OFFENDER_VICTIM_MISMATCH);
        }

        $offenderInElim = $elimination->rumblerOffenders()->where("rumblers.id", $offender->id)->exists();
        $victimInElim = $elimination->rumblerVictims()->where("rumblers.id", $victim->id)->exists();
        if (!$offenderInElim || !$victimInElim) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::OFFENDER_VICTIM_MISMATCH);
        }

        $alreadyDistributed = DrinkDistribution::query()
            ->where("elimination_id", $elimination->id)
            ->where("offender_rumbler_id", $offender->id)
            ->where("victim_rumbler_id", $victim->id)
            ->where("giver_participant_id", $giver->id)
            ->where("kind", DrinkDistribution::KIND_ELIMINATION_REWARD)
            ->exists();
        if ($alreadyDistributed) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::ALREADY_DISTRIBUTED);
        }

        $participantIds = $lobby->participants()->pluck("id")->all();
        foreach ($splits as $split) {
            $receiverId = (int) ($split["receiver_participant_id"] ?? 0);
            if (!in_array($receiverId, $participantIds, true)) {
                throw new DrinkDistributionException(DrinkDistributionErrorCode::RECEIVER_NOT_IN_LOBBY);
            }
        }

        $schlueckeSum = array_sum(array_map(fn($s) => (int) ($s["schluecke"] ?? 0), $splits));
        $shotsSum = array_sum(array_map(fn($s) => (int) ($s["shots"] ?? 0), $splits));
        if ($schlueckeSum !== (int) $lobby->schluecke_per_elimination) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::WRONG_SCHLUECKE_SUM);
        }
        if ($shotsSum !== (int) $lobby->shots_per_elimination) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::WRONG_SHOTS_SUM);
        }
    }

    private function validateChestReward(
        Lobby $lobby,
        ChestReward $chestReward,
        Participant $giver,
        array $splits
    ): void {
        if ($giver->lobby_id !== $lobby->id) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::GIVER_NOT_IN_LOBBY);
        }
        if ($chestReward->lobby_id !== $lobby->id) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::OFFENDER_VICTIM_MISMATCH);
        }
        if ($chestReward->chooser_participant_id !== $giver->id) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::GIVER_DOES_NOT_OWN_OFFENDER);
        }
        if ($chestReward->status !== ChestReward::STATUS_PENDING_DISTRIBUTION) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::ALREADY_DISTRIBUTED);
        }

        $participantIds = $lobby->participants()->pluck("id")->all();
        foreach ($splits as $split) {
            $receiverId = (int) ($split["receiver_participant_id"] ?? 0);
            if (!in_array($receiverId, $participantIds, true)) {
                throw new DrinkDistributionException(DrinkDistributionErrorCode::RECEIVER_NOT_IN_LOBBY);
            }
        }

        $schlueckeSum = array_sum(array_map(fn($s) => (int) ($s["schluecke"] ?? 0), $splits));
        $shotsSum = array_sum(array_map(fn($s) => (int) ($s["shots"] ?? 0), $splits));

        if ($schlueckeSum !== (int) $chestReward->pending_schluecke) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::WRONG_SCHLUECKE_SUM);
        }
        if ($shotsSum !== (int) $chestReward->pending_shots) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::WRONG_SHOTS_SUM);
        }

        $selfSplit = collect($splits)
            ->firstWhere("receiver_participant_id", $giver->id);

        $selfSchluecke = (int) ($selfSplit["schluecke"] ?? 0);
        $selfShots = (int) ($selfSplit["shots"] ?? 0);

        if ($selfSchluecke < (int) $chestReward->minimum_self_schluecke) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::WRONG_SCHLUECKE_SUM);
        }
        if ($selfShots < (int) $chestReward->minimum_self_shots) {
            throw new DrinkDistributionException(DrinkDistributionErrorCode::WRONG_SHOTS_SUM);
        }
    }
}

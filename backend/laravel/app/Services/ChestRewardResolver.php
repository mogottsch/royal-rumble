<?php

namespace App\Services;

use App\Events\LobbyUpdated;
use App\Models\ChestReward;
use App\Models\DrinkDistribution;
use App\Models\Elimination;
use App\Models\Lobby;
use App\Models\Participant;
use App\Models\Rumbler;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class ChestRewardResolver
{
    public function createPendingRewards(
        Lobby $lobby,
        Elimination $elimination,
        Collection $offenders,
        Collection $victims
    ): void {
        if (!$lobby->mystery_chests_enabled) {
            return;
        }

        foreach ($offenders as $offender) {
            if (!$offender instanceof Rumbler || !$offender->participant) {
                continue;
            }

            foreach ($victims as $victim) {
                if (!$victim instanceof Rumbler) {
                    continue;
                }

                ChestReward::create([
                    "lobby_id" => $lobby->id,
                    "elimination_id" => $elimination->id,
                    "offender_rumbler_id" => $offender->id,
                    "victim_rumbler_id" => $victim->id,
                    "chooser_participant_id" => $offender->participant->id,
                    "status" => ChestReward::STATUS_PENDING_CHOICE,
                ]);
            }
        }
    }

    public function resolve(
        Lobby $lobby,
        ChestReward $chestReward,
        Participant $chooser,
        string $chestType
    ): array {
        if (!$lobby->mystery_chests_enabled) {
            throw new InvalidArgumentException("Mystery chests are disabled in this lobby.");
        }
        if ($chestReward->chooser_participant_id !== $chooser->id) {
            throw new InvalidArgumentException("You cannot open this chest.");
        }
        if ($chestReward->status !== ChestReward::STATUS_PENDING_CHOICE) {
            throw new InvalidArgumentException("This chest has already been opened.");
        }

        $card = $this->drawCard($chestType);
        $scaled = $this->scaleCard($card, (float) $lobby->chest_aggression_multiplier);

        $chestReward->chest_type = $chestType;
        $chestReward->card_key = $scaled["key"];
        $chestReward->card_mode = $scaled["mode"];

        if ($scaled["mode"] === "give_out") {
            $chestReward->pending_schluecke = $scaled["schluecke"];
            $chestReward->pending_shots = $scaled["shots"];
            $chestReward->status = ChestReward::STATUS_PENDING_DISTRIBUTION;
            $chestReward->save();

            LobbyUpdated::dispatch($lobby->fresh());

            return [
                "chest_reward_id" => $chestReward->id,
                "chest_type" => $chestType,
                "card_key" => $scaled["key"],
                "card_mode" => $scaled["mode"],
                "schluecke" => $scaled["schluecke"],
                "shots" => $scaled["shots"],
            ];
        }

        foreach ($this->buildAutoSplits($lobby, $chooser, $scaled) as $split) {
            DrinkDistribution::create([
                "lobby_id" => $lobby->id,
                "elimination_id" => $chestReward->elimination_id,
                "offender_rumbler_id" => $chestReward->offender_rumbler_id,
                "victim_rumbler_id" => $chestReward->victim_rumbler_id,
                "giver_participant_id" => $chooser->id,
                "receiver_participant_id" => $split["receiver_participant_id"],
                "schluecke" => $split["schluecke"],
                "shots" => $split["shots"],
                "kind" => DrinkDistribution::KIND_CHEST_REWARD,
            ]);
        }

        $chestReward->status = ChestReward::STATUS_RESOLVED;
        $chestReward->pending_schluecke = 0;
        $chestReward->pending_shots = 0;
        $chestReward->save();

        LobbyUpdated::dispatch($lobby->fresh());

        return [
            "chest_reward_id" => $chestReward->id,
            "chest_type" => $chestType,
            "card_key" => $scaled["key"],
            "card_mode" => $scaled["mode"],
            "schluecke" => $scaled["schluecke"],
            "shots" => $scaled["shots"],
        ];
    }

    private function drawCard(string $chestType): array
    {
        $cards = $this->cards()[$chestType] ?? null;
        if (!$cards) {
            throw new InvalidArgumentException("Unknown chest type.");
        }

        $roll = random_int(1, array_sum(array_column($cards, "weight")));
        $cursor = 0;
        foreach ($cards as $card) {
            $cursor += $card["weight"];
            if ($roll <= $cursor) {
                return $card;
            }
        }

        return $cards[array_key_last($cards)];
    }

    private function scaleCard(array $card, float $multiplier): array
    {
        $scaled = $card;
        $scaled["schluecke"] = $this->scaleAmount((int) ($card["schluecke"] ?? 0), $multiplier);
        $scaled["shots"] = $this->scaleAmount((int) ($card["shots"] ?? 0), $multiplier);
        return $scaled;
    }

    private function scaleAmount(int $amount, float $multiplier): int
    {
        if ($amount === 0) {
            return 0;
        }

        return max(1, (int) round($amount * $multiplier));
    }

    private function buildAutoSplits(Lobby $lobby, Participant $chooser, array $card): array
    {
        $participants = $lobby->participants()->orderBy("id")->get();
        $others = $participants->filter(fn(Participant $participant) => $participant->id !== $chooser->id)->values();

        return match ($card["effect"]) {
            "everyone" => $participants
                ->map(fn(Participant $participant) => $this->split($participant->id, $card))
                ->all(),
            "everyone_else" => $others
                ->map(fn(Participant $participant) => $this->split($participant->id, $card))
                ->all(),
            "chooser_only" => [$this->split($chooser->id, $card)],
            "chooser_and_random_other" => $this->chooserAndRandomOther($chooser, $others, $card),
            default => throw new InvalidArgumentException("Unknown chest effect."),
        };
    }

    private function chooserAndRandomOther(
        Participant $chooser,
        Collection $others,
        array $card
    ): array {
        if ($others->isEmpty()) {
            return [$this->split($chooser->id, $card)];
        }

        $other = $others->random();

        return [
            $this->split($chooser->id, $card),
            $this->split($other->id, $card),
        ];
    }

    private function split(int $receiverId, array $card): array
    {
        return [
            "receiver_participant_id" => $receiverId,
            "schluecke" => (int) ($card["schluecke"] ?? 0),
            "shots" => (int) ($card["shots"] ?? 0),
        ];
    }

    private function cards(): array
    {
        return [
            "safe" => [
                ["key" => "safe_give_sips", "mode" => "give_out", "weight" => 55, "schluecke" => 2, "shots" => 0],
                ["key" => "safe_give_shot", "mode" => "give_out", "weight" => 20, "schluecke" => 0, "shots" => 1],
                ["key" => "safe_everyone_else_sip", "mode" => "auto", "weight" => 15, "effect" => "everyone_else", "schluecke" => 1, "shots" => 0],
                ["key" => "safe_you_and_random_sip", "mode" => "auto", "weight" => 10, "effect" => "chooser_and_random_other", "schluecke" => 1, "shots" => 0],
            ],
            "group" => [
                ["key" => "group_everyone_sip", "mode" => "auto", "weight" => 45, "effect" => "everyone", "schluecke" => 1, "shots" => 0],
                ["key" => "group_give_sips", "mode" => "give_out", "weight" => 30, "schluecke" => 4, "shots" => 0],
                ["key" => "group_everyone_else_sip", "mode" => "auto", "weight" => 15, "effect" => "everyone_else", "schluecke" => 1, "shots" => 0],
                ["key" => "group_give_shots", "mode" => "give_out", "weight" => 10, "schluecke" => 0, "shots" => 2],
            ],
            "chaos" => [
                ["key" => "chaos_give_sips", "mode" => "give_out", "weight" => 30, "schluecke" => 6, "shots" => 0],
                ["key" => "chaos_give_shots", "mode" => "give_out", "weight" => 20, "schluecke" => 0, "shots" => 3],
                ["key" => "chaos_everyone_sip", "mode" => "auto", "weight" => 25, "effect" => "everyone", "schluecke" => 1, "shots" => 0],
                ["key" => "chaos_everyone_else_shot", "mode" => "auto", "weight" => 10, "effect" => "everyone_else", "schluecke" => 0, "shots" => 1],
                ["key" => "chaos_you_drink_shots", "mode" => "auto", "weight" => 15, "effect" => "chooser_only", "schluecke" => 0, "shots" => 2],
            ],
        ];
    }
}

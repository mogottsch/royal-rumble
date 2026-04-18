<?php

namespace App\Services;

use App\Events\LobbyUpdated;
use App\Models\ChestReward;
use App\Models\Chug;
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
        string $chestType,
        ?array $preResolvedCard = null
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

        $scaled = $preResolvedCard ?? $this->resolveCard($lobby, $chestType, null);

        $chestReward->chest_type = $chestType;
        $chestReward->card_key = $scaled["key"];
        $chestReward->card_mode = $scaled["mode"];

        if ($scaled["mode"] === "give_out") {
            $chestReward->pending_schluecke = $scaled["schluecke"];
            $chestReward->pending_shots = $scaled["shots"];
            $chestReward->minimum_self_schluecke = (int) ($scaled["minimum_self_schluecke"] ?? 0);
            $chestReward->minimum_self_shots = (int) ($scaled["minimum_self_shots"] ?? 0);
            $chestReward->status = ChestReward::STATUS_REVEALED_DISTRIBUTION;
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

        if ($scaled["mode"] === "target_pick") {
            $chestReward->pending_schluecke = 0;
            $chestReward->pending_shots = 0;
            $chestReward->minimum_self_schluecke = 0;
            $chestReward->minimum_self_shots = 0;
            $chestReward->target_participant_id = null;
            $chestReward->result_participant_id = null;
            $chestReward->status = ChestReward::STATUS_REVEALED_TARGET_PICK;
            $chestReward->save();

            LobbyUpdated::dispatch($lobby->fresh());

            return [
                "chest_reward_id" => $chestReward->id,
                "chest_type" => $chestType,
                "card_key" => $scaled["key"],
                "card_mode" => $scaled["mode"],
                "schluecke" => 0,
                "shots" => 0,
            ];
        }

        $this->applyAutoEffect($lobby, $chestReward, $chooser, $scaled);

        $chestReward->status = ChestReward::STATUS_REVEALED_AUTO;
        $chestReward->pending_schluecke = $scaled["schluecke"];
        $chestReward->pending_shots = $scaled["shots"];
        $chestReward->minimum_self_schluecke = 0;
        $chestReward->minimum_self_shots = 0;
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

    public function createAdminReward(
        Lobby $lobby,
        Participant $chooser,
        string $chestType,
        string $cardKey
    ): array {
        $scaled = $this->resolveCard($lobby, $chestType, $cardKey);
        $elimination = new Elimination();
        $elimination->save();

        $chestReward = ChestReward::create([
            "lobby_id" => $lobby->id,
            "elimination_id" => $elimination->id,
            "offender_rumbler_id" => null,
            "victim_rumbler_id" => null,
            "chooser_participant_id" => $chooser->id,
            "status" => ChestReward::STATUS_PENDING_CHOICE,
        ]);

        return $this->resolve($lobby, $chestReward, $chooser, $chestType, $scaled);
    }

    public function acknowledge(
        Lobby $lobby,
        ChestReward $chestReward,
        Participant $chooser
    ): array {
        if ($chestReward->chooser_participant_id !== $chooser->id) {
            throw new InvalidArgumentException("You cannot acknowledge this chest.");
        }

        if ($chestReward->status === ChestReward::STATUS_REVEALED_DISTRIBUTION) {
            $chestReward->status = ChestReward::STATUS_PENDING_DISTRIBUTION;
            $chestReward->save();

            LobbyUpdated::dispatch($lobby->fresh());

            return ["next_status" => ChestReward::STATUS_PENDING_DISTRIBUTION];
        }

        if ($chestReward->status === ChestReward::STATUS_REVEALED_TARGET_PICK) {
            $chestReward->status = ChestReward::STATUS_PENDING_TARGET_PICK;
            $chestReward->save();

            LobbyUpdated::dispatch($lobby->fresh());

            return ["next_status" => ChestReward::STATUS_PENDING_TARGET_PICK];
        }

        if ($chestReward->status === ChestReward::STATUS_REVEALED_AUTO) {
            $chestReward->status = ChestReward::STATUS_RESOLVED;
            $chestReward->save();

            LobbyUpdated::dispatch($lobby->fresh());

            return ["next_status" => ChestReward::STATUS_RESOLVED];
        }

        throw new InvalidArgumentException("This chest cannot be acknowledged right now.");
    }

    public function resolveTargetPick(
        Lobby $lobby,
        ChestReward $chestReward,
        Participant $chooser,
        Participant $target
    ): array {
        if ($chestReward->chooser_participant_id !== $chooser->id) {
            throw new InvalidArgumentException("You cannot resolve this chest.");
        }
        if ($target->lobby_id !== $lobby->id) {
            throw new InvalidArgumentException("Target participant not found in lobby.");
        }
        if ($chestReward->status !== ChestReward::STATUS_PENDING_TARGET_PICK) {
            throw new InvalidArgumentException("This chest is not waiting for a target.");
        }
        if ($chestReward->card_key !== "chaos_russian_roulette") {
            throw new InvalidArgumentException("This chest does not support target picking.");
        }

        $loser = random_int(0, 1) === 0 ? $chooser : $target;

        Chug::create([
            "lobby_id" => $lobby->id,
            "participant_id" => $loser->id,
            "elimination_id" => $chestReward->elimination_id,
        ]);

        $chestReward->target_participant_id = $target->id;
        $chestReward->result_participant_id = $loser->id;
        $chestReward->status = ChestReward::STATUS_RESOLVED;
        $chestReward->save();

        LobbyUpdated::dispatch($lobby->fresh());

        return [
            "target_participant_id" => $target->id,
            "result_participant_id" => $loser->id,
        ];
    }

    private function resolveCard(Lobby $lobby, string $chestType, ?string $cardKey): array
    {
        $card = $cardKey === null
            ? $this->drawCard($chestType)
            : $this->findCard($chestType, $cardKey);

        return $this->scaleCard($card, (float) $lobby->chest_aggression_multiplier);
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

    private function findCard(string $chestType, string $cardKey): array
    {
        $cards = $this->cards()[$chestType] ?? null;
        if (!$cards) {
            throw new InvalidArgumentException("Unknown chest type.");
        }

        foreach ($cards as $card) {
            if (($card["key"] ?? null) === $cardKey) {
                return $card;
            }
        }

        throw new InvalidArgumentException("Unknown card key.");
    }

    private function scaleCard(array $card, float $multiplier): array
    {
        $scaled = $card;
        $scaled["schluecke"] = $this->scaleAmount((int) ($card["schluecke"] ?? 0), $multiplier);
        $scaled["shots"] = $this->scaleAmount((int) ($card["shots"] ?? 0), $multiplier);
        $scaled["self_schluecke"] = $this->scaleAmount((int) ($card["self_schluecke"] ?? 0), $multiplier);
        $scaled["self_shots"] = $this->scaleAmount((int) ($card["self_shots"] ?? 0), $multiplier);
        $scaled["minimum_self_schluecke"] = $this->scaleAmount((int) ($card["minimum_self_schluecke"] ?? 0), $multiplier);
        $scaled["minimum_self_shots"] = $this->scaleAmount((int) ($card["minimum_self_shots"] ?? 0), $multiplier);
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
        $activeRumblerIds = $lobby->rumblers()
            ->with("victimEliminations")
            ->get()
            ->reject(fn(Rumbler $rumbler) => $rumbler->isEliminated())
            ->pluck("id")
            ->all();
        $others = $participants->filter(fn(Participant $participant) => $participant->id !== $chooser->id)->values();

        return match ($card["effect"]) {
            "everyone" => $participants
                ->map(fn(Participant $participant) => $this->split($participant->id, $card))
                ->all(),
            "everyone_else" => $others
                ->map(fn(Participant $participant) => $this->split($participant->id, $card))
                ->all(),
            "participants_without_active_wrestler" => $participants
                ->filter(function (Participant $participant) use ($activeRumblerIds) {
                    return !in_array($participant->rumbler_id, $activeRumblerIds, true);
                })
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

    private function applyAutoEffect(
        Lobby $lobby,
        ChestReward $chestReward,
        Participant $chooser,
        array $card
    ): void {
        if (($card["effect"] ?? null) === "random_other_chugs") {
            $target = $lobby->participants()
                ->where("id", "!=", $chooser->id)
                ->inRandomOrder()
                ->first();

            if (!$target) {
                $target = $chooser;
            }

            Chug::create([
                "lobby_id" => $lobby->id,
                "participant_id" => $target->id,
                "elimination_id" => $chestReward->elimination_id,
            ]);

            return;
        }

        if (($card["effect"] ?? null) === "everyone_chugs") {
            foreach ($lobby->participants()->get() as $participant) {
                Chug::create([
                    "lobby_id" => $lobby->id,
                    "participant_id" => $participant->id,
                    "elimination_id" => $chestReward->elimination_id,
                ]);
            }

            return;
        }

        if (($card["self_shots"] ?? 0) > 0 || ($card["self_schluecke"] ?? 0) > 0) {
            DrinkDistribution::create([
                "lobby_id" => $lobby->id,
                "elimination_id" => $chestReward->elimination_id,
                "offender_rumbler_id" => $chestReward->offender_rumbler_id,
                "victim_rumbler_id" => $chestReward->victim_rumbler_id,
                "giver_participant_id" => $chooser->id,
                "receiver_participant_id" => $chooser->id,
                "schluecke" => (int) ($card["self_schluecke"] ?? 0),
                "shots" => (int) ($card["self_shots"] ?? 0),
                "kind" => DrinkDistribution::KIND_CHEST_REWARD,
            ]);
        }

        foreach ($this->buildAutoSplits($lobby, $chooser, $card) as $split) {
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
    }

    private function cards(): array
    {
        return [
            "safe" => [
                ["key" => "safe_give_sips", "mode" => "give_out", "weight" => 40, "schluecke" => 3, "shots" => 0],
                ["key" => "safe_give_shot", "mode" => "give_out", "weight" => 20, "schluecke" => 0, "shots" => 1],
                ["key" => "safe_you_and_random_sip", "mode" => "auto", "weight" => 20, "effect" => "chooser_and_random_other", "schluecke" => 2, "shots" => 0],
                ["key" => "safe_house_edge", "mode" => "give_out", "weight" => 20, "schluecke" => 4, "shots" => 0, "minimum_self_schluecke" => 1],
            ],
            "group" => [
                ["key" => "group_everyone_sip", "mode" => "auto", "weight" => 35, "effect" => "everyone", "schluecke" => 2, "shots" => 0],
                ["key" => "group_everyone_else_sip", "mode" => "auto", "weight" => 25, "effect" => "everyone_else", "schluecke" => 2, "shots" => 0],
                ["key" => "group_cheap_seats", "mode" => "auto", "weight" => 25, "effect" => "participants_without_active_wrestler", "schluecke" => 2, "shots" => 0],
                ["key" => "group_main_event", "mode" => "auto", "weight" => 15, "effect" => "everyone", "schluecke" => 0, "shots" => 1],
            ],
            "chaos" => [
                ["key" => "chaos_give_sips", "mode" => "give_out", "weight" => 23, "schluecke" => 8, "shots" => 0],
                ["key" => "chaos_give_shots", "mode" => "give_out", "weight" => 20, "schluecke" => 0, "shots" => 3],
                ["key" => "chaos_everyone_sip", "mode" => "auto", "weight" => 13, "effect" => "everyone", "schluecke" => 2, "shots" => 0],
                ["key" => "chaos_everyone_else_shot", "mode" => "auto", "weight" => 10, "effect" => "everyone_else", "schluecke" => 0, "shots" => 1],
                ["key" => "chaos_you_drink_shots", "mode" => "auto", "weight" => 10, "effect" => "chooser_only", "schluecke" => 0, "shots" => 2],
                ["key" => "chaos_blackout_tax", "mode" => "auto", "weight" => 9, "effect" => "everyone_else", "schluecke" => 1, "shots" => 0, "self_shots" => 1],
                ["key" => "chaos_skull_crusher", "mode" => "auto", "weight" => 7, "effect" => "random_other_chugs", "schluecke" => 0, "shots" => 0],
                ["key" => "chaos_last_call", "mode" => "auto", "weight" => 3, "effect" => "everyone_chugs", "schluecke" => 0, "shots" => 0],
                ["key" => "chaos_russian_roulette", "mode" => "target_pick", "weight" => 5, "schluecke" => 0, "shots" => 0],
            ],
        ];
    }
}

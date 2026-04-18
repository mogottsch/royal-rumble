import { Box, Chip, Stack, Typography } from "@mui/material";
import { getCardDescription, getCardTitle } from "../chest_cards";
import { Action, ChestReward, Chug, DrinkDistribution, Lobby } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

type HistoryItem =
  | { group: "rumble"; createdAt: string; id: string; action: Action }
  | { group: "drink"; createdAt: string; id: string; distributions: DrinkDistribution[] }
  | { group: "drink"; createdAt: string; id: string; chug: Chug };

export function History({ lobby }: { lobby: Lobby | undefined }) {
  return <HistoryContent lobby={lobby} compact={false} />;
}

export function HistoryContent({
  lobby,
  compact,
  showTitle = !compact,
}: {
  lobby: Lobby | undefined;
  compact: boolean;
  showTitle?: boolean;
}) {
  const { t } = useI18n();
  if (!lobby) return null;

  const items = buildHistoryItems(lobby);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 2,
        p: compact ? 0.75 : 2,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {showTitle && (
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {t("history.title")}
        </Typography>
      )}

      <Stack spacing={compact ? 0.6 : 1}>
        {items.length === 0 && <Typography sx={{ opacity: 0.6 }}>{t("history.none")}</Typography>}
        {items.map((item, index) => (
          <HistoryRow key={item.id} index={items.length - index} item={item} lobby={lobby} compact={compact} />
        ))}
      </Stack>
    </Box>
  );
}

function HistoryRow({
  index,
  item,
  lobby,
  compact,
}: {
  index: number;
  item: HistoryItem;
  lobby: Lobby;
  compact: boolean;
}) {
  const { t } = useI18n();
  const rumble = item.group === "rumble";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: compact ? "22px auto 1fr" : "28px auto 1fr",
        gap: compact ? 0.6 : 1,
        alignItems: "start",
        borderRadius: 1.5,
        px: compact ? 0.65 : 1,
        py: compact ? 0.5 : 0.75,
        background: rumble ? "rgba(211,47,47,0.12)" : "rgba(25,118,210,0.12)",
        border: rumble
          ? "1px solid rgba(211,47,47,0.28)"
          : "1px solid rgba(25,118,210,0.28)",
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.5, pt: 0.1, fontSize: compact ? "0.6rem" : undefined }}>
        {index}.
      </Typography>
      <Chip
        label={rumble ? t("history.rumble") : t("history.drink")}
        size="small"
        sx={{
          height: compact ? 18 : 20,
          backgroundColor: rumble ? "#d32f2f" : "#1976d2",
          color: "white",
          fontWeight: 700,
          mt: 0.1,
          '& .MuiChip-label': {
            px: compact ? 0.45 : undefined,
            fontSize: compact ? "0.6rem" : undefined,
          },
        }}
      />
      <Typography variant="body2" sx={{ fontSize: compact ? "0.75rem" : undefined, lineHeight: compact ? 1.3 : undefined }}>
        <HistoryDisplay item={item} lobby={lobby} />
      </Typography>
    </Box>
  );
}

function buildHistoryItems(lobby: Lobby): HistoryItem[] {
  const actions: HistoryItem[] = lobby.actions
    .filter((action) => !!action.created_at)
    .map((action) => ({
      group: "rumble",
      createdAt: action.created_at as string,
      id: `action-${action.id}`,
      action,
    }));

  const distributions = buildGroupedDistributions(lobby.drink_distributions);

  const chugs: HistoryItem[] = lobby.chugs
    .filter((chug) => !!chug.created_at)
    .map((chug) => ({
      group: "drink",
      createdAt: chug.created_at as string,
      id: `chug-${chug.id}`,
      chug,
    }));

  return [...actions, ...distributions, ...chugs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function buildGroupedDistributions(distributions: DrinkDistribution[]): HistoryItem[] {
  const groups = new Map<string, DrinkDistribution[]>();

  for (const distribution of distributions) {
    if (!distribution.created_at) continue;

    const rounded = distribution.created_at.slice(0, 19);
    const key =
      distribution.kind === "chest_reward"
        ? [
            distribution.kind,
            distribution.giver_participant_id,
            distribution.elimination_id,
            distribution.offender_rumbler_id,
            distribution.victim_rumbler_id,
            rounded,
          ].join(":")
        : distribution.kind === "elimination_reward"
          ? `${distribution.kind}:${distribution.giver_participant_id}:${rounded}`
          : `${distribution.kind}:${distribution.receiver_participant_id}:${rounded}`;

    const existing = groups.get(key) ?? [];
    existing.push(distribution);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([key, group]) => ({
    group: "drink",
    createdAt: group[0].created_at as string,
    id: `distribution-${key}`,
    distributions: group.sort((a, b) => a.id - b.id),
  }));
}

function HistoryDisplay({ item, lobby }: { item: HistoryItem; lobby: Lobby }) {
  if ("action" in item) {
    return <ActionDisplay action={item.action} />;
  }
  if ("distributions" in item) {
    return <DistributionGroupDisplay distributions={item.distributions} lobby={lobby} />;
  }
  return <ChugDisplay chug={item.chug} />;
}

function ActionDisplay({ action }: { action: Action }) {
  switch (action.type) {
    case "entrance":
      return <Entrance action={action} />;
    case "elimination":
      return <Elimination action={action} />;
  }
}

function Entrance({ action }: { action: Action }) {
  const { t } = useI18n();
  const wrestler = action.rumbler?.wrestler;
  if (!wrestler) return null;
  return <>{t("history.entered", { name: wrestler.name })}</>;
}

function Elimination({ action }: { action: Action }) {
  const { t } = useI18n();
  const elimination = action.elimination;
  if (!elimination) return null;

  const offenders = elimination.rumbler_offenders.map(
    (rumbler) => rumbler.wrestler.name,
  );
  const victims = elimination.rumbler_victims.map(
    (rumbler) => rumbler.wrestler.name,
  );

  return <>{t("history.eliminated", {
    offenders: joinButLast(offenders, ", ", t("history.and")),
    victims: joinButLast(victims, ", ", t("history.and")),
  })}</>;
}

function DistributionGroupDisplay({
  distributions,
  lobby,
}: {
  distributions: DrinkDistribution[];
  lobby: Lobby;
}) {
  const { t } = useI18n();
  const first = distributions[0];

  if (first.kind === "npc_elimination_penalty") {
    return <NpcDistributionGroupDisplay distributions={distributions} />;
  }

  const giver = first.giver?.name ?? first.giver_participant_id ?? "NPC";
  const totals = summarizePerReceiver(distributions);
  const eliminations = summarizeEliminations(distributions);
  const chestRewards = summarizeChestRewards(distributions, lobby);

  if (first.kind === "chest_reward") {
    const primaryReward = chestRewards[0];
    const triggerText =
      eliminations.length > 0 ? joinButLast(eliminations, ", ", t("history.and")) : "";

    return (
      <Stack spacing={0.4}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {t("history.chestReward", {
            giver: String(giver),
            chest: primaryReward?.chest ?? t("history.drink"),
            card: primaryReward?.cardTitle ?? "",
            totals: joinButLast(totals, ", ", t("history.and")),
          })}
        </Typography>
        {(primaryReward || triggerText) && (
          <Typography variant="caption" sx={{ opacity: 0.7, display: "block", lineHeight: 1.4 }}>
            {primaryReward && (
              <>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {primaryReward.chest}
                </Box>
                {" | "}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {primaryReward.cardTitle}
                </Box>
                {`: ${primaryReward.cardDescription}`}
              </>
            )}
            {primaryReward && triggerText ? "  •  " : ""}
            {triggerText && `${t("history.trigger")}: ${triggerText}`}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <>
      {t("history.handedOut", {
        giver: String(giver),
        totals: joinButLast(totals, ", ", t("history.and")),
        eliminations:
          eliminations.length > 0
            ? joinButLast(eliminations, ", ", t("history.and"))
            : "",
      })}
    </>
  );
}

function NpcDistributionGroupDisplay({ distributions }: { distributions: DrinkDistribution[] }) {
  const { t } = useI18n();
  const totals = summarizePerReceiver(distributions);
  return <>{t("history.npcPenalty", { totals: joinButLast(totals, ", ", t("history.and")) })}</>;
}

function summarizePerReceiver(distributions: DrinkDistribution[]): string[] {
  const { t } = useI18n();
  const perReceiver = new Map<string, { sips: number; shots: number }>();

  for (const distribution of distributions) {
    const receiver = String(
      distribution.receiver?.name ?? distribution.receiver_participant_id,
    );
    const current = perReceiver.get(receiver) ?? { sips: 0, shots: 0 };
    current.sips += distribution.schluecke;
    current.shots += distribution.shots;
    perReceiver.set(receiver, current);
  }

  return Array.from(perReceiver.entries()).map(([receiver, total]) => {
    const parts: string[] = [];
    if (total.sips > 0) parts.push(t("history.sips", { count: total.sips }));
    if (total.shots > 0) parts.push(t("history.shots", { count: total.shots }));
    return `${receiver} ${parts.join(t("history.and"))}`;
  });
}

function summarizeEliminations(distributions: DrinkDistribution[]): string[] {
  const { t } = useI18n();
  const summaries = new Map<string, string>();

  for (const distribution of distributions) {
    const offender = distribution.offender_rumbler?.wrestler.name;
    const victim = distribution.victim_rumbler?.wrestler.name;
    if (!offender || !victim) continue;
    const key = `${offender}->${victim}`;
    summaries.set(key, t("history.eliminating", { offender, victim }));
  }

  return Array.from(summaries.values());
}

function summarizeChestRewards(distributions: DrinkDistribution[], lobby: Lobby) {
  const { t } = useI18n();
  const rewards = new Map<
    string,
      {
        key: string;
        chest: string;
        cardTitle: string;
        cardDescription: string;
        elimination: string;
      }
  >();

  for (const distribution of distributions) {
    if (distribution.kind !== "chest_reward") {
      continue;
    }

    const reward = findMatchingChestReward(distribution, lobby.chest_rewards);
    if (!reward?.chest_type || !reward.card_key) {
      continue;
    }

    const offender = distribution.offender_rumbler?.wrestler.name;
    const victim = distribution.victim_rumbler?.wrestler.name;

    const key = [
      reward.id,
      distribution.elimination_id,
      distribution.offender_rumbler_id,
      distribution.victim_rumbler_id,
    ].join(":");

    rewards.set(key, {
      key,
      chest: t(`distribute.chest.${reward.chest_type}`),
      cardTitle: getCardTitle(t, reward.card_key),
      cardDescription: getCardDescription(t, {
        ...reward,
        affectedParticipantNames: (reward.affected_participant_ids ?? [])
          .map((participantId) => lobby.participants.find((participant) => participant.id === participantId)?.name)
          .filter((name): name is string => Boolean(name)),
      }),
      elimination:
        offender && victim
          ? t("history.eliminating", { offender, victim })
          : t("history.adminTrigger"),
    });
  }

  return Array.from(rewards.values());
}

function findMatchingChestReward(
  distribution: DrinkDistribution,
  chestRewards: ChestReward[],
): ChestReward | null {
  return (
    chestRewards.find(
      (reward) =>
        reward.elimination_id === distribution.elimination_id &&
        reward.offender_rumbler_id === distribution.offender_rumbler_id &&
        reward.victim_rumbler_id === distribution.victim_rumbler_id &&
        reward.chooser_participant_id === distribution.giver_participant_id,
    ) ?? null
  );
}

function ChugDisplay({ chug }: { chug: Chug }) {
  const { t } = useI18n();
  const participant = chug.participant?.name ?? chug.participant_id;
  return <>{t("history.chugged", { participant: String(participant) })}</>;
}

function joinButLast(array: string[], separator: string, lastSeparator: string) {
  if (array.length === 0) return "";
  if (array.length === 1) return array[0];
  const copy = [...array];
  const last = copy.pop();
  return copy.join(separator) + lastSeparator + last;
}

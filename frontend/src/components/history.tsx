import { Box, Chip, Stack, Typography } from "@mui/material";
import { Action, Chug, DrinkDistribution, Lobby } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

type HistoryItem =
  | { group: "rumble"; createdAt: string; id: string; action: Action }
  | { group: "drink"; createdAt: string; id: string; distributions: DrinkDistribution[] }
  | { group: "drink"; createdAt: string; id: string; chug: Chug };

export function History({ lobby }: { lobby: Lobby | undefined }) {
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
        p: 2,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        {t("history.title")}
      </Typography>

      <Stack spacing={1}>
        {items.length === 0 && <Typography sx={{ opacity: 0.6 }}>{t("history.none")}</Typography>}
        {items.map((item, index) => (
          <HistoryRow key={item.id} index={items.length - index} item={item} />
        ))}
      </Stack>
    </Box>
  );
}

function HistoryRow({ index, item }: { index: number; item: HistoryItem }) {
  const { t } = useI18n();
  const rumble = item.group === "rumble";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "28px auto 1fr",
        gap: 1,
        alignItems: "start",
        borderRadius: 1.5,
        px: 1,
        py: 0.75,
        background: rumble ? "rgba(211,47,47,0.12)" : "rgba(25,118,210,0.12)",
        border: rumble
          ? "1px solid rgba(211,47,47,0.28)"
          : "1px solid rgba(25,118,210,0.28)",
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.5, pt: 0.2 }}>
        {index}.
      </Typography>
      <Chip
        label={rumble ? t("history.rumble") : t("history.drink")}
        size="small"
        sx={{
          height: 20,
          backgroundColor: rumble ? "#d32f2f" : "#1976d2",
          color: "white",
          fontWeight: 700,
          mt: 0.15,
        }}
      />
      <Typography variant="body2">
        <HistoryDisplay item={item} />
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
      distribution.kind === "elimination_reward" || distribution.kind === "chest_reward"
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

function HistoryDisplay({ item }: { item: HistoryItem }) {
  if ("action" in item) {
    return <ActionDisplay action={item.action} />;
  }
  if ("distributions" in item) {
    return <DistributionGroupDisplay distributions={item.distributions} />;
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

function DistributionGroupDisplay({ distributions }: { distributions: DrinkDistribution[] }) {
  const { t } = useI18n();
  const first = distributions[0];

  if (first.kind === "npc_elimination_penalty") {
    return <NpcDistributionGroupDisplay distributions={distributions} />;
  }

  const giver = first.giver?.name ?? first.giver_participant_id ?? "NPC";
  const totals = summarizePerReceiver(distributions);
  const eliminations = summarizeEliminations(distributions);

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

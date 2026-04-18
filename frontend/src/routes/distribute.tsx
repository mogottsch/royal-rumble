import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchApi, participantIdHeaders } from "../api/fetcher";
import {
  getPendingChestChoices,
  getPendingDrinkPools,
  getRevealedChestRewards,
  PendingChestChoice,
  PendingDrinkPool,
} from "../drink_pools";
import { useLobbyContext } from "../contexts/lobby_context";
import { useNotificationContext } from "../contexts/notification_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import { Lobby, Participant } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

type Allocation = Record<number, { schluecke: number; shots: number }>;

type RevealedChestResult = {
  chest_reward_id: number;
  chest_type: "safe" | "group" | "chaos";
  card_key: string;
  card_mode: "auto" | "give_out" | "target_pick";
  schluecke: number;
  shots: number;
  offenderName: string;
  victimName: string;
  chooserParticipantId?: number;
  adminMode?: boolean;
};

export function Distribute() {
  const { lobby, lobbyQuery } = useLobbyContext();
  const { claimedParticipantId } = useParticipantClaim();
  const { eliminationId } = useParams<{ eliminationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [didRefetch, setDidRefetch] = useState(false);
  const parsedEliminationId = eliminationId ? parseInt(eliminationId) : undefined;
  const adminChestRewardId = searchParams.get("adminChestRewardId");
  const adminParticipantId = searchParams.get("adminParticipantId");
  const chestChoices =
    lobby && claimedParticipantId !== null
      ? getPendingChestChoices(lobby, claimedParticipantId)
      : [];
  const revealedChestRewards =
    lobby && claimedParticipantId !== null
      ? getRevealedChestRewards(lobby, claimedParticipantId)
      : [];
  const pools =
    lobby && claimedParticipantId !== null
      ? getPendingDrinkPools(lobby, claimedParticipantId, parsedEliminationId)
      : [];
  const revealedChestResult = revealedChestRewards[0]
    ? {
        chest_reward_id: revealedChestRewards[0].chestRewardId,
        chest_type: revealedChestRewards[0].chestType,
        card_key: revealedChestRewards[0].cardKey,
        card_mode: revealedChestRewards[0].cardMode,
        schluecke: revealedChestRewards[0].schluecke,
        shots: revealedChestRewards[0].shots,
        offenderName:
          revealedChestRewards[0].offender?.wrestler.name ?? t("distribute.adminTriggerOffender"),
        victimName:
          revealedChestRewards[0].victim?.wrestler.name ?? t("distribute.adminTriggerVictim"),
      }
    : null;
  const adminRevealedChestResult =
    lobby && adminChestRewardId && adminParticipantId
      ? buildAdminRevealResult(lobby, Number(adminChestRewardId), Number(adminParticipantId))
      : null;
  const hasChestChoices = chestChoices.length > 0;
  const hasPools = pools.length > 0;

  useEffect(() => {
    if (
      !lobby ||
      claimedParticipantId === null ||
      hasChestChoices ||
      hasPools ||
      didRefetch ||
      !lobbyQuery
    ) {
      return;
    }
    setDidRefetch(true);
    lobbyQuery.refetch();
  }, [claimedParticipantId, didRefetch, hasChestChoices, hasPools, lobby, lobbyQuery]);

  if (!lobby || claimedParticipantId === null) return null;

  if (adminRevealedChestResult) {
    return (
      <ChestRevealScreen
        result={adminRevealedChestResult}
        onContinue={async () => {
          await acknowledgeChestReveal(
            lobby.code,
            adminRevealedChestResult.chest_reward_id,
            Number(adminParticipantId),
          );
          await lobbyQuery?.refetch();
          if (adminRevealedChestResult.card_mode === "target_pick") {
            navigate(
              `/lobbies/${lobby.code}/distribute?adminTargetChestRewardId=${adminChestRewardId}&adminParticipantId=${adminParticipantId}`,
            );
            return;
          }
          if (adminRevealedChestResult.card_mode === "give_out") {
            navigate(
              `/lobbies/${lobby.code}/distribute?adminDistributionParticipantId=${adminParticipantId}`,
            );
            return;
          }
          navigate(`/lobbies/${lobby.code}/view-game`);
        }}
      />
    );
  }

  if (revealedChestResult) {
    return (
      <ChestRevealScreen
        result={revealedChestResult}
        onContinue={async () => {
          await acknowledgeChestReveal(
            lobby.code,
            revealedChestResult.chest_reward_id,
            claimedParticipantId,
          );
          await lobbyQuery?.refetch();
          if (revealedChestResult.card_mode === "target_pick") {
            return;
          }
          if (revealedChestResult.card_mode === "give_out") {
            return;
          }
          navigate(`/lobbies/${lobby.code}/view-game`);
        }}
      />
    );
  }

  if (hasChestChoices) {
    return (
      <ChestChoiceForm
        choice={chestChoices[0]}
        chooserId={claimedParticipantId}
        lobbyCode={lobby.code}
        onResolved={async () => {
          await lobbyQuery?.refetch();
        }}
      />
    );
  }

  const effectiveParticipantId =
    adminParticipantId === null ? claimedParticipantId : Number(adminParticipantId);
  const adminTargetChestRewardId = searchParams.get("adminTargetChestRewardId");
  const targetPickRewardId = adminTargetChestRewardId ?? null;
  const targetPickReward = targetPickRewardId
    ? lobby.chest_rewards.find((reward) => reward.id === Number(targetPickRewardId))
      : lobby.chest_rewards.find(
        (reward) =>
          reward.chooser_participant_id === claimedParticipantId &&
          reward.status === "pending_target_pick",
      );

  if (targetPickReward) {
    return (
      <TargetPickScreen
        lobby={lobby}
        chestRewardId={targetPickReward.id}
        chooserParticipantId={targetPickReward.chooser_participant_id}
        viewerParticipantId={claimedParticipantId}
        onResolved={async () => {
          await lobbyQuery?.refetch();
          navigate(`/lobbies/${lobby.code}/view-game`);
        }}
      />
    );
  }

  const effectivePools =
    lobby && effectiveParticipantId !== null
      ? getPendingDrinkPools(lobby, effectiveParticipantId, parsedEliminationId)
      : pools;
  const constrainedPool = effectivePools.find(
    (pool) => (pool.minimumSelfSchluecke ?? 0) > 0 || (pool.minimumSelfShots ?? 0) > 0,
  );

  if (effectivePools.length === 0) {
    if (lobbyQuery?.isFetching) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography>{t("distribute.loading")}</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <Typography>{t("distribute.none")}</Typography>
        <Button onClick={() => navigate(`/lobbies/${lobby.code}/view-game`)}>
          {t("common.back")}
        </Button>
      </Box>
    );
  }

  if (constrainedPool) {
    return (
      <AggregateForm
        lobby={lobby}
        pools={[constrainedPool]}
        giverId={effectiveParticipantId}
        viewerId={claimedParticipantId}
        onFinish={async () => {
          await lobbyQuery?.refetch();
          navigate(`/lobbies/${lobby.code}/distribute${window.location.search}`);
        }}
      />
    );
  }

  return (
    <AggregateForm
      lobby={lobby}
      pools={effectivePools}
      giverId={effectiveParticipantId}
      viewerId={claimedParticipantId}
      onFinish={() => navigate(`/lobbies/${lobby.code}/view-game`)}
    />
  );
}

function ChestChoiceForm({
  choice,
  chooserId,
  lobbyCode,
  onResolved,
}: {
  choice: PendingChestChoice;
  chooserId: number;
  lobbyCode: string;
  onResolved: () => Promise<void>;
}) {
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { notify } = useNotificationContext();
  const { t } = useI18n();

  const openChest = async (chestType: "safe" | "group" | "chaos") => {
    setKeyLoading("openChest", true);
    try {
      const result = await postChestRoll(lobbyCode, choice.chestRewardId, chestType, chooserId);
      await onResolved();
    } catch (error) {
      notify((error as Error).message, "error");
    } finally {
      setKeyLoading("openChest", false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 1 }}>
        {t("distribute.chestTitle", {
          offender: choice.offender?.wrestler.name ?? t("distribute.adminTriggerOffender"),
          victim: choice.victim?.wrestler.name ?? t("distribute.adminTriggerVictim"),
        })}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8, mb: 3 }}>
        {t("distribute.chooseChest")}
      </Typography>
      <Stack spacing={2}>
        <ChestTypeCard
          title={t("distribute.chestSafe")}
          body={t("distribute.chestSafeHint")}
          onClick={() => openChest("safe")}
        />
        <ChestTypeCard
          title={t("distribute.chestGroup")}
          body={t("distribute.chestGroupHint")}
          onClick={() => openChest("group")}
        />
        <ChestTypeCard
          title={t("distribute.chestChaos")}
          body={t("distribute.chestChaosHint")}
          onClick={() => openChest("chaos")}
        />
      </Stack>
    </Box>
  );
}

function ChestRevealScreen({
  result,
  onContinue,
}: {
  result: RevealedChestResult;
  onContinue: () => Promise<void>;
}) {
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { t } = useI18n();

  const handleContinue = async () => {
    setKeyLoading("continueChest", true);
    try {
      await onContinue();
    } finally {
      setKeyLoading("continueChest", false);
    }
  };

  return (
    <Box sx={{ p: 2, display: "grid", gap: 2 }}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("distribute.chestRevealTitle", {
          chest: t(`distribute.chest.${result.chest_type}`),
        })}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8 }}>
        {t("distribute.chestTitle", {
          offender: result.offenderName,
          victim: result.victimName,
        })}
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="overline" sx={{ opacity: 0.7 }}>
            {t(`distribute.chest.${result.chest_type}`)}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
            {getCardTitle(t, result.card_key)}
          </Typography>
          <Typography variant="body1">
            {getCardDescription(t, result.card_key, result.schluecke, result.shots)}
          </Typography>
        </CardContent>
      </Card>
      <Button variant="contained" size="large" onClick={handleContinue}>
        {result.card_mode === "target_pick"
          ? t("distribute.continueToTargetPick")
          : result.card_mode === "give_out"
          ? t("distribute.continueToDistribution")
          : t("distribute.continueToGame")}
      </Button>
    </Box>
  );
}

function TargetPickScreen({
  lobby,
  chestRewardId,
  chooserParticipantId,
  viewerParticipantId,
  onResolved,
}: {
  lobby: Lobby;
  chestRewardId: number;
  chooserParticipantId: number;
  viewerParticipantId: number;
  onResolved: () => Promise<void>;
}) {
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { notify } = useNotificationContext();
  const { t } = useI18n();

  const chooser = lobby.participants.find((participant) => participant.id === chooserParticipantId);
  const options = lobby.participants.filter((participant) => participant.id !== chooserParticipantId);

  const pickTarget = async (targetParticipantId: number) => {
    setKeyLoading("resolveRussianRoulette", true);
    try {
      const result = await postTargetResolution(
        lobby.code,
        chestRewardId,
        targetParticipantId,
        viewerParticipantId,
      );
      const loser = lobby.participants.find(
        (participant) => participant.id === result.result_participant_id,
      );
      notify(
        t("distribute.russianRouletteResult", {
          loser: loser?.name ?? t("distribute.adminTriggerVictim"),
        }),
        "success",
      );
      await onResolved();
    } catch (error) {
      notify((error as Error).message, "error");
    } finally {
      setKeyLoading("resolveRussianRoulette", false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 1 }}>
        {t("distribute.russianRouletteTitle")}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8, mb: 3 }}>
        {t("distribute.russianRouletteBody", {
          chooser: chooser?.name ?? t("distribute.adminTriggerOffender"),
        })}
      </Typography>
      <Stack spacing={2}>
        {options.map((participant) => (
          <Card key={participant.id} variant="outlined">
            <CardActionArea onClick={() => pickTarget(participant.id)}>
              <CardContent>
                <Typography variant="h6">{participant.name}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

function ChestTypeCard({
  title,
  body,
  onClick,
}: {
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <Card variant="outlined">
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {body}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function AggregateForm({
  lobby,
  pools,
  giverId,
  viewerId,
  onFinish,
}: {
  lobby: Lobby;
  pools: PendingDrinkPool[];
  giverId: number;
  viewerId: number;
  onFinish: () => void;
}) {
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { t } = useI18n();
  const [alloc, setAlloc] = useState<Allocation>(() =>
    Object.fromEntries(
      lobby.participants.map((p) => [p.id, { schluecke: 0, shots: 0 }]),
    ),
  );

  const totalSchluecke = pools.reduce((sum, pool) => sum + pool.schluecke, 0);
  const totalShots = pools.reduce((sum, pool) => sum + pool.shots, 0);
  const minimumSelfSchluecke = pools.reduce((sum, pool) => sum + (pool.minimumSelfSchluecke ?? 0), 0);
  const minimumSelfShots = pools.reduce((sum, pool) => sum + (pool.minimumSelfShots ?? 0), 0);
  const showSchluecke = totalSchluecke > 0;
  const showShots = totalShots > 0;
  const totalSummary = formatVisibleDrinkSummary(t, totalSchluecke, totalShots);
  const minimumSelfSummary = formatVisibleDrinkSummary(
    t,
    minimumSelfSchluecke,
    minimumSelfShots,
  );

  const sumSchluecke = useMemo(
    () => Object.values(alloc).reduce((s, a) => s + a.schluecke, 0),
    [alloc],
  );
  const sumShots = useMemo(
    () => Object.values(alloc).reduce((s, a) => s + a.shots, 0),
    [alloc],
  );

  const selfAllocation = alloc[giverId] ?? { schluecke: 0, shots: 0 };
  const meetsSelfMinimum =
    selfAllocation.schluecke >= minimumSelfSchluecke &&
    selfAllocation.shots >= minimumSelfShots;
  const canSubmit =
    sumSchluecke === totalSchluecke &&
    sumShots === totalShots &&
    meetsSelfMinimum;

  const bump = (
    participantId: number,
    key: "schluecke" | "shots",
    delta: number,
  ) => {
    setAlloc((prev) => {
      const current = prev[participantId];
      const next = Math.max(0, current[key] + delta);
      return { ...prev, [participantId]: { ...current, [key]: next } };
    });
  };

  const submit = async () => {
    const requests = buildDistributionRequests(pools, alloc);
    setKeyLoading("distribute", true);
    try {
      for (const request of requests) {
        await postDistribution(
          lobby.code,
          request,
          viewerId,
          t("distribute.failedPrefix"),
        );
      }
    } finally {
      setKeyLoading("distribute", false);
    }
    onFinish();
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("distribute.aggregateTitle")}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8, mb: 2 }}>
        {`${t("distribute.aggregateTotalLabel")}: ${totalSummary}`}
      </Typography>
      {(minimumSelfSchluecke > 0 || minimumSelfShots > 0) && (
        <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8, mb: 2 }}>
          {`${t("distribute.minimumSelfPrefix")} ${minimumSelfSummary}.`}
        </Typography>
      )}

      <Stack spacing={0.5} sx={{ mb: 2 }}>
        {pools.map((pool) => (
          <Typography
            key={`${pool.chestRewardId ?? 0}-${pool.eliminationId}-${pool.offender?.id ?? 0}-${pool.victim?.id ?? 0}`}
            variant="body2"
            sx={{ opacity: 0.8 }}
          >
            {t("distribute.aggregateElimination", {
              id: pool.eliminationId,
              offender: pool.offender?.wrestler.name ?? t("distribute.adminTriggerOffender"),
              victim: pool.victim?.wrestler.name ?? t("distribute.adminTriggerVictim"),
            })}
          </Typography>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        {lobby.participants.map((p) => (
          <ParticipantRow
            key={p.id}
            participant={p}
            schluecke={alloc[p.id].schluecke}
            shots={alloc[p.id].shots}
            showSchluecke={showSchluecke}
            showShots={showShots}
            canIncSchluecke={sumSchluecke < totalSchluecke}
            canIncShots={sumShots < totalShots}
            onBump={(key, delta) => bump(p.id, key, delta)}
          />
        ))}
      </Stack>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        {showSchluecke && (
          <Typography variant="body2">
            {t("distribute.sips", { current: sumSchluecke, total: totalSchluecke })}
          </Typography>
        )}
        {showShots && (
          <Typography variant="body2">
            {t("distribute.shots", { current: sumShots, total: totalShots })}
          </Typography>
        )}
      </Box>

      <Stack spacing={1} sx={{ mt: 3 }}>
        <Button variant="contained" size="large" disabled={!canSubmit} onClick={submit}>
          {t("common.confirm")}
        </Button>
        <Button size="small" onClick={onFinish}>
          {t("distribute.skip")}
        </Button>
      </Stack>
    </Box>
  );
}

function buildAdminRevealResult(
  lobby: Lobby,
  chestRewardId: number,
  participantId: number,
): RevealedChestResult | null {
  const reward = lobby.chest_rewards.find(
    (entry) =>
      entry.id === chestRewardId &&
      entry.chooser_participant_id === participantId &&
      (
        entry.status === "revealed_auto" ||
        entry.status === "revealed_distribution" ||
        entry.status === "revealed_target_pick"
      ) &&
      entry.chest_type &&
      entry.card_key &&
      entry.card_mode,
  );

  if (!reward) {
    return null;
  }
  if (!reward.chest_type || !reward.card_key || !reward.card_mode) {
    return null;
  }

  const chooser = lobby.participants.find((participant) => participant.id === participantId);

  return {
    chest_reward_id: reward.id,
    chest_type: reward.chest_type,
    card_key: reward.card_key,
    card_mode: reward.card_mode,
    schluecke: reward.pending_schluecke,
    shots: reward.pending_shots,
    offenderName: chooser?.name ?? "Admin",
    victimName: "debug trigger",
    chooserParticipantId: participantId,
    adminMode: true,
  };
}

function buildDistributionRequests(pools: PendingDrinkPool[], alloc: Allocation) {
  const remaining = Object.fromEntries(
    Object.entries(alloc).map(([participantId, value]) => [participantId, { ...value }]),
  ) as Allocation;

  return pools
    .map((pool) => {
      let remainingSchluecke = pool.schluecke;
      let remainingShots = pool.shots;
      const splits: {
        receiver_participant_id: number;
        schluecke: number;
        shots: number;
      }[] = [];

      for (const participantIdString of Object.keys(remaining)) {
        const participantId = parseInt(participantIdString);
        const entry = remaining[participantId];
        const schluecke = Math.min(entry.schluecke, remainingSchluecke);
        const shots = Math.min(entry.shots, remainingShots);

        if (schluecke > 0 || shots > 0) {
          splits.push({
            receiver_participant_id: participantId,
            schluecke,
            shots,
          });
        }

        entry.schluecke -= schluecke;
        entry.shots -= shots;
        remainingSchluecke -= schluecke;
        remainingShots -= shots;
      }

      return {
        chest_reward_id: pool.chestRewardId,
        elimination_id: pool.eliminationId,
        offender_rumbler_id: pool.offender?.id ?? 0,
        victim_rumbler_id: pool.victim?.id ?? 0,
        splits,
      };
    })
    .filter((request) => request.splits.length > 0);
}

function ParticipantRow({
  participant,
  schluecke,
  shots,
  showSchluecke,
  showShots,
  canIncSchluecke,
  canIncShots,
  onBump,
}: {
  participant: Participant;
  schluecke: number;
  shots: number;
  showSchluecke: boolean;
  showShots: boolean;
  canIncSchluecke: boolean;
  canIncShots: boolean;
  onBump: (key: "schluecke" | "shots", delta: number) => void;
}) {
  const { t } = useI18n();
  const showBothDrinkTypes = showSchluecke && showShots;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: showBothDrinkTypes ? "start" : "center",
        gap: { xs: 0.5, sm: 1 },
      }}
    >
      <Typography sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
        {participant.name}
      </Typography>
      <Stack
        direction={showBothDrinkTypes ? "column" : "row"}
        spacing={showBothDrinkTypes ? 0.2 : { xs: 0.5, sm: 2 }}
        sx={{
          alignItems: "flex-end",
          justifySelf: "end",
          maxWidth: "100%",
        }}
      >
        {showSchluecke && (
          <Stepper
            label={t("distribute.sipsShort")}
            ariaContext={`${participant.name} ${t("distribute.sipsShort")}`}
            value={schluecke}
            canInc={canIncSchluecke}
            onInc={() => onBump("schluecke", 1)}
            onDec={() => onBump("schluecke", -1)}
          />
        )}
        {showShots && (
          <Stepper
            label={t("distribute.shotsShort")}
            ariaContext={`${participant.name} ${t("distribute.shotsShort")}`}
            value={shots}
            canInc={canIncShots}
            onInc={() => onBump("shots", 1)}
            onDec={() => onBump("shots", -1)}
          />
        )}
      </Stack>
    </Box>
  );
}

function Stepper({
  label,
  ariaContext,
  value,
  canInc,
  onInc,
  onDec,
}: {
  label: string;
  ariaContext: string;
  value: number;
  canInc: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 0.25, sm: 0.5 },
        whiteSpace: "nowrap",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          opacity: 0.7,
          minWidth: { xs: 24, sm: 32 },
          fontSize: { xs: "0.65rem", sm: "0.75rem" },
        }}
      >
        {label}
      </Typography>
      <IconButton
        aria-label={`${ariaContext} minus`}
        size="small"
        onClick={onDec}
        disabled={value === 0}
        sx={{
          p: { xs: 0.25, sm: 0.5 },
        }}
      >
        <RemoveIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
      </IconButton>
      <Typography
        sx={{
          minWidth: { xs: 14, sm: 18 },
          textAlign: "center",
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        {value}
      </Typography>
      <IconButton
        aria-label={`${ariaContext} plus`}
        size="small"
        onClick={onInc}
        disabled={!canInc}
        sx={{
          p: { xs: 0.25, sm: 0.5 },
        }}
      >
        <AddIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
      </IconButton>
    </Box>
  );
}

function formatVisibleDrinkSummary(
  t: (key: string, params?: Record<string, string | number>) => string,
  sips: number,
  shots: number,
) {
  const parts: string[] = [];

  if (sips > 0) {
    parts.push(t("history.sips", { count: sips }));
  }
  if (shots > 0) {
    parts.push(t("history.shots", { count: shots }));
  }

  return parts.length > 0 ? parts.join(t("history.and")) : t("history.sips", { count: 0 });
}

function getCardText(
  t: (key: string, params?: Record<string, string | number>) => string,
  cardKey: string,
  sips: number,
  shots: number,
) {
  return getCardDescription(t, cardKey, sips, shots);
}

function getCardTitle(
  t: (key: string, params?: Record<string, string | number>) => string,
  cardKey: string,
) {
  return t(`distribute.cardTitle.${cardKey}`);
}

function getCardDescription(
  t: (key: string, params?: Record<string, string | number>) => string,
  cardKey: string,
  sips: number,
  shots: number,
) {
  return t(`distribute.cardDescription.${cardKey}`, { sips, shots });
}

async function postChestRoll(
  lobbyCode: string,
  chestRewardId: number,
  chestType: "safe" | "group" | "chaos",
  chooserId: number,
) {
  const response = await fetchApi(`/lobbies/${lobbyCode}/chest-rewards/${chestRewardId}/roll`, {
    method: "POST",
    body: JSON.stringify({ chest_type: chestType }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...participantIdHeaders(chooserId),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  const data = await response.json();
  return data.data as {
    chest_reward_id: number;
    chest_type: "safe" | "group" | "chaos";
    card_key: string;
    card_mode: "auto" | "give_out";
    schluecke: number;
    shots: number;
  };
}

async function acknowledgeChestReveal(
  lobbyCode: string,
  chestRewardId: number,
  chooserId: number,
) {
  const response = await fetchApi(
    `/lobbies/${lobbyCode}/chest-rewards/${chestRewardId}/acknowledge`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...participantIdHeaders(chooserId),
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
}

async function postTargetResolution(
  lobbyCode: string,
  chestRewardId: number,
  targetParticipantId: number,
  viewerParticipantId: number,
) {
  const response = await fetchApi(
    `/lobbies/${lobbyCode}/chest-rewards/${chestRewardId}/resolve-target`,
    {
      method: "POST",
      body: JSON.stringify({ target_participant_id: targetParticipantId }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...participantIdHeaders(viewerParticipantId),
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  const data = await response.json();
  return data.data as { target_participant_id: number; result_participant_id: number };
}

async function postDistribution(
  lobbyCode: string,
  body: {
    chest_reward_id?: number;
    elimination_id: number;
    offender_rumbler_id: number;
    victim_rumbler_id: number;
    splits: {
      receiver_participant_id: number;
      schluecke: number;
      shots: number;
    }[];
  },
  giverId: number,
  errorPrefix = "Distribution failed",
) {
  const response = await fetchApi(`/lobbies/${lobbyCode}/distributions`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...participantIdHeaders(giverId),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${errorPrefix}: ${text}`);
  }
}

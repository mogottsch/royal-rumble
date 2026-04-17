import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchApi, participantIdHeaders } from "../api/fetcher";
import { getPendingDrinkPools, PendingDrinkPool } from "../drink_pools";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import { Lobby, Participant } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

type Allocation = Record<number, { schluecke: number; shots: number }>;

export function Distribute() {
  const { lobby, lobbyQuery } = useLobbyContext();
  const { claimedParticipantId } = useParticipantClaim();
  const { eliminationId } = useParams<{ eliminationId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [didRefetch, setDidRefetch] = useState(false);
  const parsedEliminationId = eliminationId ? parseInt(eliminationId) : undefined;
  const pools =
    lobby && claimedParticipantId !== null
      ? getPendingDrinkPools(lobby, claimedParticipantId, parsedEliminationId)
      : [];
  const hasPools = pools.length > 0;

  useEffect(() => {
    if (!lobby || claimedParticipantId === null || hasPools || didRefetch || !lobbyQuery) {
      return;
    }
    setDidRefetch(true);
    lobbyQuery.refetch();
  }, [claimedParticipantId, didRefetch, hasPools, lobby, lobbyQuery]);

  if (!lobby || claimedParticipantId === null) return null;

  if (!hasPools) {
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

  return (
    <AggregateForm
      lobby={lobby}
      pools={pools}
      giverId={claimedParticipantId}
      onFinish={() => navigate(`/lobbies/${lobby.code}/view-game`)}
    />
  );
}

function AggregateForm({
  lobby,
  pools,
  giverId,
  onFinish,
}: {
  lobby: Lobby;
  pools: PendingDrinkPool[];
  giverId: number;
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

  const sumSchluecke = useMemo(
    () => Object.values(alloc).reduce((s, a) => s + a.schluecke, 0),
    [alloc],
  );
  const sumShots = useMemo(
    () => Object.values(alloc).reduce((s, a) => s + a.shots, 0),
    [alloc],
  );

  const canSubmit = sumSchluecke === totalSchluecke && sumShots === totalShots;

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
          giverId,
          t("distribute.failedPrefix"),
        );
      }
    } finally {
      setKeyLoading("distribute", false);
    }
    onFinish();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("distribute.aggregateTitle")}
      </Typography>
      <Typography
        variant="body2"
        sx={{ textAlign: "center", opacity: 0.8, mb: 2 }}
      >
        {t("distribute.aggregateTotal", {
          sips: totalSchluecke,
          shots: totalShots,
        })}
      </Typography>

      <Stack spacing={0.5} sx={{ mb: 2 }}>
        {pools.map((pool) => (
          <Typography
            key={`${pool.eliminationId}-${pool.offender.id}-${pool.victim.id}`}
            variant="body2"
            sx={{ opacity: 0.8 }}
          >
            {t("distribute.aggregateElimination", {
              id: pool.eliminationId,
              offender: pool.offender.wrestler.name,
              victim: pool.victim.wrestler.name,
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
            showShots={totalShots > 0}
            canIncSchluecke={sumSchluecke < totalSchluecke}
            canIncShots={sumShots < totalShots}
            onBump={(key, delta) => bump(p.id, key, delta)}
          />
        ))}
      </Stack>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2">
          {t("distribute.sips", { current: sumSchluecke, total: totalSchluecke })}
        </Typography>
        {totalShots > 0 && (
          <Typography variant="body2">
            {t("distribute.shots", { current: sumShots, total: totalShots })}
          </Typography>
        )}
      </Box>

      <Stack spacing={1} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!canSubmit}
          onClick={submit}
        >
          {t("common.confirm")}
        </Button>
        <Button size="small" onClick={onFinish}>
          {t("distribute.skip")}
        </Button>
      </Stack>
    </Box>
  );
}

function buildDistributionRequests(pools: PendingDrinkPool[], alloc: Allocation) {
  const remaining = Object.fromEntries(
    Object.entries(alloc).map(([participantId, value]) => [participantId, { ...value }]),
  ) as Allocation;

  return pools.map((pool) => {
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
      elimination_id: pool.eliminationId,
      offender_rumbler_id: pool.offender.id,
      victim_rumbler_id: pool.victim.id,
      splits,
    };
  }).filter((request) => request.splits.length > 0);
}

function ParticipantRow({
  participant,
  schluecke,
  shots,
  showShots,
  canIncSchluecke,
  canIncShots,
  onBump,
}: {
  participant: Participant;
  schluecke: number;
  shots: number;
  showShots: boolean;
  canIncSchluecke: boolean;
  canIncShots: boolean;
  onBump: (key: "schluecke" | "shots", delta: number) => void;
}) {
  const { t } = useI18n();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography>{participant.name}</Typography>
      <Stack direction="row" spacing={2}>
        <Stepper
          label={t("distribute.sipsShort")}
          value={schluecke}
          canInc={canIncSchluecke}
          onInc={() => onBump("schluecke", 1)}
          onDec={() => onBump("schluecke", -1)}
        />
        {showShots && (
          <Stepper
            label={t("distribute.shotsShort")}
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
  value,
  canInc,
  onInc,
  onDec,
}: {
  label: string;
  value: number;
  canInc: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography variant="caption" sx={{ opacity: 0.7, minWidth: 32 }}>
        {label}
      </Typography>
      <IconButton size="small" onClick={onDec} disabled={value === 0}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography sx={{ minWidth: 18, textAlign: "center" }}>{value}</Typography>
      <IconButton size="small" onClick={onInc} disabled={!canInc}>
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

async function postDistribution(
  lobbyCode: string,
  body: {
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

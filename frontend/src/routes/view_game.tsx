import { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PersonalDrinkTracker } from "../components/personal_drink_tracker";
import { getPendingChestChoices, getPendingChestFollowUps, getPendingDrinkPools } from "../drink_pools";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { Participant, Rumbler } from "../hooks/use_lobby";
import { usePersonalDrinkTracker } from "../hooks/use_personal_drink_tracker";
import { useI18n } from "../i18n";
import { WrestlerTile } from "../components/wrestler_tile";

interface Row {
  participant?: Participant;
  rumbler?: Rumbler;
}

interface ParticipantCardProps {
  row: Row;
}

const ParticipantCard = ({ row }: ParticipantCardProps) => (
  <WrestlerTile participant={row.participant} rumbler={row.rumbler} />
);

const ActionButtons = ({
  lobby,
  pendingDrinkPoolsCount,
  onOpenDistribute,
}: {
  lobby: any;
  pendingDrinkPoolsCount: number;
  onOpenDistribute: () => void;
}) => {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 2,
        background: "linear-gradient(180deg, rgba(18,18,18,0) 0%, rgba(18,18,18,0.92) 24%, rgba(18,18,18,1) 100%)",
        px: 1,
        pt: 1,
        pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      }}
    >
      {pendingDrinkPoolsCount > 0 && (
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ width: "100%", mb: 1 }}
          onClick={onOpenDistribute}
        >
          {t("viewGame.handOutDrinks", { count: pendingDrinkPoolsCount })}
        </Button>
      )}
      <Grid container spacing={1}>
        {lobby.nextEntranceNumber !== null && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="contained"
              size="large"
              href={`/lobbies/${lobby.code}/add-entrance`}
              sx={{ width: "100%" }}
            >
              {t("viewGame.nextEntranceButton")}
            </Button>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Button
            variant="contained"
            sx={{ width: "100%" }}
            size="large"
            href={`/lobbies/${lobby.code}/add-elimination`}
            disabled={lobby.rumblers.length === 0}
          >
            {t("viewGame.nextEliminationButton")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const checkEntranceNumbersAssigned = (participants: Participant[]) => {
  return participants.every(
    (participant) => participant.entrance_number !== null
  );
};

export function ViewGame() {
  const { lobby } = useLobbyContext();
  const { claimedParticipantId } = useParticipantClaim();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>();
  const pendingDrinkPools = lobby ? getPendingDrinkPools(lobby, claimedParticipantId) : [];
  const pendingChestChoices = lobby ? getPendingChestChoices(lobby, claimedParticipantId) : [];
  const pendingChestFollowUps = lobby ? getPendingChestFollowUps(lobby, claimedParticipantId) : [];
  const pendingDrinkTaskCount =
    pendingDrinkPools.length + pendingChestChoices.length + pendingChestFollowUps.length;
  const rawDueTotals = useMemo(
    () => ({
      sips:
        lobby?.drink_distributions
          .filter(
            (distribution) => distribution.receiver_participant_id === claimedParticipantId,
          )
          .reduce((sum, distribution) => sum + distribution.schluecke, 0) ?? 0,
      shots:
        lobby?.drink_distributions
          .filter(
            (distribution) => distribution.receiver_participant_id === claimedParticipantId,
          )
          .reduce((sum, distribution) => sum + distribution.shots, 0) ?? 0,
      chugs:
        lobby?.chugs.filter((chug) => chug.participant_id === claimedParticipantId)
          .length ?? 0,
    }),
    [claimedParticipantId, lobby?.chugs, lobby?.drink_distributions],
  );
  const serverConsumedTotals = useMemo(
    () => ({
      sips: lobby?.participants.find((participant) => participant.id === claimedParticipantId)?.drunk_sips ?? 0,
      shots: lobby?.participants.find((participant) => participant.id === claimedParticipantId)?.drunk_shots ?? 0,
      chugs: lobby?.participants.find((participant) => participant.id === claimedParticipantId)?.drunk_chugs ?? 0,
    }),
    [claimedParticipantId, lobby?.participants],
  );
  const drinkTracker = usePersonalDrinkTracker({
    lobbyCode: lobby?.code,
    claimedParticipantId: claimedParticipantId ?? undefined,
    raw: rawDueTotals,
    serverConsumed: serverConsumedTotals,
  });

  useEffect(() => {
    if (!lobby) return;

    const foundRumblers = new Set<number>();
    const activeRumblers =
      lobby.rumblers?.filter((rumbler: Rumbler) => !rumbler.is_eliminated) ||
      [];
    const participants = lobby.participants || [];
    const participantRumblerTuple: Row[] = [];

    // Map participants to their rumblers
    participants.forEach((participant) => {
      const rumbler = activeRumblers.find(
        (r) => r.id === participant.rumbler_id
      );
      if (rumbler) {
        foundRumblers.add(rumbler.id);
      }
      participantRumblerTuple.push({ participant, rumbler });
    });

    // Add remaining rumblers without participants
    activeRumblers.forEach((rumbler) => {
      if (!foundRumblers.has(rumbler.id)) {
        participantRumblerTuple.push({ rumbler });
      }
    });

    setRows(participantRumblerTuple);
  }, [lobby]);

  if (!lobby) return null;

  if (!checkEntranceNumbersAssigned(lobby.participants)) {
    return <div>{t("viewGame.pendingEntranceNumbers")}</div>;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gridAutoRows: "min-content",
          mt: 1,
          overflowY: "auto",
          minHeight: 0,
          pb: 1,
        }}
      >
        {rows?.map((row, index) => (
          <ParticipantCard key={index} row={row} />
        ))}
      </Box>
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "background.default",
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "10px",
            fontSize: "17px",
            fontWeight: 200,
          }}
        >
          {lobby.nextEntranceNumber !== null
            ? t("viewGame.nextEntrance", { number: lobby.nextEntranceNumber })
            : t("viewGame.rumbleFull", { count: lobby.settings.rumble_size })}
        </Box>
        {claimedParticipantId !== null && (
          <PersonalDrinkTracker
            remaining={drinkTracker.remaining}
            onDecrement={drinkTracker.decrement}
          />
        )}
        <ActionButtons
          lobby={lobby}
          pendingDrinkPoolsCount={pendingDrinkTaskCount}
          onOpenDistribute={() => navigate(`/lobbies/${lobby.code}/distribute`)}
        />
      </Box>
    </Box>
  );
}

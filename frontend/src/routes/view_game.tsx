import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getPendingChestChoices, getPendingDrinkPools } from "../drink_pools";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { Participant, Rumbler } from "../hooks/use_lobby";
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
    <Grid container spacing={1} sx={{ mb: 2 }}>
      {pendingDrinkPoolsCount > 0 && (
        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ width: "100%" }}
            onClick={onOpenDistribute}
          >
            {t("viewGame.handOutDrinks", { count: pendingDrinkPoolsCount })}
          </Button>
        </Grid>
      )}
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

  const pendingDrinkPools = getPendingDrinkPools(lobby, claimedParticipantId);
  const pendingChestChoices = getPendingChestChoices(lobby, claimedParticipantId);
  const pendingDrinkTaskCount = pendingDrinkPools.length + pendingChestChoices.length;

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
          gridAutoRows: "min-content", // or 'auto'
          mt: 1,
          overflowY: "scroll",
        }}
      >
        {rows?.map((row, index) => (
          <ParticipantCard key={index} row={row} />
        ))}
      </Box>
      <Box>
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
        <ActionButtons
          lobby={lobby}
          pendingDrinkPoolsCount={pendingDrinkTaskCount}
          onOpenDistribute={() => navigate(`/lobbies/${lobby.code}/distribute`)}
        />
      </Box>
    </Box>
  );
}

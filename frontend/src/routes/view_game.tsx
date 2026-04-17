import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Fab, Grid } from "@mui/material";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import { useNavigate } from "react-router-dom";
import { getPendingDrinkPools } from "../drink_pools";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { Participant, Rumbler } from "../hooks/use_lobby";
import { StatsDrawer } from "../components/stats_drawer";
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

const ActionButtons = ({ lobby }: { lobby: any }) => {
  const { t } = useI18n();

  return (
    <Grid container spacing={1} sx={{ mb: 2 }}>
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
  const [statsOpen, setStatsOpen] = useState(false);

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
        {lobby.nextEntranceNumber && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: "10px",
              fontSize: "17px",
              fontWeight: 200,
            }}
          >
            {t("viewGame.nextEntrance", { number: lobby.nextEntranceNumber })}
          </Box>
        )}
        {pendingDrinkPools.length > 0 && (
          <Button
            variant="outlined"
            size="large"
            sx={{ width: "100%", mb: 1 }}
            onClick={() => navigate(`/lobbies/${lobby.code}/distribute`)}
          >
            {t("viewGame.handOutDrinks", { count: pendingDrinkPools.length })}
          </Button>
        )}
        <ActionButtons lobby={lobby} />
      </Box>
      <Fab
        color="primary"
        onClick={() => setStatsOpen(true)}
        sx={{ position: "fixed", bottom: 80, right: 16 }}
      >
        <LocalBarIcon />
      </Fab>
      <StatsDrawer
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        lobby={lobby}
      />
    </Box>
  );
}

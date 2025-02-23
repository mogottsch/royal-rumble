import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Grid } from "@mui/material";
import { useLobbyContext } from "../contexts/lobby_context";
import { Participant, Rumbler } from "../hooks/use_lobby";

interface Row {
  participant?: Participant;
  rumbler?: Rumbler;
}

interface ParticipantCardProps {
  row: Row;
}

interface ParticipantNameProps {
  name?: string;
}

const ParticipantName = ({ name }: ParticipantNameProps) => (
  <span>{name ?? "NPC"}</span>
);

interface WrestlerImageProps {
  imageUrl?: string;
}

const IMAGE_SIZE = 100;
const IMAGE_SIZE_PX = `${IMAGE_SIZE}px`;
const WrestlerImage = ({ imageUrl }: WrestlerImageProps) => {
  if (imageUrl) {
    return <img src={imageUrl} height={IMAGE_SIZE_PX} alt="wrestler" />;
  }
  return (
    <span
      style={{
        height: IMAGE_SIZE_PX,
        fontSize: `${IMAGE_SIZE - 30}px`,
        fontWeight: 400,
      }}
    >
      ?
    </span>
  );
};

interface EntranceNumberProps {
  number?: number;
}

const EntranceNumber = ({ number }: EntranceNumberProps) => (
  <Box
    sx={{
      height: IMAGE_SIZE_PX,
      fontSize: `${IMAGE_SIZE - 60}px`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <span>#{number}</span>
  </Box>
);

interface WrestlerNameProps {
  name?: string;
}

const WrestlerName = ({ name }: WrestlerNameProps) => (
  <Box
    sx={{
      width: "100%",
      backgroundColor: "#1a1919",
      display: "flex",
      justifyContent: "center",
      padding: "5px",
      fontWeight: 400,
      color: "#fff",
      boxShadow: "0 -1px 100px #ff0000,0 -1px 5px #ff0000",
      textShadow: `
    0 0 4px #ff0000,
    0 0 8px #ff0000
  `,
    }}
  >
    <span>{name ?? <>&nbsp;</>}</span>
  </Box>
);

const participantCardStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  // justifyContent: "space-between",
  // padding: "5px",
  margin: "5px",
  paddingTop: "5px",
  borderRadius: "4px",

  backgroundColor: "rgba(255, 255, 255, 0.07)",
  whiteSpace: "nowrap",
  overflow: "hidden",

  border: "1px solid #7b7b7b",

  fontWeight: 200,
} as const;

interface ParticipantCardProps {
  row: Row;
}

const ParticipantCard = ({ row }: ParticipantCardProps) => (
  <Box sx={participantCardStyles}>
    <ParticipantName name={row.participant?.name} />
    {row.rumbler ? (
      <>
        <WrestlerImage imageUrl={row.rumbler.wrestler.image_url} />
      </>
    ) : (
      <EntranceNumber number={row.participant?.entrance_number} />
    )}

    <WrestlerName name={row.rumbler?.wrestler.name} />
  </Box>
);

const ActionButtons = ({ lobby }: { lobby: any }) => (
  <Grid container spacing={1} sx={{ mb: 2 }}>
    <Grid item xs={12} sm={6}>
      <Button
        variant="contained"
        size="large"
        href={`/lobbies/${lobby.code}/add-entrance`}
        sx={{ width: "100%" }}
      >
        NEXT ENTRANCE
      </Button>
    </Grid>
    <Grid item xs={12} sm={6}>
      <Button
        variant="contained"
        sx={{ width: "100%" }}
        size="large"
        href={`/lobbies/${lobby.code}/add-elimination`}
        disabled={lobby.rumblers.length === 0}
      >
        NEXT ELIMINATATION
      </Button>
    </Grid>
  </Grid>
);

const checkEntranceNumbersAssigned = (participants: Participant[]) => {
  return participants.every(
    (participant) => participant.entrance_number !== null
  );
};

export function ViewGame() {
  const { lobby } = useLobbyContext();
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
    return <div>Wait while the host assigns entrance numbers</div>;
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
            Next: #{lobby.nextEntranceNumber}
          </Box>
        )}
        <ActionButtons lobby={lobby} />
      </Box>
    </Box>
  );
}

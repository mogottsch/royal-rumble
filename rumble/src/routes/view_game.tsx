import Button from "@mui/material/Button";
import { Box, Grid } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";
import { Participant, Rumbler } from "../hooks/use_lobby";

interface Row {
  participant?: Participant;
  rumbler?: Rumbler;
}

export function ViewGame() {
  const { lobby } = useLobbyContext();

  const [rows, setRows] = useState<Row[]>();
  const foundRumblers = new Set<number>();
  useEffect(() => {
    const rumblers = (lobby?.rumblers || []).filter(
      (rumbler) => !rumbler.is_eliminated
    );
    const participants = lobby?.participants || [];
    const participantRumblerTuple: Row[] = [];
    for (const participant of participants) {
      const rumbler = rumblers.find(
        (rumbler) => rumbler.id === participant.rumbler_id
      );
      if (rumbler) {
        foundRumblers.add(rumbler.id);
      }
      const row: Row = {
        participant,
        rumbler,
      };
      participantRumblerTuple.push(row);
    }

    for (const rumbler of rumblers) {
      if (!foundRumblers.has(rumbler.id)) {
        const row: Row = {
          rumbler,
        };
        participantRumblerTuple.push(row);
      }
    }

    setRows(participantRumblerTuple);
  }, [lobby]);

  if (!lobby) return null;

  const isEntranceNumbersAssigned = checkEntranceNumbersAssigned(
    lobby.participants
  );

  if (!isEntranceNumbersAssigned) {
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          overflowY: "auto",
          mt: 1,
        }}
      >
        {rows?.map((row, i) => {
          return (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                width: "100%",
                padding: "5px 5px",
                gridColumnGap: "5px",
              }}
              key={i}
            >
              <Box
                sx={{
                  padding: "5px 8px",
                  justifyContent: "center",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                }}
              >
                {row.participant?.name ?? "NPC"}
              </Box>
              <Box
                sx={{
                  padding: "5px 8px",
                  justifyContent: "center",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                }}
              >
                {row.rumbler?.wrestler.name ??
                  `Awaiting #${row.participant?.entrance_number}`}
              </Box>
            </Box>
          );
        })}
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
      </Box>
    </Box>
  );
}

function checkEntranceNumbersAssigned(participants: Participant[]) {
  return participants.every(
    (participant) => participant.entrance_number !== null
  );
}

import Button from "@mui/material/Button";
import { Box, Modal, Typography } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";
import { Participant, Rumbler } from "../hooks/use_lobby";
import { CopyToClipboardButton } from "../components/buttons";

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
        }}
      >
        {rows?.map((row, i) => {
          return (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                width: "100%",
                padding: "5px",
              }}
              key={i}
            >
              <Box
                sx={{
                  margin: "5px",
                  padding: "7px",
                  justifyContent: "center",
                  border: "1px solid #90caf9",
                }}
              >
                {row.participant?.name ?? "NPC"}
              </Box>
              <Box
                sx={{
                  margin: "5px",
                  padding: "7px",
                  justifyContent: "center",
                  border: "1px solid #90caf9",
                }}
              >
                {row.rumbler?.wrestler.name ??
                  `Awaiting #${row.participant?.entrance_number}`}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          href={`/lobbies/${lobby.code}/add-entrance`}
        >
          NEXT ENTRANCE
        </Button>
        <Button
          variant="outlined"
          sx={{ mt: 1 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-elimination`}
          disabled={lobby.rumblers.length === 0}
        >
          NEXT ELIMINATATION
        </Button>
      </Box>
    </Box>
  );
}

function checkEntranceNumbersAssigned(participants: Participant[]) {
  return participants.every(
    (participant) => participant.entrance_number !== null
  );
}

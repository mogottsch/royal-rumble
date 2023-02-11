/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
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
    const rumblers = lobby?.rumblers || [];
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

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {rows?.map((row, i) => {
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                margin: "5px",
              }}
              key={i}
            >
              <Box
                sx={{
                  width: "180px",
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
                  width: "180px",
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
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          css={css`
            width: 100%;
          `}
          sx={{ mt: 5 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-entrance`}
        >
          NEXT ENTRANCE
        </Button>
        <Button
          variant="outlined"
          css={css`
            width: 100%;
          `}
          sx={{ mt: 5 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-elimination`}
        >
          NEXT ELIMINATATION
        </Button>
      </Box>
    </>
  );
}

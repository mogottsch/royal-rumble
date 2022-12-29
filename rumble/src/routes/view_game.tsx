/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";

interface Row {
  participantName: string;
  wrestlerName: string;
}

export function ViewGame() {
  const { lobby } = useLobbyContext();

  const [rows, setRows] = useState<Row[]>();
  useEffect(() => {
    const currentRows: Row[] = [];
    lobby?.participants.forEach((participant) => {
      currentRows.push({
        participantName: participant.name,
        wrestlerName:
          lobby.rumblers[participant.rumbler_id] == null
            ? `Awaiting #${participant.entrance_number}`
            : lobby.rumblers[participant.rumbler_id].wrestler.name,
      });
    });
    lobby?.rumblers.forEach((rumbler) => {
      if(currentRows.filter(row => row.wrestlerName == rumbler.wrestler.name).length === 0) {
        currentRows.push({participantName: "NPC", wrestlerName: rumbler.wrestler.name});
      }
    });
    setRows(currentRows);
  }, [lobby]);

  if (!lobby) return null;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {rows?.map((row, i) => {
          return (
            <>
              <Box
                sx={{
                  width: "150px",
                  margin: "5px",
                  justifyContent: "center",
                }}
              >
                {row.participantName}
              </Box>
              <Box
                sx={{
                  width: "150px",
                  margin: "5px",
                  justifyContent: "center",
                }}
              >
                {row.wrestlerName}
              </Box>
            </>
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
            width: 50%;
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
            width: 50%;
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

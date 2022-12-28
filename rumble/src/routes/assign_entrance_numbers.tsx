/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useState } from "react";
import { useLobbyContext } from "../contexts/lobby_context";

export function AssignEntranceNumbers() {
  const { lobby } = useLobbyContext();
  const [selectedParticipantId, setSelectedParticipantId] = useState<number>();
  const [participantEntranceNumber, setParticipantEntranceNumber] = useState<Record<number, number>>();

  function updateParticipantEntranceNumbers(entranceNumber: number) {
    console.log("in method :)");
    if (selectedParticipantId == null) return null;
    if (participantEntranceNumber == null) return null;
    participantEntranceNumber[selectedParticipantId] = entranceNumber;
    setParticipantEntranceNumber(participantEntranceNumber);
  }

  console.log(lobby);
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
        {lobby.participants.map((participant, i) => {
            return <Button
                      key={i}
                      variant="outlined"
                      css={css`
                          width: 50px
                      `}
                      sx={{ mt: 2 }}
                      size="large"
                      onClick={() => updateParticipantEntranceNumbers(i)}
                    >
                      {i}
                    </Button>
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
        {lobby.participants.map((participant, i) => {
            return <Button
                      key={i}
                      variant="outlined"
                      css={css`
                          width: 80%;
                      `}
                      sx={{ mt: 2 }}
                      size="large"
                      onClick={() => setSelectedParticipantId(participant.id)}
                    >
                      {participant.name} {participantEntranceNumber[participant.id]}
                    </Button>
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
          href={`/lobbies/${lobby?.code}/entrance-numbers`} // request
        >
          START ROYAL RUMBLE
        </Button>
      </Box>
    </>
  );
}

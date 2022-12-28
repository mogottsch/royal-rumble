/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useLobbyContext } from "../contexts/lobby_context";

export function AssignEntranceNumbers() {
  const { lobby } = useLobbyContext();
  const [selectedParticipantId, setSelectedParticipantId] = useState<number>();
  const toggleParticipant = (participantId: number) => {
    if (selectedParticipantId === participantId) {
      setSelectedParticipantId(undefined);
    } else {
      setSelectedParticipantId(participantId);
    }
  };

  const [selectedEntranceNumber, setSelectedEntranceNumber] =
    useState<number>();
  const toggleEntranceNumber = (entranceNumber: number) => {
    if (selectedEntranceNumber === entranceNumber) {
      setSelectedEntranceNumber(undefined);
    } else {
      setSelectedEntranceNumber(entranceNumber);
    }
  };

  const [participantEntranceNumber, setParticipantEntranceNumber] =
    useState<Record<number, number>>();

  function updateParticipantEntranceNumbers() {
    if (selectedParticipantId === undefined) return null;
    if (selectedEntranceNumber === undefined) return null;
    setParticipantEntranceNumber({
      ...participantEntranceNumber,
      [selectedParticipantId]: selectedEntranceNumber,
    });
  }

  useEffect(() => {
    if (
      selectedParticipantId === undefined ||
      selectedEntranceNumber === undefined
    )
      return;
    updateParticipantEntranceNumbers();
    setSelectedParticipantId(undefined);
    setSelectedEntranceNumber(undefined);
  }, [selectedParticipantId, selectedEntranceNumber]);

  if (!lobby) return null;

  const nParticipants = lobby.participants.length;
  const entranceNumbers = Array.from(Array(nParticipants).keys()).map(
    (i) => i + 1
  );
  const assignedEntranceNumbers = Object.values(
    participantEntranceNumber ?? {}
  );
  const assignedParticipantIds = Object.keys(
    participantEntranceNumber ?? {}
  ).map((id) => parseInt(id));

  const unassignParticipant = (participantId: number) => {
    const newParticipantEntranceNumber = { ...participantEntranceNumber };
    delete newParticipantEntranceNumber[participantId];
    setParticipantEntranceNumber(newParticipantEntranceNumber);
  };

  const handleParticipantClick = (participantId: number) => {
    if (assignedParticipantIds.includes(participantId)) {
      unassignParticipant(participantId);
      return;
    }
    toggleParticipant(participantId);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {entranceNumbers.map((entranceNumber) => (
          <Button
            key={entranceNumber}
            color={
              assignedEntranceNumbers.includes(entranceNumber)
                ? "secondary"
                : "primary"
            }
            variant={
              selectedEntranceNumber === entranceNumber
                ? "contained"
                : "outlined"
            }
            css={css`
              width: 50px;
            `}
            sx={{ mt: 2 }}
            size="large"
            onClick={() => toggleEntranceNumber(entranceNumber)}
          >
            {entranceNumber}
          </Button>
        ))}
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
          return (
            <Button
              key={i}
              color={
                assignedParticipantIds.includes(participant.id)
                  ? "secondary"
                  : "primary"
              }
              variant={
                selectedParticipantId === participant.id
                  ? "contained"
                  : "outlined"
              }
              css={css`
                width: 80%;
              `}
              sx={{ mt: 2 }}
              size="large"
              onClick={() => handleParticipantClick(participant.id)}
            >
              {participant.name}{" "}
              {participantEntranceNumber?.[participant.id] ?? ""}
            </Button>
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
          href={`/lobbies/${lobby?.code}/entrance-numbers`} // request
        >
          START ROYAL RUMBLE
        </Button>
      </Box>
    </>
  );
}

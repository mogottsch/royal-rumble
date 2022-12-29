/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useNavigate } from "react-router-dom";

export function AssignEntranceNumbers() {
  const navigate = useNavigate();
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

  const allAssigned = assignedEntranceNumbers.length === nParticipants;

  const assignEntranceNumbers = async () => {
    if (participantEntranceNumber === undefined || !allAssigned) {
      console.error("Not all participants have been assigned entrance numbers");
      alert("Not all participants have been assigned entrance numbers");
      return;
    }
    const updatedLobby = await putEntranceNumbers(
      lobby.code,
      participantEntranceNumber
    );
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
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
              width: 100px;
              height: 60px;
            `}
            sx={{ my: 1, mx: 1 }}
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
          alignItems: "center",
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
                width: 308px;
              `}
              sx={{ my: 1 }}
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
          onClick={assignEntranceNumbers}
        >
          START ROYAL RUMBLE
        </Button>
      </Box>
    </>
  );
}

async function putEntranceNumbers(
  lobbyCode: string,
  entranceNumbers: Record<number, number>
) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const body = JSON.stringify({ participantEntranceNumbers: entranceNumbers });
  const url = new URL(`api/lobbies/${lobbyCode}/entrance-numbers`, BACKEND_URL);
  const response = await fetch(url.toString(), {
    method: "PUT",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to post entrance numbers: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data.lobby;
}

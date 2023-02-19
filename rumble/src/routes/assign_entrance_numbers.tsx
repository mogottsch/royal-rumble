import Button from "@mui/material/Button";
import { Box, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useNavigate } from "react-router-dom";

export function AssignEntranceNumbers() {
  const navigate = useNavigate();
  const { lobby, lobbyQuery } = useLobbyContext();

  const [selectedParticipantId, setSelectedParticipantId] = useState<number>();
  const toggleParticipant = (participantId: number) => {
    if (selectedParticipantId === participantId) {
      setSelectedParticipantId(undefined);
    } else {
      setSelectedParticipantId(participantId);
    }
  };

  const [participantEntranceNumber, setParticipantEntranceNumber] = useState<
    Record<number, number>
  >({});

  const [selectedEntranceNumber, setSelectedEntranceNumber] =
    useState<number>();

  const toggleEntranceNumber = (entranceNumber: number) => {
    const assignedEntranceNumbers = Object.values(participantEntranceNumber);
    if (assignedEntranceNumbers.includes(entranceNumber)) {
      const newParticipantEntranceNumber = { ...participantEntranceNumber };
      const participantId = Object.keys(participantEntranceNumber).find(
        (id) => participantEntranceNumber[parseInt(id)] === entranceNumber
      );
      if (participantId) {
        delete newParticipantEntranceNumber[parseInt(participantId)];
      }
      setParticipantEntranceNumber(newParticipantEntranceNumber);
      return;
    }
    if (selectedEntranceNumber === entranceNumber) {
      setSelectedEntranceNumber(undefined);
    } else {
      setSelectedEntranceNumber(entranceNumber);
    }
  };

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
    await putEntranceNumbers(lobby.code, participantEntranceNumber);
    await lobbyQuery?.refetch();
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
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
              sx={{ my: 1, mx: 1 }}
              size="large"
              onClick={() => toggleEntranceNumber(entranceNumber)}
            >
              {entranceNumber}
            </Button>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
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
                sx={{ my: 1, mx: 1 }}
                size="large"
                onClick={() => handleParticipantClick(participant.id)}
              >
                {participant.name}{" "}
                {participantEntranceNumber?.[participant.id] ?? ""}
              </Button>
            );
          })}
        </Box>
      </Box>
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Button
          variant="outlined"
          sx={{ width: "100%" }}
          size="large"
          onClick={assignEntranceNumbers}
        >
          START ROYAL RUMBLE
        </Button>
      </Box>
    </Box>
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
    method: "POST",
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

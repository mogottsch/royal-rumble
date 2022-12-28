import {
  Button,
  Divider,
  FormControl,
  Input,
  InputLabel,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/buttons";
import { InputField } from "../components/form";

export function CreateLobby() {
  const [newName, setNewName] = useState("");
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigate = useNavigate();

  const isParticipantNameEmpty = newName === "";
  const isParticipantNameDuplicate = participantNames.includes(newName);

  const addParticipant = () => {
    if (isParticipantNameEmpty) {
      setErrorMessages(["Participant name cannot be empty"]);
    }
    if (isParticipantNameDuplicate) {
      setErrorMessages(["Participant name must be unique"]);
    }
    if (isParticipantNameEmpty || isParticipantNameDuplicate) {
      return;
    }
    setParticipantNames([...participantNames, newName]);
    setNewName("");
    setErrorMessages([]);
  };

  const createLobby = async () => {
    if (participantNames.length < 2) {
      setErrorMessages(["Must have at least 2 participants"]);
      return;
    }
    setErrorMessages([]);
    const lobby = await postCreateLobby(participantNames);
    navigate(`/lobbies/${lobby.code}`);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addParticipant();
  };

  return (
    <Box>
      <Box>
        {participantNames.map((name) => (
          <NameBox key={name}>{name}</NameBox>
        ))}
      </Box>
      <Divider />
      <form onSubmit={onSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <InputField
            label="Name"
            htmlFor="name"
            id="name"
            value={newName}
            onChange={setNewName}
            errorMessages={errorMessages}
          />
          <PrimaryButton sx={{ mt: 2 }} onClick={addParticipant}>
            Add new participant
          </PrimaryButton>
        </Box>
      </form>
      <Box sx={{ mt: 4, display: "flex", flexDirection: "column" }}>
        <PrimaryButton onClick={createLobby}>
          Continue with entrance order
        </PrimaryButton>
      </Box>
    </Box>
  );
}

const NameBox = ({ children }: { children: JSX.Element | string }) => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
    <Typography variant="button">{children}</Typography>
  </Box>
);

async function postCreateLobby(participants: string[]) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const body = JSON.stringify({ participants });
  const url = new URL(`/api/lobbies`, BACKEND_URL);
  const response = await fetch(url.toString(), {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create lobby: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data.lobby;
}

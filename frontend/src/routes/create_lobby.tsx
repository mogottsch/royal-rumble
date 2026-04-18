import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/fetcher";
import { PrimaryButton } from "../components/buttons";
import { InputField } from "../components/form";
import {
  getDefaultLobbySettings,
  LobbySettings,
  LobbySettingsForm,
} from "../components/lobby_settings_form";
import { isTestSeedTrigger, mergeTestParticipants } from "../test_lobby_seed";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import { useI18n } from "../i18n";

export function CreateLobby() {
  const [newName, setNewName] = useState("");
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [settings, setSettings] = useState<LobbySettings>(getDefaultLobbySettings());
  const navigate = useNavigate();
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { t } = useI18n();

  const isParticipantNameEmpty = newName === "";
  const isParticipantNameDuplicate = participantNames.includes(newName);

  const addParticipant = () => {
    if (isTestSeedTrigger(newName)) {
      setParticipantNames((current) => mergeTestParticipants(current));
      setNewName("");
      setErrorMessages([]);
      return;
    }

    if (isParticipantNameEmpty) {
      setErrorMessages([t("createLobby.errorEmpty")]);
    }
    if (isParticipantNameDuplicate) {
      setErrorMessages([t("createLobby.errorDuplicate")]);
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
      setErrorMessages([t("createLobby.errorMinParticipants")]);
      return;
    }
    setErrorMessages([]);
      setKeyLoading("createLobby", true);
      const lobby = await postCreateLobby(
        participantNames,
        settings,
        t("createLobby.errorFailed", { statusText: responseStatusToken }),
      );
    setKeyLoading("createLobby", false);
    navigate(`/lobbies/${lobby.code}/assign-entrance-numbers`);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addParticipant();
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pt: 1,
          pb: 2,
        }}
      >
        <Box>
          {participantNames.map((name) => (
            <NameBox key={name}>{name}</NameBox>
          ))}
        </Box>
        <Divider />
        <form onSubmit={onSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <InputField
              label={t("createLobby.participantName")}
              htmlFor="name"
              id="name"
              value={newName}
              onChange={setNewName}
              errorMessages={errorMessages}
            />
            <PrimaryButton sx={{ mt: 2 }} onClick={addParticipant}>
              {t("createLobby.addParticipant")}
            </PrimaryButton>
          </Box>
        </form>

        <Box sx={{ mt: 4 }}>
          <LobbySettingsForm value={settings} onChange={setSettings} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: 2,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 28%, rgba(0,0,0,1) 100%)",
        }}
      >
        <PrimaryButton
          onClick={createLobby}
          disabled={participantNames.length < 2}
        >
          {t("createLobby.continue")}
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

async function postCreateLobby(
  participants: string[],
  settings: LobbySettings,
  errorTemplate: string,
) {
  const body = JSON.stringify({ participants, ...settings });
  const response = await fetchApi("/lobbies", {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(errorTemplate.replace(responseStatusToken, response.statusText));
  }
  const data = await response.json();
  return data.data.lobby;
}

const responseStatusToken = "__status_text__";

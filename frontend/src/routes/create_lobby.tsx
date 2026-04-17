import { Divider, Typography, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/fetcher";
import { PrimaryButton } from "../components/buttons";
import { InputField } from "../components/form";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import { useI18n } from "../i18n";

type DrinkConfigForm = {
  schluecke_per_elimination: number;
  shots_per_elimination: number;
  schluecke_on_npc_elimination: number;
  shots_on_npc_elimination: number;
};

export function CreateLobby() {
  const [newName, setNewName] = useState("");
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [drinkConfig, setDrinkConfig] = useState<DrinkConfigForm>({
    schluecke_per_elimination: 2,
    shots_per_elimination: 0,
    schluecke_on_npc_elimination: 0,
    shots_on_npc_elimination: 0,
  });
  const navigate = useNavigate();
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { t } = useI18n();

  const isParticipantNameEmpty = newName === "";
  const isParticipantNameDuplicate = participantNames.includes(newName);

  const addParticipant = () => {
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
      drinkConfig,
      t("createLobby.errorFailed", { statusText: responseStatusToken }),
    );
    setKeyLoading("createLobby", false);
    navigate(`/lobbies/${lobby.code}/assign-entrance-numbers`);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addParticipant();
  };

  const setDrinkField = (key: keyof DrinkConfigForm) => (v: string) =>
    setDrinkConfig({ ...drinkConfig, [key]: Math.max(0, parseInt(v) || 0) });

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
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t("createLobby.drinkRules")}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <NumField
            label={t("createLobby.sipsPerElimination")}
            value={drinkConfig.schluecke_per_elimination}
            onChange={setDrinkField("schluecke_per_elimination")}
          />
          <NumField
            label={t("createLobby.shotsPerElimination")}
            value={drinkConfig.shots_per_elimination}
            onChange={setDrinkField("shots_per_elimination")}
          />
          <NumField
            label={t("createLobby.sipsNpcElim")}
            value={drinkConfig.schluecke_on_npc_elimination}
            onChange={setDrinkField("schluecke_on_npc_elimination")}
          />
          <NumField
            label={t("createLobby.shotsNpcElim")}
            value={drinkConfig.shots_on_npc_elimination}
            onChange={setDrinkField("shots_on_npc_elimination")}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 4, display: "flex", flexDirection: "column" }}>
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

const NumField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) => (
  <TextField
    label={label}
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    size="small"
  />
);

const NameBox = ({ children }: { children: JSX.Element | string }) => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
    <Typography variant="button">{children}</Typography>
  </Box>
);

async function postCreateLobby(
  participants: string[],
  drinkConfig: DrinkConfigForm,
  errorTemplate: string,
) {
  const body = JSON.stringify({ participants, ...drinkConfig });
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

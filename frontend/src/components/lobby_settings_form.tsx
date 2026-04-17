import { Box, TextField, Typography } from "@mui/material";
import { Lobby } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

export type LobbySettings = {
  rumble_size: number;
  schluecke_per_elimination: number;
  shots_per_elimination: number;
  schluecke_on_npc_elimination: number;
  shots_on_npc_elimination: number;
};

export function getDefaultLobbySettings(): LobbySettings {
  return {
    rumble_size: 30,
    schluecke_per_elimination: 2,
    shots_per_elimination: 0,
    schluecke_on_npc_elimination: 0,
    shots_on_npc_elimination: 0,
  };
}

export function getLobbySettings(lobby: Lobby): LobbySettings {
  return lobby.settings;
}

export function LobbySettingsForm({
  value,
  onChange,
}: {
  value: LobbySettings;
  onChange: (value: LobbySettings) => void;
}) {
  const { t } = useI18n();

  const setField = (key: keyof LobbySettings) => (next: string) => {
    onChange({ ...value, [key]: Math.max(0, parseInt(next) || 0) });
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t("lobbySettings.title")}
      </Typography>
      <Box sx={{ display: "grid", gap: 2 }}>
        <NumField
          label={t("lobbySettings.rumbleSize")}
          value={value.rumble_size}
          onChange={setField("rumble_size")}
        />
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
            {t("lobbySettings.perElimination")}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <NumField
              label={t("createLobby.sipsPerElimination")}
              value={value.schluecke_per_elimination}
              onChange={setField("schluecke_per_elimination")}
            />
            <NumField
              label={t("createLobby.shotsPerElimination")}
              value={value.shots_per_elimination}
              onChange={setField("shots_per_elimination")}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
            {t("lobbySettings.npcElimination")}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <NumField
              label={t("createLobby.sipsNpcElim")}
              value={value.schluecke_on_npc_elimination}
              onChange={setField("schluecke_on_npc_elimination")}
            />
            <NumField
              label={t("createLobby.shotsNpcElim")}
              value={value.shots_on_npc_elimination}
              onChange={setField("shots_on_npc_elimination")}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
    />
  );
}

import { Box, Button, Divider } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/fetcher";
import { useLobbyContext } from "../contexts/lobby_context";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import { Rumbler } from "../hooks/use_lobby";
import { useI18n } from "../i18n";
import { WrestlerTile } from "../components/wrestler_tile";

export function AddElimination() {
  const { lobby } = useLobbyContext();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [victimIds, setVictimIds] = useState<number[]>([]);
  const [offenderIds, setOffenderIds] = useState<number[]>([]);
  const { setKeyLoading } = useLoadingAndErrorStates();

  if (!lobby) return null;

  const rumblers = lobby.rumblers || [];
  const activeRumblers = rumblers.filter((rumbler) => !rumbler.is_eliminated);
  const victims = activeRumblers.filter((rumbler) => victimIds.includes(rumbler.id));
  const offenders = activeRumblers.filter((rumbler) => offenderIds.includes(rumbler.id));

  const toggleVictim = (rumbler: Rumbler) => {
    if (victimIds.includes(rumbler.id)) {
      setVictimIds(victimIds.filter((victimId) => victimId !== rumbler.id));
    } else {
      setVictimIds([...victimIds, rumbler.id]);
    }
  };

  const toggleOffender = (rumbler: Rumbler) => {
    if (offenderIds.includes(rumbler.id)) {
      setOffenderIds(offenderIds.filter((offenderId) => offenderId !== rumbler.id));
    } else {
      setOffenderIds([...offenderIds, rumbler.id]);
    }
  };

  const addElimination = async () => {
    if (victims.length === 0 || offenders.length === 0) return;
    setKeyLoading("addElimination", true);
    await postElimination(
      lobby.code,
      offenders,
      victims,
      t("addElimination.errorFailedPrefix"),
    );
    setKeyLoading("addElimination", false);
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "100%",
      }}
    >
      <Box sx={{ mt: 2, overflowY: "auto", mb: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Divider sx={{ mb: 1 }}>{t("addElimination.offenders")}</Divider>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 1,
            }}
          >
            {activeRumblers.map((rumbler) => (
              <Box
                key={rumbler.id}
                onClick={() => toggleOffender(rumbler)}
              >
                <WrestlerTile
                  participant={rumbler.participant ?? undefined}
                  rumbler={rumbler}
                  selected={offenderIds.includes(rumbler.id)}
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Divider sx={{ mb: 1 }}>{t("addElimination.victims")}</Divider>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 1,
          }}
        >
          {activeRumblers.map((rumbler) => (
            <Box
              key={rumbler.id}
              onClick={() => toggleVictim(rumbler)}
            >
              <WrestlerTile
                participant={rumbler.participant ?? undefined}
                rumbler={rumbler}
                selected={victimIds.includes(rumbler.id)}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={addElimination}
          disabled={victimIds.length === 0 || offenderIds.length === 0}
        >
          {t("addElimination.submit")}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          size="large"
          href={`/lobbies/${lobby.code}/view-game`}
        >
          {t("common.back")}
        </Button>
      </Box>
    </Box>
  );
}

async function postElimination(
  lobbyCode: string,
  offenders: Rumbler[],
  victims: Rumbler[],
  errorPrefix: string,
) {
  const body = JSON.stringify({
    victim_ids: victims.map((rumbler) => rumbler.id),
    offender_ids: offenders.map((rumbler) => rumbler.id),
  });
  const response = await fetchApi(`lobbies/${lobbyCode}/elimination`, {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.statusText}`);
  }
  return (await response.json()) as { elimination_id: number };
}

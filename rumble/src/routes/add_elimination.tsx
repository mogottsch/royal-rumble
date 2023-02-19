import { css } from "@emotion/react";
import { Box, Button, Divider, Grid } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobbyContext } from "../contexts/lobby_context";
import { Rumbler } from "../hooks/use_lobby";

export function AddElimination() {
  const { lobby } = useLobbyContext();
  const navigate = useNavigate();
  const [victims, setVictims] = useState<Rumbler[]>([]);
  const [offenders, setOffenders] = useState<Rumbler[]>([]);

  if (!lobby) return null;

  const rumblers = lobby.rumblers || [];
  const activeRumblers = rumblers.filter((rumbler) => !rumbler.is_eliminated);

  const toggleVictim = (rumbler: Rumbler) => {
    if (victims.includes(rumbler)) {
      setVictims(victims.filter((victim: Rumbler) => victim.id !== rumbler.id));
    } else {
      setVictims([...victims, rumbler]);
    }
  };

  const toggleOffender = (rumbler: Rumbler) => {
    if (offenders.includes(rumbler)) {
      setOffenders(offenders.filter((offender) => offender.id !== rumbler.id));
    } else {
      setOffenders([...offenders, rumbler]);
    }
  };

  const addElimination = async () => {
    if (victims.length === 0 || offenders.length === 0) return;
    await postElimination(lobby.code, offenders, victims);
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
      <Box sx={{ mt: 2, overflowY: "scroll", mb: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Divider sx={{ mb: 1 }}>WHO IS/ARE THE ELIMINATOR(S)?</Divider>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 1,
            }}
          >
            {activeRumblers.map((rumbler) => (
              <Button
                variant="outlined"
                color={offenders.includes(rumbler) ? "secondary" : "primary"}
                onClick={() => toggleOffender(rumbler)}
              >
                {rumbler.wrestler.name}
              </Button>
            ))}
          </Box>
        </Box>
        <Divider sx={{ mb: 1 }}>WHO IS/ARE THE VICTIM(S)?</Divider>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 1,
          }}
        >
          {activeRumblers.map((rumbler) => (
            <Button
              variant="outlined"
              color={victims.includes(rumbler) ? "secondary" : "primary"}
              onClick={() => toggleVictim(rumbler)}
            >
              {rumbler.wrestler.name}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={addElimination}
          disabled={victims.length === 0 || offenders.length === 0}
        >
          ADD ELIMINATION
        </Button>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          size="large"
          href={`/lobbies/${lobby.code}/view-game`}
        >
          BACK
        </Button>
      </Box>
    </Box>
  );
}

async function postElimination(
  lobbyCode: string,
  offenders: Rumbler[],
  victims: Rumbler[]
) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const body = JSON.stringify({
    victim_ids: victims.map((rumbler) => rumbler.id),
    offender_ids: offenders.map((rumbler) => rumbler.id),
  });
  const url = new URL(`api/lobbies/${lobbyCode}/elimination`, BACKEND_URL);
  const response = await fetch(url.toString(), {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to post entrance: ${response.statusText}`);
  }
}

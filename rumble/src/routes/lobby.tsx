import {
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStateContext } from "../contexts/state";
import { useLobby } from "../hooks/use_lobby";

export function Lobby() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  if (!lobbyCode) {
    throw new Error("Lobby code not found");
  }

  const { setIsLoading } = useStateContext();
  const { lobby, isLoading } = useLobby({ lobbyCode });

  useEffect(() => {
    setIsLoading("lobby", isLoading);
  }, [isLoading]);

  if (!lobby) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
          Royal Rumble 2014
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ width: "100%" }}
          size="large"
        >
          SELECT YEAR
        </Button>
      </Box>
      <Divider />
      <Box sx={{ my: 3 }}>
        {(lobby.user_in_lobbies ?? []).map((userInLobby) => (
          <Box key={userInLobby.user?.id}>
            <Typography variant="h6">{userInLobby.user?.name}</Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}

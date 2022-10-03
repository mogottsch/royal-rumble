import { Button, CircularProgress, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/state";
import { useUserContext } from "../contexts/user";
import { useLobby, USER_NAME_LOCAL_STORAGE_KEY } from "../hooks/use_lobby";

export function Lobby() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  if (!lobbyCode) {
    throw new Error("Lobby code not found");
  }

  const { setIsLoading } = useStateContext();
  const { lobby, isLoading } = useLobby({ lobbyCode });
  const { user, isLoading: isLoadingUser } = useUserContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !user &&
      !isLoadingUser &&
      !localStorage.getItem(USER_NAME_LOCAL_STORAGE_KEY)
    ) {
      navigate(`/lobbies/${lobbyCode}/join`);
    }
  }, [user, isLoadingUser]);

  useEffect(() => {
    setIsLoading("lobby", isLoading);
    return () => setIsLoading("lobby", false);
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

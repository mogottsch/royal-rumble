import { AppBar, IconButton, LinearProgress, Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { useUserContext } from "../contexts/user";
import { useStateContext } from "../contexts/state";

export function Bar() {
  const { user } = useUserContext();
  const { isAnyLoading } = useStateContext();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {user && user.name}
        </Typography>
        <IconButton size="large" edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
      </Toolbar>
      {isAnyLoading && <LinearProgress />}
    </AppBar>
  );
}

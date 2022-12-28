import { AppBar, IconButton, LinearProgress, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLoadingAndErrorStateContext } from "../contexts/loading_and_error_states";

export function Bar() {
  const { isAnyLoading } = useLoadingAndErrorStateContext();
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
      </Toolbar>
      {isAnyLoading && <LinearProgress />}
    </AppBar>
  );
}

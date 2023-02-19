import {
  AppBar,
  IconButton,
  LinearProgress,
  Modal,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShareIcon from "@mui/icons-material/Share";
import { useLoadingAndErrorStateContext } from "../contexts/loading_and_error_states";
import { Box } from "@mui/system";
import { useState } from "react";
import QRCode from "react-qr-code";
import { CopyToClipboardButton } from "./buttons";
import { useLobbyContext } from "../contexts/lobby_context";

export function Bar() {
  const { isAnyLoading } = useLoadingAndErrorStateContext();
  const { lobby } = useLobbyContext();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/lobbies/${lobby?.code}`;
  const lobbyExists = lobby !== undefined;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start">
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {lobbyExists && (
            <IconButton size="large" edge="end">
              <ShareIcon onClick={handleOpen} />
            </IconButton>
          )}
        </Toolbar>
        {isAnyLoading ? <LinearProgress /> : <Box sx={{ height: "4px" }} />}
      </AppBar>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <div style={{ background: "white", padding: "16px" }}>
            <QRCode value={document.location.href} />
          </div>
          <CopyToClipboardButton text={shareLink} />
        </Box>
      </Modal>
    </>
  );
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column" as "column",
  alignItems: "center" as "center",
};

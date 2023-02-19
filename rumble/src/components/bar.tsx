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
import { History } from "./history";

export function Bar() {
  const { isAnyLoading } = useLoadingAndErrorStateContext();
  const { lobby } = useLobbyContext();
  const [openShare, setOpenShare] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const handleOpenShare = () => setOpenShare(true);
  const handleCloseShare = () => setOpenShare(false);
  const handleOpenHistory = () => setOpenHistory(true);
  const handleCloseHistory = () => setOpenHistory(false);

  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/lobbies/${lobby?.code}`;
  const lobbyExists = lobby !== undefined;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {lobbyExists && (
            <IconButton size="large" edge="start" onClick={handleOpenHistory}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {lobbyExists && (
            <IconButton size="large" edge="end" onClick={handleOpenShare}>
              <ShareIcon />
            </IconButton>
          )}
        </Toolbar>
        {isAnyLoading ? <LinearProgress /> : <Box sx={{ height: "4px" }} />}
      </AppBar>

      <Modal open={openHistory} onClose={handleCloseHistory}>
        <Box sx={historyModalStyle} onClick={handleCloseHistory}>
          <History lobby={lobby} />
        </Box>
      </Modal>
      <Modal open={openShare} onClose={handleCloseShare}>
        <Box sx={shareModalStyle}>
          <Box sx={{ background: "white", p: 3, mb: 2 }}>
            <QRCode value={document.location.href} />
          </Box>
          <CopyToClipboardButton text={shareLink} />
        </Box>
      </Modal>
    </>
  );
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column" as "column",
  alignItems: "center" as "center",
};
const shareModalStyle = {
  ...modalStyle,
  p: 4,
};

const historyModalStyle = {
  ...modalStyle,
  p: 2,
  height: "90vh",
  width: "90vw",
};

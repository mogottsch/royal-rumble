import {
  AppBar,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Toolbar,
  Typography,
  Button,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LanguageIcon from "@mui/icons-material/Language";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import { useLoadingAndErrorStateContext } from "../contexts/loading_and_error_states";
import { Box } from "@mui/system";
import { useState } from "react";
import QRCode from "react-qr-code";
import { fetchApi } from "../api/fetcher";
import { CopyToClipboardButton } from "./buttons";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { useNotificationContext } from "../contexts/notification_context";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import logo from "../assets/logo_small.png";
import { LanguageSwitcher } from "./language_switcher";
import { useI18n } from "../i18n";
import { ActivityPanel } from "./activity_panel";
import {
  getLobbySettings,
  LobbySettings,
  LobbySettingsForm,
} from "./lobby_settings_form";

export function Bar() {
  const { isAnyLoading } = useLoadingAndErrorStateContext();
  const { lobby, lobbyQuery } = useLobbyContext();
  const { claimedParticipantId, clear } = useParticipantClaim();
  const { notify } = useNotificationContext();
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { t } = useI18n();
  const claimedParticipant = lobby?.participants.find(
    (p) => p.id === claimedParticipantId,
  );
  const [openShare, setOpenShare] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useState<LobbySettings | null>(
    lobby ? getLobbySettings(lobby) : null,
  );

  const handleOpenShare = () => setOpenShare(true);
  const handleCloseShare = () => setOpenShare(false);
  const handleOpenHistory = () => setOpenHistory(true);
  const handleCloseHistory = () => setOpenHistory(false);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);

  const handleOpenSettings = () => {
    if (!lobby) return;
    setSettings(getLobbySettings(lobby));
    setOpenSettings(true);
  };

  const handleSaveSettings = async () => {
    if (!lobby || !settings) return;
    setKeyLoading("updateLobbySettings", true);
    try {
      const response = await fetchApi(`/lobbies/${lobby.code}/settings`, {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? t("lobbySettings.saveFailed"));
      }
      await lobbyQuery?.refetch();
      setOpenSettings(false);
      notify(t("lobbySettings.saved"), "success");
    } catch (error) {
      notify((error as Error).message, "error");
    } finally {
      setKeyLoading("updateLobbySettings", false);
    }
  };

  const theme = useTheme();

  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/lobbies/${lobby?.code}`;
  const lobbyExists = lobby !== undefined;
  const playingAsPrefix = t("bar.playingAs", { name: "__name__" }).split("__name__")[0];
  const playingAsSuffix = t("bar.playingAs", { name: "__name__" }).split("__name__")[1] ?? "";

  return (
    <>
      <AppBar
        position="static"
        sx={{ background: theme.palette.background.default, boxShadow: 0 }}
      >
        <Toolbar>
          {lobbyExists && (
            <IconButton size="large" edge="start" onClick={handleOpenHistory}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Box
              component="img"
              sx={{
                height: "10vh",
              }}
              src={logo}
            />
          </Box>
          {lobbyExists && (
            <IconButton size="large" edge="end" onClick={handleOpenMenu} aria-label={t("bar.more")}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Toolbar>
        {claimedParticipant && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              px: 2,
              pb: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {playingAsPrefix}
              <strong>{claimedParticipant.name}</strong>
              {playingAsSuffix}
            </Typography>
          </Box>
        )}
        {isAnyLoading ? <LinearProgress /> : <Box sx={{ height: "4px" }} />}
      </AppBar>

      <ActivityPanel open={openHistory} onClose={handleCloseHistory} lobby={lobby} />
      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleOpenShare();
          }}
        >
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("bar.share")}</ListItemText>
        </MenuItem>
        <MenuItem disableRipple>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, width: "100%" }}>
            <ListItemText>{t("common.language")}</ListItemText>
            <LanguageSwitcher />
          </Box>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleOpenSettings();
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("lobbySettings.menu")}</ListItemText>
        </MenuItem>
        {claimedParticipant && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              clear();
            }}
          >
            <ListItemIcon>
              <SwapHorizIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("common.changePlayer")}</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <Modal open={openShare} onClose={handleCloseShare}>
        <Box sx={shareModalStyle}>
          <Box sx={{ background: "white", p: 3, mb: 2 }}>
            <QRCode value={document.location.href} />
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <Typography>{shareLink}</Typography>
            <CopyToClipboardButton text={shareLink} />
          </Box>
          <Box sx={{ fontSize: "2rem", fontWeight: "bold", mt: 2, mb: 2 }}>
            {lobby?.code}
          </Box>
        </Box>
      </Modal>
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} fullWidth>
        <DialogTitle>{t("lobbySettings.menu")}</DialogTitle>
        <DialogContent>
          {settings && <LobbySettingsForm value={settings} onChange={setSettings} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSaveSettings}>{t("common.save")}</Button>
        </DialogActions>
      </Dialog>
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

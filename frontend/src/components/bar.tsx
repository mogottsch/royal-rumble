import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Select,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LanguageIcon from "@mui/icons-material/Language";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import BugReportIcon from "@mui/icons-material/BugReport";
import { Box } from "@mui/system";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { fetchApi } from "../api/fetcher";
import logo from "../assets/logo_small.png";
import { CopyToClipboardButton } from "./buttons";
import { ActivityPanel } from "./activity_panel";
import { LanguageSwitcher } from "./language_switcher";
import { useLoadingAndErrorStateContext } from "../contexts/loading_and_error_states";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { useNotificationContext } from "../contexts/notification_context";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import { useI18n } from "../i18n";
import {
  getLobbySettings,
  LobbySettings,
  LobbySettingsForm,
} from "./lobby_settings_form";

const adminCards: Record<string, { key: string; label: string; description: string }[]> = {
  safe: [
    { key: "safe_give_sips", label: "Pocket Pour", description: "Give out 3 sips." },
    { key: "safe_give_shot", label: "Loaded Thumb", description: "Give out 1 shot." },
    { key: "safe_you_and_random_sip", label: "Friendly Fire", description: "You and one random player drink 2 sips." },
    { key: "safe_house_edge", label: "House Edge", description: "Give out 4 sips, but at least 1 must go to yourself." },
  ],
  group: [
    { key: "group_everyone_sip", label: "Roll Call", description: "Everyone drinks 2 sips." },
    { key: "group_everyone_else_sip", label: "Center Stage", description: "Everyone except you drinks 2 sips." },
    { key: "group_cheap_seats", label: "Cheap Seats", description: "Everyone without an active wrestler drinks 2 sips." },
    { key: "group_main_event", label: "Main Event", description: "Everyone drinks 1 shot." },
  ],
  chaos: [
    { key: "chaos_give_sips", label: "Rainmaker", description: "Give out 8 sips." },
    { key: "chaos_give_shots", label: "Powder Keg", description: "Give out 3 shots." },
    { key: "chaos_everyone_sip", label: "Shockwave", description: "Everyone drinks 2 sips." },
    { key: "chaos_everyone_else_shot", label: "Mutiny", description: "Everyone except you drinks 1 shot." },
    { key: "chaos_you_drink_shots", label: "Self Destruct", description: "You drink 2 shots." },
    { key: "chaos_blackout_tax", label: "Blackout Tax", description: "You drink 1 shot and everyone else drinks 1 sip." },
    { key: "chaos_skull_crusher", label: "Skull Crusher", description: "One random other player chugs." },
    { key: "chaos_last_call", label: "Last Call", description: "Everyone chugs." },
    { key: "chaos_russian_roulette", label: "Russian Roulette", description: "Pick one player. Either they or you will chug." },
  ],
};

export function Bar() {
  const { isAnyLoading } = useLoadingAndErrorStateContext();
  const { lobby, lobbyQuery } = useLobbyContext();
  const { claimedParticipantId, clear } = useParticipantClaim();
  const { notify } = useNotificationContext();
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { t } = useI18n();
  const navigate = useNavigate();
  const theme = useTheme();
  const claimedParticipant = lobby?.participants.find((p) => p.id === claimedParticipantId);
  const isAdminTester = claimedParticipant?.name === "MoritzA";

  const [openShare, setOpenShare] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openAdminChest, setOpenAdminChest] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useState<LobbySettings | null>(
    lobby ? getLobbySettings(lobby) : null,
  );
  const [adminParticipantId, setAdminParticipantId] = useState<number | "">("");
  const [adminChestType, setAdminChestType] = useState<"safe" | "group" | "chaos">("safe");
  const [adminCardKey, setAdminCardKey] = useState("");

  const visibleAdminCards = adminCards[adminChestType] ?? [];
  const selectedAdminCard = visibleAdminCards.find((card) => card.key === adminCardKey);
  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/lobbies/${lobby?.code}`;
  const lobbyExists = lobby !== undefined;
  const playingAsPrefix = t("bar.playingAs", { name: "__name__" }).split("__name__")[0];
  const playingAsSuffix = t("bar.playingAs", { name: "__name__" }).split("__name__")[1] ?? "";

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

  const handleOpenAdminChest = () => {
    if (!lobby) return;
    setAdminParticipantId(claimedParticipantId ?? lobby.participants[0]?.id ?? "");
    setAdminChestType("safe");
    setAdminCardKey(adminCards.safe[0]?.key ?? "");
    setOpenAdminChest(true);
  };

  const handleTriggerAdminChest = async () => {
    if (!lobby || !claimedParticipantId || !adminParticipantId || !adminCardKey) {
      return;
    }

    setKeyLoading("triggerAdminChest", true);
    try {
      const response = await fetchApi(`/lobbies/${lobby.code}/admin/chest-rewards/trigger`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "X-Participant-Id": String(claimedParticipantId),
        },
        body: JSON.stringify({
          participant_id: adminParticipantId,
          chest_type: adminChestType,
          card_key: adminCardKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Failed to trigger card");
      }

      const data = await response.json();

      await lobbyQuery?.refetch();
      setOpenAdminChest(false);
      notify("Admin card triggered", "success");
      navigate(
        `/lobbies/${lobby.code}/distribute?adminChestRewardId=${data.data.chest_reward_id}&adminParticipantId=${adminParticipantId}`,
      );
    } catch (error) {
      notify((error as Error).message, "error");
    } finally {
      setKeyLoading("triggerAdminChest", false);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ background: theme.palette.background.default, boxShadow: 0 }}>
        <Toolbar>
          {lobbyExists && (
            <IconButton size="large" edge="start" onClick={() => setOpenHistory(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Box component="img" sx={{ height: "10vh" }} src={logo} />
          </Box>
          {lobbyExists && (
            <IconButton
              size="large"
              edge="end"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label={t("bar.more")}
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Toolbar>
        {claimedParticipant && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", px: 2, pb: 0.5 }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {playingAsPrefix}
              <strong>{claimedParticipant.name}</strong>
              {playingAsSuffix}
            </Typography>
          </Box>
        )}
        {isAnyLoading ? <LinearProgress /> : <Box sx={{ height: "4px" }} />}
      </AppBar>

      <ActivityPanel open={openHistory} onClose={() => setOpenHistory(false)} lobby={lobby} />

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setOpenShare(true);
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
        {isAdminTester && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              handleOpenAdminChest();
            }}
          >
            <ListItemIcon>
              <BugReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Trigger chest card</ListItemText>
          </MenuItem>
        )}
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

      <Modal open={openShare} onClose={() => setOpenShare(false)}>
        <Box sx={shareModalStyle}>
          <Box sx={{ background: "white", p: 3, mb: 2 }}>
            <QRCode value={document.location.href} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Typography>{shareLink}</Typography>
            <CopyToClipboardButton text={shareLink} />
          </Box>
          <Box sx={{ fontSize: "2rem", fontWeight: "bold", mt: 2, mb: 2 }}>{lobby?.code}</Box>
        </Box>
      </Modal>

      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} fullWidth>
        <DialogTitle>{t("lobbySettings.menu")}</DialogTitle>
        <DialogContent>{settings && <LobbySettingsForm value={settings} onChange={setSettings} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSaveSettings}>{t("common.save")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAdminChest} onClose={() => setOpenAdminChest(false)} fullWidth>
        <DialogTitle>Trigger chest card</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Player</InputLabel>
            <Select
              label="Player"
              value={adminParticipantId}
              onChange={(event) => setAdminParticipantId(Number(event.target.value))}
            >
              {lobby?.participants.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Chest</InputLabel>
            <Select
              label="Chest"
              value={adminChestType}
              onChange={(event) => {
                const nextType = event.target.value as "safe" | "group" | "chaos";
                setAdminChestType(nextType);
                setAdminCardKey(adminCards[nextType][0]?.key ?? "");
              }}
            >
              <MenuItem value="safe">Safe</MenuItem>
              <MenuItem value="group">Group Event</MenuItem>
              <MenuItem value="chaos">Chaos</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Card</InputLabel>
            <Select label="Card" value={adminCardKey} onChange={(event) => setAdminCardKey(String(event.target.value))}>
              {visibleAdminCards.map((card) => (
                <MenuItem key={card.key} value={card.key}>
                  {card.label}: {card.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedAdminCard && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              <strong>{selectedAdminCard.label}</strong>
              {": "}
              {selectedAdminCard.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdminChest(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleTriggerAdminChest}>Trigger</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center" as const,
};

const shareModalStyle = {
  ...modalStyle,
  p: 4,
};

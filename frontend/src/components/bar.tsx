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
import DashboardIcon from "@mui/icons-material/Dashboard";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { Box } from "@mui/system";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qrCodeModule from "react-qr-code";
import { fetchApi } from "../api/fetcher";
import logo from "../assets/logo_small.png";
import { getCardRuleText } from "../chest_cards";
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

type QRCodeImportShape = typeof qrCodeModule & {
  default?: typeof qrCodeModule;
  QRCode?: typeof qrCodeModule;
};

const QRCodeComponent =
  (qrCodeModule as QRCodeImportShape).default ??
  (qrCodeModule as QRCodeImportShape).QRCode ??
  qrCodeModule;

const adminCards: Record<string, { key: string; label: string }[]> = {
  safe: [
    { key: "safe_give_sips", label: "Pocket Pour" },
    { key: "safe_give_shot", label: "Loaded Thumb" },
    { key: "safe_you_and_random_sip", label: "Friendly Fire" },
    { key: "safe_house_edge", label: "House Edge" },
    { key: "safe_current_body_count", label: "Body Count" },
    { key: "safe_stable_hands", label: "Stable Hands" },
    { key: "safe_burned_slots", label: "Burned Slots" },
    { key: "safe_blank_check", label: "Blank Check" },
    { key: "safe_sweet_deal", label: "Sweet Deal" },
    { key: "safe_marked_bullet", label: "Marked Bullet" },
  ],
  group: [
    { key: "group_everyone_sip", label: "Roll Call" },
    { key: "group_everyone_else_sip", label: "Center Stage" },
    { key: "group_cheap_seats", label: "Cheap Seats" },
    { key: "group_main_event", label: "Main Event" },
    { key: "group_double_undrunk_sips", label: "Encore" },
    { key: "group_double_undrunk_shots", label: "Double Tap" },
    { key: "group_double_or_nothing", label: "Double or Nothing" },
    { key: "group_body_count", label: "Tally Sheet" },
    { key: "group_stable_hands", label: "Deep Bench" },
    { key: "group_burned_slots", label: "Burn Rate" },
    { key: "group_old_hands", label: "Old Hands" },
    { key: "group_edge_number", label: "Edge Number" },
    { key: "group_no_rumble_resume", label: "No Resume" },
    { key: "group_house_round", label: "House Round" },
    { key: "group_slot_machine", label: "Slot Machine" },
  ],
  chaos: [
    { key: "chaos_give_sips", label: "Rainmaker" },
    { key: "chaos_give_shots", label: "Powder Keg" },
    { key: "chaos_everyone_sip", label: "Shockwave" },
    { key: "chaos_everyone_else_shot", label: "Mutiny" },
    { key: "chaos_you_drink_shots", label: "Self Destruct" },
    { key: "chaos_blackout_tax", label: "Blackout Tax" },
    { key: "chaos_skull_crusher", label: "Skull Crusher" },
    { key: "chaos_last_call", label: "Last Call" },
    { key: "chaos_russian_roulette", label: "Russian Roulette" },
    { key: "chaos_blood_price", label: "Blood Price" },
    { key: "chaos_open_tab", label: "Open Tab" },
    { key: "chaos_legends_due", label: "Legends Due" },
    { key: "chaos_veteran_floor", label: "Veteran Floor" },
    { key: "chaos_edge_number_tax", label: "Edge Number Tax" },
    { key: "chaos_high_treason", label: "High Treason" },
    { key: "chaos_kates_worst_nightmare", label: "Kate's Worst Nightmare" },
    { key: "chaos_loaded_dice", label: "Loaded Dice" },
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
  const location = useLocation();
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
  const chestMultiplier = lobby?.drink_config.chest_aggression_multiplier ?? 1;
  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/lobbies/${lobby?.code}`;
  const dashboardLink = `${baseUrl}/lobbies/${lobby?.code}/dashboard`;
  const lobbyExists = lobby !== undefined;
  const isDashboard = location.pathname.endsWith("/dashboard");
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
        <Toolbar
          variant={isDashboard ? "dense" : undefined}
          sx={{
            minHeight: isDashboard ? "56px" : undefined,
            px: isDashboard ? 1 : 2,
          }}
        >
          {lobbyExists && (
            <IconButton size={isDashboard ? "medium" : "large"} edge="start" onClick={() => setOpenHistory(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Box component="img" sx={{ height: isDashboard ? 34 : "10vh" }} src={logo} />
          </Box>
          {lobbyExists && (
            <IconButton
              size={isDashboard ? "medium" : "large"}
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
            navigate(isDashboard ? `/lobbies/${lobby?.code}/view-game` : `/lobbies/${lobby?.code}/dashboard`);
          }}
        >
          <ListItemIcon>
            {isDashboard ? <SportsEsportsIcon fontSize="small" /> : <DashboardIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isDashboard ? t("bar.playerView") : t("bar.dashboard")}</ListItemText>
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
            <QRCodeComponent value={shareLink} />
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.75, mb: 0.5, alignSelf: "flex-start" }}>
            {t("bar.sharePlayerLink")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", gap: 1 }}>
            <Typography sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{shareLink}</Typography>
            <CopyToClipboardButton text={shareLink} />
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.75, mt: 1.5, mb: 0.5, alignSelf: "flex-start" }}>
            {t("bar.shareDashboardLink")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", gap: 1 }}>
            <Typography sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{dashboardLink}</Typography>
            <CopyToClipboardButton text={dashboardLink} />
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
                <MenuItem
                  key={card.key}
                  value={card.key}
                  sx={{
                    alignItems: "start",
                    whiteSpace: "normal",
                  }}
                >
                  <Box sx={{ minWidth: 0, py: 0.25 }}>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                      {card.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.25,
                        opacity: 0.8,
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        lineHeight: 1.35,
                      }}
                    >
                      {getAdminCardDescription(t, card.key, chestMultiplier)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedAdminCard && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              <strong>{selectedAdminCard.label}</strong>
              {": "}
              {getAdminCardDescription(t, selectedAdminCard.key, chestMultiplier)}
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

function getAdminCardDescription(
  t: (key: string, params?: Record<string, string | number>) => string,
  cardKey: string,
  multiplier: number,
) {
  const scaled = getAdminScaledCard(cardKey, multiplier);

  return getCardRuleText(t, {
    card_key: cardKey,
    card_mode: scaled.card_mode,
    pending_schluecke: scaled.pending_schluecke,
    pending_shots: scaled.pending_shots,
    choice_options: null,
    selected_choice_key: null,
  });
}

function getAdminScaledCard(cardKey: string, multiplier: number) {
  const baseAmounts: Record<string, { card_mode: "auto" | "give_out" | "target_pick" | "effect_choice"; sips: number; shots: number }> = {
    safe_give_sips: { card_mode: "give_out", sips: 3, shots: 0 },
    safe_give_shot: { card_mode: "give_out", sips: 0, shots: 1 },
    safe_you_and_random_sip: { card_mode: "auto", sips: 2, shots: 0 },
    safe_house_edge: { card_mode: "give_out", sips: 4, shots: 0 },
    safe_sweet_deal: { card_mode: "effect_choice", sips: 0, shots: 0 },
    safe_marked_bullet: { card_mode: "effect_choice", sips: 0, shots: 0 },
    safe_current_body_count: { card_mode: "give_out", sips: 0, shots: 0 },
    safe_stable_hands: { card_mode: "give_out", sips: 0, shots: 0 },
    safe_burned_slots: { card_mode: "give_out", sips: 0, shots: 0 },
    safe_blank_check: { card_mode: "give_out", sips: 0, shots: 0 },
    group_everyone_sip: { card_mode: "auto", sips: 2, shots: 0 },
    group_everyone_else_sip: { card_mode: "auto", sips: 2, shots: 0 },
    group_cheap_seats: { card_mode: "auto", sips: 2, shots: 0 },
    group_main_event: { card_mode: "auto", sips: 0, shots: 1 },
    group_double_undrunk_sips: { card_mode: "auto", sips: 0, shots: 0 },
    group_double_undrunk_shots: { card_mode: "auto", sips: 0, shots: 0 },
    group_double_or_nothing: { card_mode: "effect_choice", sips: 0, shots: 0 },
    group_house_round: { card_mode: "effect_choice", sips: 0, shots: 0 },
    group_slot_machine: { card_mode: "auto", sips: 0, shots: 0 },
    group_body_count: { card_mode: "auto", sips: 0, shots: 0 },
    group_stable_hands: { card_mode: "auto", sips: 0, shots: 0 },
    group_burned_slots: { card_mode: "auto", sips: 0, shots: 0 },
    group_old_hands: { card_mode: "auto", sips: 4, shots: 0 },
    group_edge_number: { card_mode: "auto", sips: 5, shots: 0 },
    group_no_rumble_resume: { card_mode: "auto", sips: 3, shots: 0 },
    chaos_give_sips: { card_mode: "give_out", sips: 8, shots: 0 },
    chaos_give_shots: { card_mode: "give_out", sips: 0, shots: 3 },
    chaos_everyone_sip: { card_mode: "auto", sips: 2, shots: 0 },
    chaos_everyone_else_shot: { card_mode: "auto", sips: 0, shots: 1 },
    chaos_you_drink_shots: { card_mode: "auto", sips: 0, shots: 2 },
    chaos_blackout_tax: { card_mode: "auto", sips: 1, shots: 1 },
    chaos_skull_crusher: { card_mode: "auto", sips: 0, shots: 0 },
    chaos_last_call: { card_mode: "auto", sips: 0, shots: 0 },
    chaos_russian_roulette: { card_mode: "target_pick", sips: 0, shots: 0 },
    chaos_blood_price: { card_mode: "auto", sips: 0, shots: 0 },
    chaos_open_tab: { card_mode: "give_out", sips: 0, shots: 0 },
    chaos_legends_due: { card_mode: "auto", sips: 0, shots: 1 },
    chaos_veteran_floor: { card_mode: "auto", sips: 0, shots: 1 },
    chaos_edge_number_tax: { card_mode: "auto", sips: 0, shots: 1 },
    chaos_high_treason: { card_mode: "effect_choice", sips: 0, shots: 0 },
    chaos_kates_worst_nightmare: { card_mode: "effect_choice", sips: 0, shots: 0 },
    chaos_loaded_dice: { card_mode: "effect_choice", sips: 0, shots: 0 },
  };

  const base = baseAmounts[cardKey] ?? { card_mode: "auto" as const, sips: 0, shots: 0 };

  return {
    card_mode: base.card_mode,
    pending_schluecke: scaleChestAmount(base.sips, multiplier),
    pending_shots: scaleChestAmount(base.shots, multiplier),
  };
}

function scaleChestAmount(amount: number, multiplier: number) {
  if (amount === 0) {
    return 0;
  }

  return Math.max(1, Math.round(amount * multiplier));
}

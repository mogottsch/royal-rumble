import type { ReactNode } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";
import LoginIcon from "@mui/icons-material/Login";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import { Box, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useMemo } from "react";
import { HistoryContent } from "../components/history";
import { useLobbyContext } from "../contexts/lobby_context";
import { Lobby, Participant } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

type ParticipantDashboardRow = {
  participant: Participant;
  remainingSips: number;
  remainingShots: number;
  remainingChugs: number;
  drunkSips: number;
  drunkShots: number;
  drunkChugs: number;
  drinkScore: number;
};

export function ViewGameDashboard() {
  const { lobby } = useLobbyContext();
  const { t } = useI18n();

  const participantRows = useMemo(() => (lobby ? buildParticipantRows(lobby) : []), [lobby]);
  const leaderboard = [...participantRows].sort(compareLeaderboardRows);
  const entrancesLeft = lobby ? getEntrancesLeft(lobby) : 0;

  if (!lobby) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 340px" },
        gap: 1,
        minHeight: 0,
        py: 0.5,
        px: { xs: 0, lg: 1 },
      }}
    >
      <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0 }}>
        <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
          <CardContent sx={{ p: 0.9, '&:last-child': { pb: 0.9 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.9 }}>
              <LoginIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t("dashboard.entrancesLeft")}
              </Typography>
              <Chip
                size="small"
                label={entrancesLeft}
                color="secondary"
                sx={{ height: 22, '& .MuiChip-label': { px: 0.8, fontWeight: 700 } }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))",
                },
                gap: 0.75,
              }}
            >
              {participantRows.map((row) => (
                <ParticipantDashboardCard key={row.participant.id} row={row} />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Stack spacing={1} sx={{ minWidth: 0, position: { xl: "sticky" }, top: { xl: 8 }, alignSelf: { xl: "start" } }}>
        <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.75 }}>
              <EmojiEventsIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t("dashboard.leaderboard")}
              </Typography>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 0.5, pl: 0 }}>{t("dashboard.table.player")}</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5 }}>S</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5 }}>Sh</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5 }}>C</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, pr: 0 }}>{t("dashboard.table.score")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((row, index) => (
                  <TableRow key={row.participant.id}>
                    <TableCell sx={{ py: 0.45, pl: 0 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
                        <Chip
                          size="small"
                          label={index + 1}
                          color={index === 0 ? "secondary" : "default"}
                          sx={{ height: 18, '& .MuiChip-label': { px: 0.45, fontSize: "0.62rem", fontWeight: 700 } }}
                        />
                        <Typography sx={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.participant.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.45, px: 0.5 }}>{row.drunkSips}</TableCell>
                    <TableCell align="right" sx={{ py: 0.45, px: 0.5 }}>{row.drunkShots}</TableCell>
                    <TableCell align="right" sx={{ py: 0.45, px: 0.5 }}>{row.drunkChugs}</TableCell>
                    <TableCell align="right" sx={{ py: 0.45, pr: 0, fontWeight: 700 }}>{row.drinkScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
          <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 } }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.6 }}>
              <HistoryIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t("dashboard.log")}
              </Typography>
            </Stack>
            <Box sx={{ maxHeight: { xs: 320, xl: 420 }, overflow: "auto" }}>
              <HistoryContent lobby={lobby} compact />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

function ParticipantDashboardCard({ row }: { row: ParticipantDashboardRow }) {
  const { t } = useI18n();

  return (
    <Box sx={{ borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.12)", p: 0.7, background: "rgba(255,255,255,0.02)" }}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.participant.name}
        </Typography>
        <Chip
          size="small"
          label={row.drinkScore}
          color="secondary"
          sx={{ height: 18, '& .MuiChip-label': { px: 0.45, fontSize: "0.62rem", fontWeight: 700 } }}
        />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 0.45 }}>
        <CompactDrinkStat icon={<LocalBarIcon sx={{ fontSize: 13 }} />} label={t("dashboard.table.sips")} value={row.remainingSips} />
        <CompactDrinkStat icon={<LocalBarIcon sx={{ fontSize: 13 }} />} label={t("dashboard.table.shots")} value={row.remainingShots} />
        <CompactDrinkStat icon={<LocalBarIcon sx={{ fontSize: 13 }} />} label={t("dashboard.table.chugs")} value={row.remainingChugs} />
      </Box>
    </Box>
  );
}

function CompactDrinkStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Box sx={{ borderRadius: 1, border: "1px solid rgba(255,255,255,0.08)", px: 0.45, py: 0.4, background: "rgba(0,0,0,0.16)" }}>
      <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
        {icon}
        <Typography sx={{ fontSize: "0.52rem", lineHeight: 1 }}>{label}</Typography>
      </Stack>
      <Typography sx={{ mt: 0.18, textAlign: "center", fontSize: "0.82rem", fontWeight: 700, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

function buildParticipantRows(lobby: Lobby): ParticipantDashboardRow[] {
  const dueMap = new Map<number, { sips: number; shots: number; chugs: number }>();

  for (const participant of lobby.participants) {
    dueMap.set(participant.id, { sips: 0, shots: 0, chugs: 0 });
  }

  for (const distribution of lobby.drink_distributions) {
    const entry = dueMap.get(distribution.receiver_participant_id);
    if (!entry) {
      continue;
    }
    entry.sips += distribution.schluecke;
    entry.shots += distribution.shots;
  }

  for (const chug of lobby.chugs) {
    const entry = dueMap.get(chug.participant_id);
    if (!entry) {
      continue;
    }
    entry.chugs += 1;
  }

  return lobby.participants.map((participant) => {
    const due = dueMap.get(participant.id) ?? { sips: 0, shots: 0, chugs: 0 };
    const drunkSips = Math.min(due.sips, participant.drunk_sips ?? 0);
    const drunkShots = Math.min(due.shots, participant.drunk_shots ?? 0);
    const drunkChugs = Math.min(due.chugs, participant.drunk_chugs ?? 0);

    return {
      participant,
      remainingSips: Math.max(0, due.sips - drunkSips),
      remainingShots: Math.max(0, due.shots - drunkShots),
      remainingChugs: Math.max(0, due.chugs - drunkChugs),
      drunkSips,
      drunkShots,
      drunkChugs,
      drinkScore: drunkSips + drunkShots * 3 + drunkChugs * 10,
    };
  });
}

function compareLeaderboardRows(left: ParticipantDashboardRow, right: ParticipantDashboardRow) {
  if (right.drinkScore !== left.drinkScore) {
    return right.drinkScore - left.drinkScore;
  }
  if (right.drunkChugs !== left.drunkChugs) {
    return right.drunkChugs - left.drunkChugs;
  }
  if (right.drunkShots !== left.drunkShots) {
    return right.drunkShots - left.drunkShots;
  }
  if (right.drunkSips !== left.drunkSips) {
    return right.drunkSips - left.drunkSips;
  }
  return left.participant.name.localeCompare(right.participant.name);
}

function getEntrancesLeft(lobby: Lobby) {
  if (lobby.nextEntranceNumber === null) {
    return 0;
  }

  return Math.max(0, lobby.settings.rumble_size - lobby.nextEntranceNumber + 1);
}

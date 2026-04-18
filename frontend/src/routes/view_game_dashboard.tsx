import type { ReactNode } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";
import LoginIcon from "@mui/icons-material/Login";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import { Box, Card, CardContent, Chip, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
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
  const totals = useMemo(() => buildDashboardTotals(participantRows), [participantRows]);

  if (!lobby) {
    return null;
  }

  return (
    <Stack spacing={2} sx={{ minHeight: 0, py: 1, px: { xs: 0, md: 1.5 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1,
        }}
      >
        <DashboardSummaryCard
          icon={<LoginIcon fontSize="small" />}
          label={t("dashboard.entrancesLeft")}
          value={entrancesLeft}
        />
        <DashboardSummaryCard
          icon={<LocalBarIcon fontSize="small" />}
          label={t("dashboard.notDrunkSips")}
          value={totals.remainingSips}
        />
        <DashboardSummaryCard
          icon={<LocalBarIcon fontSize="small" />}
          label={t("dashboard.notDrunkShots")}
          value={totals.remainingShots}
        />
        <DashboardSummaryCard
          icon={<SportsKabaddiIcon fontSize="small" />}
          label={t("dashboard.notDrunkChugs")}
          value={totals.remainingChugs}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.45fr) minmax(340px, 0.9fr)" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
          <CardContent sx={{ p: { xs: 1.25, md: 1.5 }, '&:last-child': { pb: { xs: 1.25, md: 1.5 } } }}>
            <Stack spacing={0.5} sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t("dashboard.outstanding")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.72 }}>
                {t("dashboard.outstandingHint")}
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                gap: 1,
              }}
            >
              {participantRows.map((row) => (
                <ParticipantDashboardCard
                  key={row.participant.id}
                  row={row}
                  wrestlerName={getCurrentWrestlerName(lobby, row.participant)}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
            <CardContent sx={{ p: { xs: 1.25, md: 1.5 }, '&:last-child': { pb: { xs: 1.25, md: 1.5 } } }}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <EmojiEventsIcon fontSize="small" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {t("dashboard.leaderboard")}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    borderRadius: 1.5,
                    border: "1px solid rgba(255,255,255,0.12)",
                    px: 1,
                    py: 0.85,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Typography variant="caption" sx={{ display: "block", opacity: 0.72 }}>
                    {t("dashboard.scoreLegend")}
                  </Typography>
                </Box>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ py: 0.75, pl: 0 }}>{t("dashboard.table.player")}</TableCell>
                      <TableCell align="right" sx={{ py: 0.75, px: 0.5 }}>{t("dashboard.table.sips")}</TableCell>
                      <TableCell align="right" sx={{ py: 0.75, px: 0.5 }}>{t("dashboard.table.shots")}</TableCell>
                      <TableCell align="right" sx={{ py: 0.75, px: 0.5 }}>{t("dashboard.table.chugs")}</TableCell>
                      <TableCell align="right" sx={{ py: 0.75, pr: 0 }}>{t("dashboard.table.score")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((row, index) => (
                      <TableRow key={row.participant.id}>
                        <TableCell sx={{ py: 0.7, pl: 0 }}>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
                            <Chip
                              size="small"
                              label={index + 1}
                              color={index === 0 ? "secondary" : "default"}
                              sx={{ height: 22, '& .MuiChip-label': { px: 0.65, fontSize: "0.72rem", fontWeight: 800 } }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {row.participant.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.72rem", opacity: 0.68, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {getCurrentWrestlerName(lobby, row.participant) ?? t("dashboard.noWrestler")}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.7, px: 0.5 }}>{row.drunkSips}</TableCell>
                        <TableCell align="right" sx={{ py: 0.7, px: 0.5 }}>{row.drunkShots}</TableCell>
                        <TableCell align="right" sx={{ py: 0.7, px: 0.5 }}>{row.drunkChugs}</TableCell>
                        <TableCell align="right" sx={{ py: 0.7, pr: 0, fontWeight: 800 }}>{row.drinkScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
        <CardContent sx={{ p: { xs: 1.25, md: 1.5 }, '&:last-child': { pb: { xs: 1.25, md: 1.5 } } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
            <HistoryIcon fontSize="small" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t("dashboard.log")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.72 }}>
                {t("dashboard.logHint")}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ maxHeight: { xs: 420, xl: 560 }, overflow: "auto" }}>
            <HistoryContent lobby={lobby} compact={false} showTitle={false} />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

function DashboardSummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card variant="outlined" sx={{ background: "rgba(255,255,255,0.03)" }}>
      <CardContent sx={{ p: 1.1, '&:last-child': { pb: 1.1 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: "center", minWidth: 0 }}>
            {icon}
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.2 }}>
              {label}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={value}
            color="secondary"
            sx={{ height: 24, '& .MuiChip-label': { px: 0.8, fontWeight: 800 } }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function ParticipantDashboardCard({
  row,
  wrestlerName,
}: {
  row: ParticipantDashboardRow;
  wrestlerName: string | null;
}) {
  const { t } = useI18n();
  const hasOutstanding = row.remainingSips > 0 || row.remainingShots > 0 || row.remainingChugs > 0;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: hasOutstanding
          ? "1px solid rgba(255,255,255,0.18)"
          : "1px solid rgba(255,255,255,0.08)",
        p: 1,
        background: hasOutstanding ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "start", justifyContent: "space-between" }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.96rem", fontWeight: 800, lineHeight: 1.15 }}>
              {row.participant.name}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: "0.78rem", opacity: 0.68, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {wrestlerName ?? t("dashboard.noWrestler")}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${t("dashboard.table.score")}: ${row.drinkScore}`}
            color="secondary"
            sx={{ height: 24, '& .MuiChip-label': { px: 0.8, fontSize: "0.72rem", fontWeight: 800 } }}
          />
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 0.75 }}>
          <CompactDrinkStat icon={<LocalBarIcon sx={{ fontSize: 15 }} />} label={t("dashboard.table.sips")} value={row.remainingSips} />
          <CompactDrinkStat icon={<LocalBarIcon sx={{ fontSize: 15 }} />} label={t("dashboard.table.shots")} value={row.remainingShots} />
          <CompactDrinkStat icon={<SportsKabaddiIcon sx={{ fontSize: 15 }} />} label={t("dashboard.table.chugs")} value={row.remainingChugs} />
        </Box>

      </Stack>
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
        <Typography sx={{ fontSize: "0.58rem", lineHeight: 1.1, textAlign: "center" }}>{label}</Typography>
      </Stack>
      <Typography sx={{ mt: 0.22, textAlign: "center", fontSize: "0.98rem", fontWeight: 800, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

function buildDashboardTotals(rows: ParticipantDashboardRow[]) {
  return rows.reduce(
    (totals, row) => ({
      remainingSips: totals.remainingSips + row.remainingSips,
      remainingShots: totals.remainingShots + row.remainingShots,
      remainingChugs: totals.remainingChugs + row.remainingChugs,
    }),
    { remainingSips: 0, remainingShots: 0, remainingChugs: 0 },
  );
}

function getCurrentWrestlerName(lobby: Lobby, participant: Participant) {
  return (
    lobby.rumblers.find((rumbler) => rumbler.id === participant.rumbler_id)?.wrestler.name ?? null
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

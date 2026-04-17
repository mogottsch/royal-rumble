import {
  Box,
  Drawer,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { Lobby } from "../hooks/use_lobby";
import { History } from "./history";
import { useI18n } from "../i18n";

export function ActivityPanel({
  open,
  onClose,
  lobby,
}: {
  open: boolean;
  onClose: () => void;
  lobby: Lobby | undefined;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState(0);

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 520 }, maxWidth: "100vw", height: "100%", display: "grid", gridTemplateRows: "auto auto 1fr" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 1.5 }}>
          <Typography variant="h6">{t("bar.history")}</Typography>
          <IconButton onClick={onClose} size="small" aria-label={t("common.close")}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 1 }}>
          <Tab label={t("bar.history")} />
          <Tab label={t("bar.drinkStats")} />
        </Tabs>
        <Box sx={{ p: 2, overflow: "auto" }}>
          {tab === 0 ? <History lobby={lobby} /> : <StatsTable lobby={lobby} />}
        </Box>
      </Box>
    </Drawer>
  );
}

function StatsTable({ lobby }: { lobby: Lobby | undefined }) {
  const { t } = useI18n();

  if (!lobby) return null;

  const stats = computeStats(lobby);

  return (
    <Box sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, p: 1.5, background: "rgba(255,255,255,0.03)" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("stats.name")}</TableCell>
            <TableCell align="right">{t("stats.sipsIn")}</TableCell>
            <TableCell align="right">{t("stats.sipsOut")}</TableCell>
            <TableCell align="right">{t("stats.shotsIn")}</TableCell>
            <TableCell align="right">{t("stats.shotsOut")}</TableCell>
            <TableCell align="right">{t("stats.chugs")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map((row) => (
            <TableRow key={row.participantId}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{row.schluecke_received}</TableCell>
              <TableCell align="right">{row.schluecke_given}</TableCell>
              <TableCell align="right">{row.shots_received}</TableCell>
              <TableCell align="right">{row.shots_given}</TableCell>
              <TableCell align="right">{row.chugs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

type Stat = {
  participantId: number;
  name: string;
  schluecke_received: number;
  schluecke_given: number;
  shots_received: number;
  shots_given: number;
  chugs: number;
};

function computeStats(lobby: Lobby): Stat[] {
  const map = new Map<number, Stat>();
  for (const p of lobby.participants) {
    map.set(p.id, {
      participantId: p.id,
      name: p.name,
      schluecke_received: 0,
      schluecke_given: 0,
      shots_received: 0,
      shots_given: 0,
      chugs: 0,
    });
  }

  for (const d of lobby.drink_distributions) {
    const receiver = map.get(d.receiver_participant_id);
    if (receiver) {
      receiver.schluecke_received += d.schluecke;
      receiver.shots_received += d.shots;
    }
    if (d.giver_participant_id !== null) {
      const giver = map.get(d.giver_participant_id);
      if (giver) {
        giver.schluecke_given += d.schluecke;
        giver.shots_given += d.shots;
      }
    }
  }

  for (const c of lobby.chugs) {
    const p = map.get(c.participant_id);
    if (p) p.chugs += 1;
  }

  return Array.from(map.values());
}

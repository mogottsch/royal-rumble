import {
  Box,
  Drawer,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Lobby } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

export function StatsDrawer({
  open,
  onClose,
  lobby,
}: {
  open: boolean;
  onClose: () => void;
  lobby: Lobby;
}) {
  const { t } = useI18n();
  const stats = computeStats(lobby);

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box sx={{ p: 2, maxHeight: "80vh", overflow: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6">{t("stats.title")}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

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
    </Drawer>
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

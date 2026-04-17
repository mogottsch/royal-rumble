import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPendingDrinkPools, getPendingDrinkPoolSignature } from "../drink_pools";
import { useLobbyContext } from "../contexts/lobby_context";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { useI18n } from "../i18n";

export function PendingDistributionPrompt() {
  const { lobby } = useLobbyContext();
  const { claimedParticipantId } = useParticipantClaim();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [dismissedSignature, setDismissedSignature] = useState("");
  const pools = lobby ? getPendingDrinkPools(lobby, claimedParticipantId) : [];
  const signature = getPendingDrinkPoolSignature(pools);
  const isOnDistributePage = location.pathname.includes("/distribute");
  const isOpen =
    !isOnDistributePage &&
    pools.length > 0 &&
    signature !== dismissedSignature;

  useEffect(() => {
    if (pools.length === 0) {
      setDismissedSignature("");
    }
  }, [pools.length]);

  if (!lobby) return null;

  const totalSchluecke = pools.reduce((sum, pool) => sum + pool.schluecke, 0);
  const totalShots = pools.reduce((sum, pool) => sum + pool.shots, 0);

  return (
    <Dialog open={isOpen} onClose={() => setDismissedSignature(signature)}>
      <DialogTitle>{t("pending.title")}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 1 }}>
          {t("pending.body", { count: pools.length })}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {t("pending.pool", { sips: totalSchluecke, shots: totalShots })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDismissedSignature(signature)}>{t("common.later")}</Button>
        <Button variant="contained" onClick={() => navigate(`/lobbies/${lobby.code}/distribute`)}>
          {t("pending.now")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

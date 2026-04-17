import { Box, Button, Stack, Typography } from "@mui/material";
import { Lobby } from "../hooks/use_lobby";
import { useParticipantClaim } from "../contexts/participant_claim_context";
import { useI18n } from "../i18n";

export function ClaimGate({ lobby }: { lobby: Lobby }) {
  const { claim } = useParticipantClaim();
  const { t } = useI18n();

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ mb: 1, textAlign: "center" }}>
        {t("claimGate.title")}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mb: 3, textAlign: "center", opacity: 0.7 }}
      >
        {t("claimGate.body")}
      </Typography>
      <Stack spacing={1.5}>
        {lobby.participants.map((p) => (
          <Button
            key={p.id}
            variant="contained"
            size="large"
            onClick={() => claim(p.id)}
            sx={{ py: 2, fontSize: "1.1rem" }}
          >
            {p.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}

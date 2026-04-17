import LocalBarIcon from "@mui/icons-material/LocalBar";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Button, Grid, Stack, Typography } from "@mui/material";
import { useI18n } from "../i18n";

type DrinkType = "sips" | "shots" | "chugs";

interface TrackerControlProps {
  drinkType: DrinkType;
  remaining: number;
  onDecrement: () => void;
}

const trackerIcons = {
  sips: WaterDropIcon,
  shots: LocalBarIcon,
  chugs: SportsBarIcon,
} satisfies Record<DrinkType, typeof WaterDropIcon>;

function TrackerControl({ drinkType, remaining, onDecrement }: TrackerControlProps) {
  const { t } = useI18n();
  const Icon = trackerIcons[drinkType];
  const isDisabled = remaining === 0;

  return (
    <Button
      variant={isDisabled ? "outlined" : "contained"}
      color={isDisabled ? "inherit" : "primary"}
      size="large"
      onClick={onDecrement}
      disabled={isDisabled}
      sx={{
        width: "100%",
        minHeight: 88,
        borderRadius: 3,
        textTransform: "none",
        alignItems: "stretch",
        px: 1.5,
        py: 1.25,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          <Icon />
          <Stack sx={{ alignItems: "flex-start", minWidth: 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {t(`viewGame.tracker.${drinkType}`)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {isDisabled ? t("viewGame.tracker.noneLeft") : t("viewGame.tracker.tapToDrink")}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {remaining}
        </Typography>
      </Stack>
    </Button>
  );
}

export function PersonalDrinkTracker({
  remaining,
  onDecrement,
}: {
  remaining: Record<DrinkType, number>;
  onDecrement: (drinkType: DrinkType) => void;
}) {
  return (
    <Grid container spacing={1} sx={{ mb: 1.5 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TrackerControl drinkType="sips" remaining={remaining.sips} onDecrement={() => onDecrement("sips")} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TrackerControl drinkType="shots" remaining={remaining.shots} onDecrement={() => onDecrement("shots")} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TrackerControl drinkType="chugs" remaining={remaining.chugs} onDecrement={() => onDecrement("chugs")} />
      </Grid>
    </Grid>
  );
}

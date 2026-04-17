import LocalBarIcon from "@mui/icons-material/LocalBar";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Button, Stack, Typography } from "@mui/material";
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

const trackerSymbols = {
  sips: "S",
  shots: "Sh",
  chugs: "C",
} satisfies Record<DrinkType, string>;

function TrackerControl({ drinkType, remaining, onDecrement }: TrackerControlProps) {
  const { t } = useI18n();
  const Icon = trackerIcons[drinkType];

  return (
    <Button
      variant="contained"
      color="primary"
      size="small"
      onClick={onDecrement}
      aria-label={`${t(`viewGame.tracker.${drinkType}`)}: ${remaining}`}
      sx={{
        minWidth: 0,
        minHeight: 36,
        borderRadius: 999,
        textTransform: "none",
        px: 1,
        py: 0.5,
        flex: { xs: "1 1 0", sm: "0 0 auto" },
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "center", minWidth: 0 }}>
        <Icon sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 900, lineHeight: 1 }}>
          {remaining}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85, lineHeight: 1 }}>
          {trackerSymbols[drinkType]}
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
  const visibleEntries = ([
    ["sips", remaining.sips],
    ["shots", remaining.shots],
    ["chugs", remaining.chugs],
  ] as const).filter(([, value]) => value > 0);

  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        mb: 0.75,
        flexWrap: "nowrap",
        alignItems: "center",
      }}
    >
      {visibleEntries.map(([drinkType, value]) => (
        <TrackerControl
          key={drinkType}
          drinkType={drinkType}
          remaining={value}
          onDecrement={() => onDecrement(drinkType)}
        />
      ))}
    </Stack>
  );
}

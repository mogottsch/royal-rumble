import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box } from "@mui/material";
import { Participant, Rumbler, Wrestler } from "../hooks/use_lobby";
import { useI18n } from "../i18n";

const IMAGE_SIZE = 100;
const IMAGE_SIZE_PX = `${IMAGE_SIZE}px`;
const SEARCH_IMAGE_SIZE = 56;

type WrestlerImageProps = {
  imageUrl?: string;
  alt: string;
  size: number;
};

type WrestlerWithThumbnail = Wrestler & {
  thumbnail_url?: string;
};

function ParticipantName({ name }: { name: string }) {
  return <span>{name}</span>;
}

function WrestlerImage({ imageUrl, alt, size }: WrestlerImageProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        width={size}
        height={size}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      style={{
        height: IMAGE_SIZE_PX,
        fontSize: `${IMAGE_SIZE - 30}px`,
        fontWeight: 400,
      }}
    >
      ?
    </span>
  );
}

function EntranceNumber({ number }: { number?: number }) {
  return (
    <Box
      sx={{
        height: IMAGE_SIZE_PX,
        fontSize: `${IMAGE_SIZE - 60}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span>#{number}</span>
    </Box>
  );
}

function WrestlerName({ name, selected = false }: { name?: string; selected?: boolean }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "30px",
        backgroundColor: selected ? "rgba(11, 46, 26, 0.96)" : "#1a1919",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px",
        fontWeight: 400,
        fontSize: "12px",
        color: "#fff",
        boxShadow: selected
          ? "0 -1px 100px rgba(34, 197, 94, 0.6), 0 -1px 5px rgba(74, 222, 128, 0.8)"
          : "0 -1px 100px #ff0000,0 -1px 5px #ff0000",
        textShadow: selected
          ? `
          0 0 4px rgba(134, 239, 172, 0.9),
          0 0 8px rgba(34, 197, 94, 0.8)
        `
          : `
          0 0 4px #ff0000,
          0 0 8px #ff0000
        `,
      }}
    >
      <span
        style={{
          display: "block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {name ?? <>&nbsp;</>}
      </span>
    </Box>
  );
}

const tileStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  margin: "5px",
  paddingTop: "5px",
  borderRadius: "4px",
  backgroundColor: "rgba(255, 255, 255, 0.07)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  border: "1px solid #7b7b7b",
  fontWeight: 200,
  position: "relative",
  transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background-color 120ms ease",
} as const;

const selectedTileStyles = {
  borderColor: "success.main",
  boxShadow: "0 0 0 2px rgba(74, 222, 128, 0.24), 0 0 18px rgba(34, 197, 94, 0.42)",
  backgroundColor: "rgba(22, 101, 52, 0.22)",
  transform: "translateY(-1px)",
} as const;

function SelectedBadge() {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(22, 101, 52, 0.95)",
        color: "#fff",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.16), 0 4px 12px rgba(0,0,0,0.35)",
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 16 }} />
    </Box>
  );
}

export function WrestlerTile({
  participant,
  rumbler,
  selected = false,
  onClick,
}: {
  participant?: Participant;
  rumbler?: Rumbler;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { t } = useI18n();
  const wrestler = rumbler?.wrestler as WrestlerWithThumbnail | undefined;

  return (
    <Box
      sx={{
        ...tileStyles,
        ...(selected ? selectedTileStyles : {}),
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {selected ? <SelectedBadge /> : null}
      <ParticipantName name={participant?.name ?? t("viewGame.npc")} />
      {wrestler ? (
        <WrestlerImage
          imageUrl={wrestler.thumbnail_url ?? wrestler.image_url}
          alt={t("viewGame.wrestlerAlt")}
          size={IMAGE_SIZE}
        />
      ) : (
        <EntranceNumber number={participant?.entrance_number} />
      )}
      <WrestlerName name={wrestler?.name} selected={selected} />
    </Box>
  );
}

export function WrestlerSearchOption({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string;
}) {
  const { t } = useI18n();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
      {imageUrl ? (
        <WrestlerImage imageUrl={imageUrl} alt={t("viewGame.wrestlerAlt")} size={SEARCH_IMAGE_SIZE} />
      ) : (
        <Box
          sx={{
            width: SEARCH_IMAGE_SIZE,
            height: SEARCH_IMAGE_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        >
          ?
        </Box>
      )}
      <span>{name}</span>
    </Box>
  );
}

export function WrestlerPreviewTile({
  name,
  imageUrl,
  selected = false,
}: {
  name: string;
  imageUrl?: string;
  selected?: boolean;
}) {
  return (
    <Box
      sx={{
        ...tileStyles,
        ...(selected ? selectedTileStyles : {}),
      }}
    >
      {selected ? <SelectedBadge /> : null}
      <WrestlerImage imageUrl={imageUrl} alt={name} size={IMAGE_SIZE} />
      <WrestlerName name={name} selected={selected} />
    </Box>
  );
}

export function WrestlerPickerTile({
  name,
  imageUrl,
  selected = false,
  onClick,
}: {
  name: string;
  imageUrl?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      sx={{
        ...tileStyles,
        ...(selected ? selectedTileStyles : {}),
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {selected ? <SelectedBadge /> : null}
      <WrestlerImage imageUrl={imageUrl} alt={name} size={IMAGE_SIZE} />
      <WrestlerName name={name} selected={selected} />
    </Box>
  );
}

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

function WrestlerName({ name }: { name?: string }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "30px",
        backgroundColor: "#1a1919",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px",
        fontWeight: 400,
        fontSize: "12px",
        color: "#fff",
        boxShadow: "0 -1px 100px #ff0000,0 -1px 5px #ff0000",
        textShadow: `
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
} as const;

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
        cursor: onClick ? "pointer" : "default",
        borderColor: selected ? "primary.main" : tileStyles.border,
        boxShadow: selected ? "0 0 0 2px rgba(255,255,255,0.15), 0 0 18px rgba(255, 60, 90, 0.35)" : undefined,
        backgroundColor: selected ? "rgba(255, 255, 255, 0.12)" : tileStyles.backgroundColor,
      }}
      onClick={onClick}
    >
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
      <WrestlerName name={wrestler?.name} />
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
        borderColor: selected ? "primary.main" : tileStyles.border,
        boxShadow: selected ? "0 0 0 2px rgba(255,255,255,0.15), 0 0 18px rgba(255, 60, 90, 0.35)" : undefined,
        backgroundColor: selected ? "rgba(255, 255, 255, 0.12)" : tileStyles.backgroundColor,
      }}
    >
      <WrestlerImage imageUrl={imageUrl} alt={name} size={IMAGE_SIZE} />
      <WrestlerName name={name} />
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
        cursor: "pointer",
        borderColor: selected ? "primary.main" : tileStyles.border,
        boxShadow: selected ? "0 0 0 2px rgba(255,255,255,0.15), 0 0 18px rgba(255, 60, 90, 0.35)" : undefined,
        backgroundColor: selected ? "rgba(255, 255, 255, 0.12)" : tileStyles.backgroundColor,
      }}
      onClick={onClick}
    >
      <WrestlerImage imageUrl={imageUrl} alt={name} size={IMAGE_SIZE} />
      <WrestlerName name={name} />
    </Box>
  );
}

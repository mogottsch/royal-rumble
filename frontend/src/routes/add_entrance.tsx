import Button from "@mui/material/Button";
import { Box, TextField, Typography } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrestler } from "../hooks/use_lobby";
import { useWrestlers } from "../hooks/use_wrestlers";
import { useNotificationContext } from "../contexts/notification_context";
import { fetchApi } from "../api/fetcher";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useI18n } from "../i18n";
import { WrestlerPickerTile } from "../components/wrestler_tile";

interface WrestlerOptionType extends Wrestler {}

type WrestlerWithThumbnail = Wrestler & {
  thumbnail_url?: string;
};

export function AddEntrance() {
  const navigate = useNavigate();
  const { lobby, lobbyQuery } = useLobbyContext();
  const [selectedWrestler, setSelectedWrestler] =
    useState<WrestlerOptionType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [open, toggleOpen] = useState(false);

  const [dialogValue, setDialogValue] = useState({
    name: "",
  });

  const handleClose = () => {
    setDialogValue({
      name: "",
    });
    toggleOpen(false);
  };

  const { wrestlers: searchedWrestlers, isLoading } = useWrestlers({
    searchTerm: deferredSearchTerm,
  });
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { notify } = useNotificationContext();
  const { t } = useI18n();

  if (!lobby) return <div>{t("addEntrance.loading")}</div>;

  const displayedWrestlers = searchedWrestlers.slice(0, 24);

  const addEntrance = async () => {
    if (selectedWrestler === null) {
      notify(t("addEntrance.selectWrestler"), "error");
      return;
    }

    if (selectedWrestler.id === undefined) {
      throw new Error(t("addEntrance.errorMissingId"));
    }

    setKeyLoading("addEntrance", true);
    try {
      await postEntrance(lobby.code, selectedWrestler.id);
    } catch (e) {
      const error = e as Error;
      notify(error.message, "error");
      return;
    } finally {
      setKeyLoading("addEntrance", false);
    }
    await lobbyQuery?.refetch();
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  const addWrestler = async () => {
    setKeyLoading("addWrestler", true);
    try {
      const wrestler = await postWrestler(dialogValue.name);
      notify(t("addEntrance.addedWrestler", { name: wrestler.name }), "success");
      setSelectedWrestler(wrestler);
    } catch (e) {
      const error = e as Error;
      notify(error.message, "error");
      return;
    } finally {
      setKeyLoading("addWrestler", false);
    }
    handleClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        pt: 1,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pb: 2,
        }}
      >
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            id="wrestler-search"
            label={t("addEntrance.label")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button
            variant="outlined"
            onClick={() => {
              toggleOpen(true);
              setDialogValue({ name: searchTerm });
            }}
            disabled={searchTerm.trim() === ""}
          >
            {t("addEntrance.createOption", { name: searchTerm || "..." })}
          </Button>
          {deferredSearchTerm.trim().length >= 2 && searchedWrestlers.length === 0 && !isLoading ? (
            <Typography sx={{ opacity: 0.7 }}>{t("addEntrance.noResults")}</Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 1,
                alignContent: "start",
              }}
            >
              {displayedWrestlers.map((wrestler) => {
                const wrestlerWithThumbnail = wrestler as WrestlerWithThumbnail;

                return (
                  <WrestlerPickerTile
                    key={wrestler.id}
                    name={wrestler.name}
                    imageUrl={wrestlerWithThumbnail.thumbnail_url ?? wrestler.image_url}
                    selected={selectedWrestler?.id === wrestler.id}
                    onClick={() => setSelectedWrestler(wrestler as WrestlerOptionType)}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          pt: 2,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 28%, rgba(0,0,0,1) 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            css={css`
              width: 100%;
            `}
            size="large"
            onClick={addEntrance}
            disabled={selectedWrestler === null}
          >
            {t("addEntrance.submit")}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            size="large"
            href={`/lobbies/${lobby.code}/view-game`}
          >
            {t("common.back")}
          </Button>
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            addWrestler();
          }}
        >
          <DialogTitle>{t("addEntrance.dialogTitle")}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.name}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  name: event.target.value,
                })
              }
              label={t("addEntrance.dialogLabel")}
              type="text"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t("common.cancel")}</Button>
            <Button type="submit">{t("common.add")}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

async function postEntrance(lobbyCode: string, wrestlerId: number) {
  const body = JSON.stringify({ wrestler_id: wrestlerId });
  const response = await fetchApi(`lobbies/${lobbyCode}/entrance`, {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error.message || response.statusText;
    throw new Error(message);
  }
}

async function postWrestler(name: string): Promise<Wrestler> {
  const body = JSON.stringify({ name });
  const response = await fetchApi(`wrestlers`, {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error.message || response.statusText;
    throw new Error(message);
  }
  const data = await response.json();
  return data.data.wrestler as Wrestler;
}

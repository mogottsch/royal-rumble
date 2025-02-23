import Button from "@mui/material/Button";
import {
  Autocomplete,
  Box,
  createFilterOptions,
  TextField,
} from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrestler } from "../hooks/use_lobby";
import { useWrestlers } from "../hooks/use_wrestlers";
import { useNotificationContext } from "../contexts/notification_context";
import { fetchApi } from "../api/fetcher";
import { useLoadingAndErrorStates } from "../hooks/use_loading_and_error_states";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

interface WrestlerOptionType extends Partial<Wrestler> {
  inputValue?: string;
  name: string;
}

const filter = createFilterOptions<WrestlerOptionType>();

export function AddEntrance() {
  const navigate = useNavigate();
  const { lobby } = useLobbyContext();
  const [selectedWrestler, setSelectedWrestler] =
    useState<WrestlerOptionType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
    searchTerm,
  });
  console.log({ searchedWrestlers, isLoading });
  const { setKeyLoading } = useLoadingAndErrorStates();
  const { notify } = useNotificationContext();

  if (!lobby) return <div>loading...</div>;

  const addEntrance = async () => {
    if (selectedWrestler === null) {
      notify("Please select a wrestler", "error");
      return;
    }

    if (selectedWrestler.id === undefined) {
      throw new Error("Wrestler id is undefined");
    }

    console.log(selectedWrestler);
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
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  const addWrestler = async () => {
    setKeyLoading("addWrestler", true);
    try {
      const wrestler = await postWrestler(dialogValue.name);
      notify(`Added ${wrestler.name}`, "success");
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
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ mt: 2 }}>
        <Autocomplete
          value={selectedWrestler}
          onChange={(event, newValue) => {
            if (typeof newValue === "string") {
              // timeout to avoid instant validation of the dialog's form.
              setTimeout(() => {
                toggleOpen(true);
                setDialogValue({
                  name: newValue,
                });
              });
            } else if (newValue && newValue.inputValue) {
              toggleOpen(true);
              setDialogValue({
                name: newValue.inputValue,
              });
            } else {
              setSelectedWrestler(newValue);
            }
          }}
          inputValue={searchTerm}
          onInputChange={(_, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            if (params.inputValue !== "") {
              filtered.push({
                inputValue: params.inputValue,
                name: `Add "${params.inputValue}"`,
              });
            }

            return filtered;
          }}
          id="wrestler-search"
          options={searchedWrestlers as WrestlerOptionType[]}
          getOptionLabel={(option) => {
            // e.g value selected with enter, right from the input
            if (typeof option === "string") {
              return option;
            }
            if (option.inputValue) {
              return option.inputValue;
            }
            return option.name;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          renderOption={(props, option) => <li {...props}>{option.name}</li>}
          sx={{ width: 300 }}
          freeSolo
          renderInput={(params) => <TextField {...params} label="Wrestler" />}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
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
            ADD ENTRANCE
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            size="large"
            href={`/lobbies/${lobby.code}/view-game`}
          >
            BACK
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
          <DialogTitle>Add a new wrestler</DialogTitle>
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
              label="name"
              type="text"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
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

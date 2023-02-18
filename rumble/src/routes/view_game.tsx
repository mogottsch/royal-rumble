/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box, Modal, Typography } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";
import { Participant, Rumbler } from "../hooks/use_lobby";
import { useQRCode } from "next-qrcode";
import { CopyToClipboardButton } from "../components/buttons";

interface Row {
  participant?: Participant;
  rumbler?: Rumbler;
}
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column" as "column",
  alignItems: "center" as "center",
};

export function ViewGame() {
  const { lobby } = useLobbyContext();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { Canvas } = useQRCode();

  const [rows, setRows] = useState<Row[]>();
  const foundRumblers = new Set<number>();
  useEffect(() => {
    const rumblers = (lobby?.rumblers || []).filter(
      (rumbler) => !rumbler.is_eliminated
    );
    const participants = lobby?.participants || [];
    const participantRumblerTuple: Row[] = [];
    for (const participant of participants) {
      const rumbler = rumblers.find(
        (rumbler) => rumbler.id === participant.rumbler_id
      );
      if (rumbler) {
        foundRumblers.add(rumbler.id);
      }
      const row: Row = {
        participant,
        rumbler,
      };
      participantRumblerTuple.push(row);
    }

    for (const rumbler of rumblers) {
      if (!foundRumblers.has(rumbler.id)) {
        const row: Row = {
          rumbler,
        };
        participantRumblerTuple.push(row);
      }
    }

    setRows(participantRumblerTuple);
  }, [lobby]);

  if (!lobby) return null;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {rows?.map((row, i) => {
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                margin: "5px",
              }}
              key={i}
            >
              <Box
                sx={{
                  width: "180px",
                  margin: "5px",
                  padding: "7px",
                  justifyContent: "center",
                  border: "1px solid #90caf9",
                }}
              >
                {row.participant?.name ?? "NPC"}
              </Box>
              <Box
                sx={{
                  width: "180px",
                  margin: "5px",
                  padding: "7px",
                  justifyContent: "center",
                  border: "1px solid #90caf9",
                }}
              >
                {row.rumbler?.wrestler.name ??
                  `Awaiting #${row.participant?.entrance_number}`}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          css={css`
            width: 100%;
          `}
          sx={{ mt: 1 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-entrance`}
        >
          NEXT ENTRANCE
        </Button>
        <Button
          variant="outlined"
          css={css`
            width: 100%;
          `}
          sx={{ mt: 1 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-elimination`}
        >
          NEXT ELIMINATATION
        </Button>
        <Button
          variant="outlined"
          css={css`
            width: 100%;
          `}
          sx={{ mt: 5 }}
          size="large"
          onClick={handleOpen}
        >
          SHARE
        </Button>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Canvas text={document.location.href} />
          <CopyToClipboardButton />
        </Box>
      </Modal>
    </>
  );
}

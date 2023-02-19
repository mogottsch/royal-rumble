import Button from "@mui/material/Button";
import { Box, Modal } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";
import { Participant, Rumbler } from "../hooks/use_lobby";
import QRCode from "react-qr-code";
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

  // const { Canvas } = useQRCode();

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

  const isEntranceNumbersAssigned = checkEntranceNumbersAssigned(
    lobby.participants
  );

  if (!isEntranceNumbersAssigned) {
    return <div>Wait while the host assigns entrance numbers</div>;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          overflowY: "scroll",
        }}
      >
        {rows?.map((row, i) => {
          return (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-start",
                padding: "5px",
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
          disabled={lobby.rumblers.length === 0}
        >
          NEXT ELIMINATATION
        </Button>
        <Button
          variant="outlined"
          css={css`
            width: 100%;
          `}
          sx={{ mt: 2, mb: 1 }}
          size="large"
          onClick={handleOpen}
        >
          SHARE
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <div style={{ background: "white", padding: "16px" }}>
              <QRCode value={document.location.href} />
            </div>
            <CopyToClipboardButton />
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}

function checkEntranceNumbersAssigned(participants: Participant[]) {
  return participants.every(
    (participant) => participant.entrance_number !== null
  );
}

import Button from "@mui/material/Button";
import { Box, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useNavigate } from "react-router-dom";
import { apiJson } from "../api/fetcher";
import { useLoadingAndErrorStateContext } from "../contexts/loading_and_error_states";
import { useI18n } from "../i18n";
import { buildTestEntranceNumbers } from "../test_lobby_seed";
import { useNotificationContext } from "../contexts/notification_context";

export function AssignEntranceNumbers() {
  const navigate = useNavigate();
  const { lobby, lobbyQuery } = useLobbyContext();
  const { t } = useI18n();
  const { notify } = useNotificationContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!lobby) {
      return;
    }

    const allAssignedInLobby = lobby.participants.every(
      (participant) => participant.entrance_number !== null,
    );

    if (!allAssignedInLobby) {
      return;
    }

    navigate(`/lobbies/${lobby.code}/view-game`, { replace: true });
  }, [lobby, navigate]);

  useEffect(() => {
    if (!lobby) {
      return;
    }

    let buffer = "";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1) {
        return;
      }

      buffer = `${buffer}${event.key.toLowerCase()}`.slice(-4);
      if (buffer !== "test") {
        return;
      }

      setParticipantEntranceNumber(buildTestEntranceNumbers(lobby.participants));
      setSelectedParticipantId(undefined);
      setSelectedEntranceNumber(undefined);
      buffer = "";
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lobby]);

  const [selectedParticipantId, setSelectedParticipantId] = useState<number>();
  const toggleParticipant = (participantId: number) => {
    if (selectedParticipantId === participantId) {
      setSelectedParticipantId(undefined);
    } else {
      setSelectedParticipantId(participantId);
    }
  };

  const { setIsLoading: setKeyLoading } = useLoadingAndErrorStateContext();

  const [participantEntranceNumber, setParticipantEntranceNumber] = useState<
    Record<number, number>
  >({});

  const [selectedEntranceNumber, setSelectedEntranceNumber] =
    useState<number>();

  const toggleEntranceNumber = (entranceNumber: number) => {
    const assignedEntranceNumbers = Object.values(participantEntranceNumber);
    if (assignedEntranceNumbers.includes(entranceNumber)) {
      const newParticipantEntranceNumber = { ...participantEntranceNumber };
      const participantId = Object.keys(participantEntranceNumber).find(
        (id) => participantEntranceNumber[parseInt(id)] === entranceNumber
      );
      if (participantId) {
        delete newParticipantEntranceNumber[parseInt(participantId)];
      }
      setParticipantEntranceNumber(newParticipantEntranceNumber);
      return;
    }
    if (selectedEntranceNumber === entranceNumber) {
      setSelectedEntranceNumber(undefined);
    } else {
      setSelectedEntranceNumber(entranceNumber);
    }
  };

  useEffect(() => {
    if (
      selectedParticipantId === undefined ||
      selectedEntranceNumber === undefined
    ) return;
    setParticipantEntranceNumber((current) => ({
      ...current,
      [selectedParticipantId]: selectedEntranceNumber,
    }));
    setSelectedParticipantId(undefined);
    setSelectedEntranceNumber(undefined);
  }, [selectedParticipantId, selectedEntranceNumber]);

  if (!lobby) return null;

  const nParticipants = lobby.participants.length;
  const entranceNumbers = Array.from(Array(nParticipants).keys()).map(
    (i) => i + 1
  );
  const assignedEntranceNumbers = Object.values(
    participantEntranceNumber ?? {}
  );
  const assignedParticipantIds = Object.keys(
    participantEntranceNumber ?? {}
  ).map((id) => parseInt(id));

  const unassignParticipant = (participantId: number) => {
    const newParticipantEntranceNumber = { ...participantEntranceNumber };
    delete newParticipantEntranceNumber[participantId];
    setParticipantEntranceNumber(newParticipantEntranceNumber);
  };

  const handleParticipantClick = (participantId: number) => {
    if (assignedParticipantIds.includes(participantId)) {
      unassignParticipant(participantId);
      return;
    }
    toggleParticipant(participantId);
  };

  const allAssigned = assignedEntranceNumbers.length === nParticipants;

  const assignEntranceNumbers = async () => {
    if (participantEntranceNumber === undefined || !allAssigned) {
      console.error(t("assignEntrance.errorIncomplete"));
      alert(t("assignEntrance.errorIncomplete"));
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setKeyLoading("assignEntranceNumbers", true);
    try {
      await putEntranceNumbers(lobby.code, participantEntranceNumber);
      await lobbyQuery?.refetch();
      navigate(`/lobbies/${lobby.code}/view-game`);
    } catch (error) {
      notify(`${t("assignEntrance.errorFailedPrefix")}: ${(error as Error).message}`, "error");
    } finally {
      setIsSubmitting(false);
      setKeyLoading("assignEntranceNumbers", false);
    }
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          }}
        >
          {entranceNumbers.map((entranceNumber) => (
            <Button
              key={entranceNumber}
              color={
                assignedEntranceNumbers.includes(entranceNumber)
                  ? "secondary"
                  : "primary"
              }
              variant={
                selectedEntranceNumber === entranceNumber ||
                assignedEntranceNumbers.includes(entranceNumber)
                  ? "contained"
                  : "outlined"
              }
              sx={{ my: 1, mx: 1 }}
              size="large"
              onClick={() => toggleEntranceNumber(entranceNumber)}
            >
              {entranceNumber}
            </Button>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          }}
        >
          {lobby.participants.map((participant, i) => {
            return (
              <Button
                key={i}
                color={
                  assignedParticipantIds.includes(participant.id)
                    ? "secondary"
                    : "primary"
                }
                variant={
                  selectedParticipantId === participant.id ||
                  assignedParticipantIds.includes(participant.id)
                    ? "contained"
                    : "outlined"
                }
                sx={{ my: 1, mx: 1 }}
                size="large"
                onClick={() => handleParticipantClick(participant.id)}
              >
                {participant.name}{" "}
                {participantEntranceNumber?.[participant.id] ?? ""}
              </Button>
            );
          })}
        </Box>
      </Box>
      <Box
        sx={{
          width: "100%",
          pt: 2,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 28%, rgba(0,0,0,1) 100%)",
        }}
      >
        <Button
          variant="contained"
          sx={{ width: "100%" }}
          size="large"
          onClick={assignEntranceNumbers}
          disabled={!allAssigned || isSubmitting}
        >
          {t("assignEntrance.start")}
        </Button>
      </Box>
    </Box>
  );
}

async function putEntranceNumbers(
  lobbyCode: string,
  entranceNumbers: Record<number, number>,
) {
  return apiJson(`lobbies/${lobbyCode}/entrance-numbers`, {
    method: "POST",
    body: JSON.stringify({ participantEntranceNumbers: entranceNumbers }),
    headers: { "content-type": "application/json" },
  });
}

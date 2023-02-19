import { Box } from "@mui/material";
import { Action, Lobby } from "../hooks/use_lobby";

export function History({ lobby }: { lobby: Lobby | undefined }) {
  if (!lobby) return null;
  const actions = lobby.actions;
  const actionsReverse = [...actions].reverse();
  return (
    <Box sx={{ overflow: "auto" }}>
      {actionsReverse.length === 0 && <Box>No actions yet</Box>}
      {actionsReverse.map((action, index) => (
        <Box key={index}>
          {actionsReverse.length - index}. <ActionDisplay action={action} />
        </Box>
      ))}
    </Box>
  );
}

function ActionDisplay({ action }: { action: Action }) {
  switch (action.type) {
    case "entrance":
      return <Entrance action={action} />;
    case "elimination":
      return <Elimination action={action} />;
  }
}

function Entrance({ action }: { action: Action }) {
  const wrestler = action.rumbler?.wrestler;
  if (!wrestler) return null;
  return (
    <>
      <b>{wrestler.name}</b> entered
    </>
  );
}

function Elimination({ action }: { action: Action }) {
  const elimination = action.elimination;
  if (!elimination) return null;

  const offenders = elimination.rumbler_offenders.map(
    (rumbler) => rumbler.wrestler.name
  );
  const victims = elimination.rumbler_victims.map(
    (rumbler) => rumbler.wrestler.name
  );
  return (
    <>
      <b>{joinButLast(offenders, ", ", " and ")}</b> eliminated{" "}
      <b>{joinButLast(victims, ", ", " and ")}</b>
    </>
  );
}

function joinButLast(
  array: string[],
  separator: string,
  lastSeparator: string
) {
  if (array.length === 0) return "";
  if (array.length === 1) return array[0];
  const last = array.pop();
  return array.join(separator) + lastSeparator + last;
}

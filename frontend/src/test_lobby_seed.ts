import { Participant } from "./hooks/use_lobby";

export const TEST_PARTICIPANT_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eddie",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jade",
];

export function isTestSeedTrigger(value: string) {
  return value.trim().toLowerCase() === "test";
}

export function mergeTestParticipants(participantNames: string[]) {
  return [...new Set([...participantNames, ...TEST_PARTICIPANT_NAMES])];
}

export function buildTestEntranceNumbers(participants: Participant[]) {
  const preferredOrder = new Map(
    TEST_PARTICIPANT_NAMES.map((name, index) => [name.toLowerCase(), index]),
  );

  return Object.fromEntries(
    [...participants]
      .sort((left, right) => {
        const leftIndex = preferredOrder.get(left.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
        const rightIndex = preferredOrder.get(right.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }

        return left.name.localeCompare(right.name);
      })
      .map((participant, index) => [participant.id, index + 1]),
  );
}

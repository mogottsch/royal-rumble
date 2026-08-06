import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { NotificationContextProvider } from "../contexts/notification_context";
import { usePersonalDrinkTracker } from "./use_personal_drink_tracker";

const notify = vi.fn();
const wrapper = ({ children }: { children: ReactNode }) => (
  <NotificationContextProvider value={{ notify }}>{children}</NotificationContextProvider>
);

beforeEach(() => {
  localStorage.clear();
  notify.mockReset();
  vi.restoreAllMocks();
});

it("hydrates local progress before syncing and keeps optimistic state on transient failure", async () => {
  localStorage.setItem("personal-drink-tracker:ABC:1", JSON.stringify({ sips: 2 }));
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  const { result } = renderHook(() => usePersonalDrinkTracker({
    lobbyCode: "ABC", claimedParticipantId: 1,
    raw: { sips: 4, shots: 0, chugs: 0 }, serverConsumed: { sips: 0, shots: 0, chugs: 0 },
  }), { wrapper });
  await waitFor(() => expect(result.current.consumed.sips).toBe(2));
  act(() => result.current.decrement("sips"));
  await waitFor(() => expect(result.current.consumed.sips).toBe(3));
  await waitFor(() => expect(notify).toHaveBeenCalledWith("offline", "error"));
  expect(JSON.parse(localStorage.getItem("personal-drink-tracker:ABC:1")!)).toMatchObject({ sips: 3 });
});

it("does not retry permanent client errors", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ message: "invalid participant" }), {
      status: 422,
      headers: { "content-type": "application/json" },
    }),
  );
  const { result } = renderHook(() => usePersonalDrinkTracker({
    lobbyCode: "ABC", claimedParticipantId: 1,
    raw: { sips: 2, shots: 0, chugs: 0 }, serverConsumed: { sips: 0, shots: 0, chugs: 0 },
  }), { wrapper });
  await waitFor(() => expect(result.current.remaining.sips).toBe(2));
  act(() => result.current.decrement("sips"));
  await waitFor(() => expect(notify).toHaveBeenCalledWith("invalid participant", "error"));
  await new Promise((resolve) => setTimeout(resolve, 700));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("retries a transient failure with bounded backoff", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch")
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue(new Response(null, { status: 204 }));
  const { result } = renderHook(() => usePersonalDrinkTracker({
    lobbyCode: "ABC", claimedParticipantId: 1,
    raw: { sips: 2, shots: 0, chugs: 0 }, serverConsumed: { sips: 0, shots: 0, chugs: 0 },
  }), { wrapper });
  await waitFor(() => expect(result.current.remaining.sips).toBe(2));
  act(() => result.current.decrement("sips"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), { timeout: 2_000 });
});

it("never writes an old participant after key change", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch")
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue(new Response(null, { status: 204 }));
  let participantId = 1;
  const { result, rerender } = renderHook(() => usePersonalDrinkTracker({
    lobbyCode: "ABC", claimedParticipantId: participantId,
    raw: { sips: 2, shots: 0, chugs: 0 }, serverConsumed: { sips: 0, shots: 0, chugs: 0 },
  }), { wrapper });
  await waitFor(() => expect(result.current.remaining.sips).toBe(2));
  act(() => result.current.decrement("sips"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  participantId = 2;
  rerender();
  await new Promise((resolve) => setTimeout(resolve, 800));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0].toString()).toContain("participants/1");
});

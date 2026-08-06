import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { ApiError, apiJson } from "../api/fetcher";
import { EchoContextProvider } from "../contexts/echo_context";
import { NotificationContextProvider } from "../contexts/notification_context";
import type { Lobby } from "./use_lobby";
import { useLobby } from "./use_lobby";

const navigate = vi.fn();
const notify = vi.fn();
vi.mock("../api/fetcher", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/fetcher")>();
  return { ...actual, apiJson: vi.fn() };
});
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigate };
});

const lobby = {
  id: 1,
  code: "ABC",
  participants: [],
  rumblers: [],
  actions: [],
  nextEntranceNumber: 1,
  settings: {
    rumble_size: 30,
    schluecke_per_elimination: 2,
    shots_per_elimination: 0,
    schluecke_on_npc_elimination: 0,
    shots_on_npc_elimination: 0,
    mystery_chests_enabled: false,
    chest_aggression_multiplier: 1,
  },
  drink_config: {
    schluecke_per_elimination: 2,
    shots_per_elimination: 0,
    schluecke_on_npc_elimination: 0,
    shots_on_npc_elimination: 0,
    mystery_chests_enabled: false,
    chest_aggression_multiplier: 1,
  },
  drink_distributions: [],
  chugs: [],
  chest_rewards: [],
} satisfies Lobby;

beforeEach(() => {
  navigate.mockReset();
  notify.mockReset();
  vi.mocked(apiJson).mockReset();
});

function wrapper(echo?: unknown) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <EchoContextProvider value={{ echo: echo as never }}>
        <NotificationContextProvider value={{ notify }}>{children}</NotificationContextProvider>
      </EchoContextProvider>
    </QueryClientProvider>
  );
}

it("redirects on an initial not-found response", async () => {
  vi.mocked(apiJson).mockRejectedValue(new ApiError("missing", 404));
  renderHook(() => useLobby({ lobbyCode: "ABC", pollIntervalMs: false }), { wrapper: wrapper() });
  await waitFor(() => expect(navigate).toHaveBeenCalledWith("/", { replace: true }));
});

it("retains cached lobby and does not redirect after a background failure", async () => {
  vi.mocked(apiJson).mockResolvedValueOnce({ data: { lobby } }).mockRejectedValue(new ApiError("offline", 503));
  const { result } = renderHook(() => useLobby({ lobbyCode: "ABC", pollIntervalMs: false }), { wrapper: wrapper() });
  await waitFor(() => expect(result.current.lobby?.code).toBe("ABC"));
  await act(async () => { await result.current.query.refetch(); });
  expect(result.current.lobby?.code).toBe("ABC");
  expect(navigate).not.toHaveBeenCalled();
  await waitFor(() => expect(notify).toHaveBeenCalledWith("offline", "error"));
});

it("refetches current state from Echo and cleans the channel", async () => {
  let callback: (() => void) | undefined;
  const stopListening = vi.fn();
  const leave = vi.fn();
  const echo = {
    channel: vi.fn(() => ({
      listen: vi.fn((_name: string, listener: typeof callback) => { callback = listener; }),
      stopListening,
    })),
    leave,
  };
  vi.mocked(apiJson)
    .mockResolvedValueOnce({ data: { lobby } })
    .mockResolvedValue({ data: { lobby: { ...lobby, code: "UPDATED" } } });
  const { result, unmount } = renderHook(
    () => useLobby({ lobbyCode: "ABC", pollIntervalMs: false }),
    { wrapper: wrapper(echo) },
  );
  await waitFor(() => expect(callback).toBeDefined());
  act(() => callback?.());
  await waitFor(() => expect(result.current.lobby?.code).toBe("UPDATED"));
  unmount();
  expect(stopListening).toHaveBeenCalled();
  expect(leave).toHaveBeenCalledWith("lobbies.1");
});

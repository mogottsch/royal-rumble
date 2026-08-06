import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { LoadingAndErrorStateContextProvider } from "../contexts/loading_and_error_states";
import { NotificationContextProvider } from "../contexts/notification_context";
import { I18nProvider } from "../i18n";
import { CreateLobby } from "./create_lobby";

const apiJson = vi.fn();
vi.mock("../api/fetcher", () => ({ apiJson: (...args: unknown[]) => apiJson(...args) }));

it("clears loading and reports a failed lobby creation", async () => {
  apiJson.mockRejectedValueOnce(new Error("offline"));
  const setIsLoading = vi.fn();
  const notify = vi.fn();
  render(
    <MemoryRouter>
      <I18nProvider>
        <NotificationContextProvider value={{ notify }}>
          <LoadingAndErrorStateContextProvider value={{
            isLoadingRecord: {}, setIsLoading, errorRecord: {}, setError: vi.fn(), isAnyLoading: false,
          }}>
            <CreateLobby />
          </LoadingAndErrorStateContextProvider>
        </NotificationContextProvider>
      </I18nProvider>
    </MemoryRouter>,
  );

  const input = screen.getByRole("textbox", { name: "Participant name" });
  await userEvent.type(input, "Alice");
  await userEvent.click(screen.getByRole("button", { name: "Add participant" }));
  await userEvent.type(input, "Bob");
  await userEvent.click(screen.getByRole("button", { name: "Add participant" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue with entrance order" }));

  await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.stringContaining("offline"), "error"));
  expect(setIsLoading).toHaveBeenNthCalledWith(1, "createLobby", true);
  expect(setIsLoading).toHaveBeenLastCalledWith("createLobby", false);
});

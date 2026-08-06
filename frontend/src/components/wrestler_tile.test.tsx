import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n";
import { WrestlerPickerTile } from "./wrestler_tile";

it("exposes selectable wrestler tiles as keyboard-operable pressed buttons", async () => {
  const onClick = vi.fn();
  render(<I18nProvider><WrestlerPickerTile name="John Cena" selected onClick={onClick} /></I18nProvider>);
  const button = screen.getByRole("button", { name: "John Cena" });
  expect(button).toHaveAttribute("aria-pressed", "true");
  await userEvent.tab();
  expect(button).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(onClick).toHaveBeenCalledOnce();
});

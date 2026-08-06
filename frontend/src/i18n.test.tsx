import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { I18nProvider, useI18n } from "./i18n";

function Switcher() {
  const { setLanguage } = useI18n();
  return <button onClick={() => setLanguage("de")}>de</button>;
}

it("updates the document language", async () => {
  render(<I18nProvider><Switcher /></I18nProvider>);
  await userEvent.click(screen.getByRole("button", { name: "de" }));
  expect(document.documentElement.lang).toBe("de");
});

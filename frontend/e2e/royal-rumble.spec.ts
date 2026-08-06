import { expect, test, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:18088";

type LobbyPayload = {
  id: number;
  code: string;
  participants: Array<{ id: number; name: string }>;
};

function monitor(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.url().includes("/api/") && response.status() >= 500) {
      errors.push(`http ${response.status()}: ${response.url()}`);
    }
  });
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

async function apiLobby(request: APIRequestContext, participants: string[], chests = false) {
  const response = await request.post(`${API_BASE_URL}/api/lobbies`, {
    data: {
      participants,
      rumble_size: 6,
      schluecke_per_elimination: 2,
      shots_per_elimination: 0,
      schluecke_on_npc_elimination: 0,
      shots_on_npc_elimination: 0,
      mystery_chests_enabled: chests,
      chest_aggression_multiplier: 1,
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()).data.lobby as LobbyPayload;
}

async function claim(page: Page, code: string, name: string, route = "view-game") {
  await page.goto(`/lobbies/${code}/${route}`);
  await page.getByRole("button", { name, exact: true }).click();
}

async function selectWrestler(page: Page, name: string) {
  await page.getByRole("link", { name: "Next entrance" }).click();
  await page.getByLabel("Wrestler").fill(name);
  await page.getByRole("button", { name, exact: true }).first().click();
  await page.getByRole("button", { name: "Add entrance" }).click();
  await expect(page).toHaveURL(/view-game/);
}

async function triggerCard(
  request: APIRequestContext,
  lobby: LobbyPayload,
  cardKey: string,
  chestType: "safe" | "group" | "chaos",
) {
  const chooser = lobby.participants.find((participant) => participant.name === "MoritzA")!;
  const response = await request.post(
    `${API_BASE_URL}/api/lobbies/${lobby.code}/admin/chest-rewards/trigger`,
    {
      headers: { "X-Participant-Id": String(chooser.id) },
      data: {
        participant_id: chooser.id,
        chest_type: chestType,
        card_key: cardKey,
      },
    },
  );
  expect(response.ok(), await response.text()).toBeTruthy();
  return { chooser, rewardId: (await response.json()).data.chest_reward_id as number };
}

async function openAdminReward(page: Page, lobby: LobbyPayload, rewardId: number, participantId: number) {
  await page.goto(
    `/lobbies/${lobby.code}/distribute?adminChestRewardId=${rewardId}&adminParticipantId=${participantId}`,
  );
  await expect(page.getByRole("button", { name: /Continue|Choose effect|Choose target/ })).toBeVisible();
}

async function finishGiveOut(page: Page, recipient: string, amount: number) {
  const continueButton = page.getByRole("button", { name: /Continue|Hand out drinks/i });
  const plusButton = page.getByRole("button", { name: `${recipient} Sips plus` });
  await Promise.race([
    continueButton.waitFor({ state: "visible" }),
    plusButton.waitFor({ state: "visible" }),
  ]);
  if (await continueButton.isVisible()) await continueButton.click();
  for (let index = 0; index < amount; index += 1) {
    await plusButton.click();
  }
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page).toHaveURL(/view-game/);
}

test("classic game works across mobile, second client, deep links and dashboard", async ({ page, browser }) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}`;
  const alice = `Alice ${suffix}`;
  const bob = `Bob ${suffix}`;
  const assertClean = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "DE" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await page.getByRole("combobox", { name: "Sprache" }).click();
  await page.getByRole("option", { name: "EN" }).click();
  await page.getByRole("link", { name: "Create" }).click();

  const nameInput = page.getByLabel("Participant name");
  await nameInput.fill(alice);
  await page.getByRole("button", { name: "Add participant" }).click();
  await nameInput.fill(bob);
  await page.getByRole("button", { name: "Add participant" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: alice, exact: true }).click();

  await page.getByRole("button", { name: alice, exact: true }).click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("button", { name: bob, exact: true }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await page.getByRole("button", { name: "Start Royal Rumble" }).click();
  const code = page.url().match(/lobbies\/([^/]+)/)![1];

  const secondContext: BrowserContext = await browser.newContext({ viewport: { width: 430, height: 900 } });
  const second = await secondContext.newPage();
  const assertSecondClean = monitor(second);
  await claim(second, code, bob);

  await selectWrestler(page, "John Cena");
  await expect(second.getByText("John Cena")).toBeVisible({ timeout: 8_000 });
  await selectWrestler(page, "Randy Orton");
  await expect(second.getByText("Randy Orton")).toBeVisible({ timeout: 8_000 });

  await page.getByRole("link", { name: "Next elimination" }).click();
  await page.getByRole("button").filter({ hasText: "John Cena" }).first().click();
  await page.getByRole("button").filter({ hasText: "Randy Orton" }).last().click();
  await page.getByRole("button", { name: "Add elimination" }).click();
  await page.getByRole("button", { name: "Hand out now" }).click();
  await page.getByRole("button", { name: `${bob} Sips plus` }).click();
  await page.getByRole("button", { name: `${bob} Sips plus` }).click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(second.getByRole("button", { name: "Sips: 2" })).toBeVisible({ timeout: 8_000 });
  await second.getByRole("button", { name: "Sips: 2" }).click();
  await expect(second.getByRole("button", { name: "Sips: 1" })).toBeVisible();
  await second.reload();
  await expect(second.getByRole("button", { name: "Sips: 1" })).toBeVisible();

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByText(/John Cena/).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("menuitem", { name: /Share/ }).click();
  await expect(page.getByRole("dialog", { name: "Share lobby" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy player link" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto(`/lobbies/${code}/dashboard`);
  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("John Cena").first()).toBeVisible();

  assertClean();
  assertSecondClean();
  await secondContext.close();
});

test("deterministic admin chests exercise give-out, auto, effect-choice and target-pick screens", async ({ page, request }) => {
  test.setTimeout(120_000);
  const assertClean = monitor(page);
  const lobby = await apiLobby(request, ["MoritzA", `Other ${Date.now()}`], true);
  const other = lobby.participants[1];
  await claim(page, lobby.code, "MoritzA");

  // Exercise the visible admin trigger using its default Safe give-out card.
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("menuitem", { name: /Trigger chest card/ }).click();
  await page.getByRole("button", { name: "Trigger" }).click();
  await expect(page).toHaveURL(/adminChestRewardId=/);
  await finishGiveOut(page, "MoritzA", 3);

  const auto = await triggerCard(request, lobby, "safe_you_and_random_sip", "safe");
  await openAdminReward(page, lobby, auto.rewardId, auto.chooser.id);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/view-game/);

  const effect = await triggerCard(request, lobby, "safe_sweet_deal", "safe");
  await openAdminReward(page, lobby, effect.rewardId, effect.chooser.id);
  await page.getByRole("button", { name: /effect choice/i }).click();
  await page.getByRole("button").filter({ hasText: "Keep it light" }).click();
  await finishGiveOut(page, other.name, 3);

  const target = await triggerCard(request, lobby, "chaos_russian_roulette", "chaos");
  await openAdminReward(page, lobby, target.rewardId, target.chooser.id);
  await page.getByRole("button", { name: /target/i }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: other.name }).click();
  await expect(page).toHaveURL(/view-game/);

  assertClean();
});

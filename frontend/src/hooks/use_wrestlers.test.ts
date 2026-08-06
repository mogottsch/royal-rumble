import { expect, it, vi } from "vitest";
import { fetchWrestlers } from "./use_wrestlers";

it("URL-encodes wrestler search terms", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  await fetchWrestlers("Rock & Roll?", new AbortController().signal);
  expect(String(fetchMock.mock.calls[0][0])).toContain("search=Rock+%26+Roll%3F");
});

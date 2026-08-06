import { afterEach, describe, expect, it, vi } from "vitest";
import { apiJson, fetchApi } from "./fetcher";

describe("API transport", () => {
  afterEach(() => vi.restoreAllMocks());

  it("merges default and caller headers and forwards abort signals", async () => {
    const controller = new AbortController();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    await fetchApi("/health", {
      signal: controller.signal,
      headers: { "content-type": "application/json" },
    });
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(options.headers);
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("content-type")).toBe("application/json");
    expect(options.signal).toBe(controller.signal);
  });

  it("accepts empty successful mutation responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 201 }));
    await expect(apiJson("/mutate", { method: "POST" })).resolves.toBeUndefined();
  });

  it("extracts useful JSON API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid lobby" }), {
        status: 422,
        headers: { "content-type": "application/json" },
      }),
    );
    await expect(apiJson("/lobbies")).rejects.toThrow("Invalid lobby");
  });
});

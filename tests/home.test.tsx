import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { Home } from "@/routes/index";

describe("rocketlane home", () => {
  it("renders the renamed brand and every section", () => {
    const { container } = render(<Home />);
    const text = container.textContent ?? "";

    expect(text).toContain("rocketlane");
    expect(text).toContain("Your job hunt,");
    expect(text).toContain("Search, track, chat & cold email founders.");
    expect(text).toContain("Simple pricing. Transparent.");
    expect(text).toContain("Trusted by early-career talent.");
    expect(text).toContain("Stop applying. Start getting replies.");

    // nav anchors
    for (const id of ["features", "pricing", "reviews"]) {
      expect(container.querySelector(`#${id}`)).toBeTruthy();
    }

    // pricing recovered from the shipped catalog
    expect(text).toContain("$5");
    expect(text).toContain("$8");
    expect(text).toContain("1,500 AI credits / month");
  });

  it("does not mention the original product name anywhere", () => {
    const { container } = render(<Home />);
    const text = (container.textContent ?? "").toLowerCase();
    expect(text).not.toContain("aarivi");
  });

  it("rotates the headline word over time", async () => {
    vi.useFakeTimers();
    const { container } = render(<Home />);
    const before = container.querySelector("h1")?.textContent ?? "";
    act(() => {
      vi.advanceTimersByTime(2300);
    });
    const after = container.querySelector("h1")?.textContent ?? "";
    vi.useRealTimers();
    expect(after).not.toBe(before);
  });
});

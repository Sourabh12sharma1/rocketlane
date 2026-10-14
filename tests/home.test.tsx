import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { Home } from "@/routes/index";

describe("rocketlane home", () => {
  it("renders the brand and every section", () => {
    const { container } = render(<Home />);
    const text = container.textContent ?? "";

    expect(text).toContain("rocketlane");
    expect(text).toContain("The job search,");
    expect(text).toContain("Four things you stop doing yourself.");
    expect(text).toContain("Two plans. One is free.");
    expect(text).toContain("Three things this exists to fix.");
    expect(text).toContain("Run one search tonight.");

    for (const id of ["how-it-works", "plans", "why"]) {
      expect(container.querySelector(`#${id}`)).toBeTruthy();
    }
  });

  it("uses the new pricing, not the source site's", () => {
    const { container } = render(<Home />);
    const text = container.textContent ?? "";
    expect(text).toContain("$0");
    expect(text).toContain("$14");
    expect(text).toContain("Unlimited outreach credits");
    expect(text).toContain("50 outreach credits");
    // the original's claim numbers must be gone
    expect(text).not.toContain("739");
    expect(text).not.toContain("12 founders emailed today");
    expect(text).not.toContain("94% match");
    expect(text).not.toContain("500 AI credits");
  });

  it("carries no copy from the source site", () => {
    const { container } = render(<Home />);
    const text = (container.textContent ?? "").toLowerCase();
    for (const lifted of [
      "aarivi",
      "on autopilot",
      "cruise mode",
      "stop applying. start getting replies",
      "trusted by early-career talent",
      "simple pricing. transparent",
      "billed annually",
      "resume → portfolio. zero code",
      "built for ambitious careers",
    ]) {
      expect(text).not.toContain(lifted);
    }
  });

  it("rotates the headline word over time", () => {
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

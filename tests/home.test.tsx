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

describe("plan signup", () => {
  it("opens the Starter dialog from the hero CTA and closes it", async () => {
    const { container } = render(<Home />);
    const open = () =>
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === "Start with one search",
      )!;

    expect(container.textContent).not.toContain("Start Starter");
    act(() => open().click());
    expect(container.textContent).toContain("Start Starter");
    expect(container.textContent).toContain("$0/mo");
    expect(container.querySelector('input[type="email"]')).toBeTruthy();

    act(() => {
      [...container.querySelectorAll("button")]
        .find((b) => b.textContent === "Cancel")!
        .click();
    });
    expect(container.textContent).not.toContain("Start Starter");
  });

  it("opens the Pro dialog from its pricing card", () => {
    const { container } = render(<Home />);
    act(() => {
      [...container.querySelectorAll("button")]
        .find((b) => b.textContent === "Start Pro")!
        .click();
    });
    expect(container.textContent).toContain("Start Pro");
    expect(container.textContent).toContain("$14/mo");
    expect(container.textContent).toContain("Unlimited outreach credits");
  });

  it("captures the email and says plainly that nothing was sent", async () => {
    const { container } = render(<Home />);
    act(() => {
      [...container.querySelectorAll("button")]
        .find((b) => b.textContent === "Start free")!
        .click();
    });

    const input = container.querySelector('input[type="email"]') as HTMLInputElement;
    act(() => {
      // fire native change so React picks up the value
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "partner@example.com");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      [...container.querySelectorAll("button")]
        .find((b) => b.textContent === "Continue")!
        .click();
    });

    const text = container.textContent ?? "";
    expect(text).toContain("You’re on the list.");
    expect(text).toContain("partner@example.com");
  });
});

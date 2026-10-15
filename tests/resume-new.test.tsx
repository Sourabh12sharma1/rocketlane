import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { TemplatePicker } from "@/components/resume/TemplatePicker";

describe("TemplatePicker", () => {
  it("shows three templates", () => {
    const { getByRole } = render(
      <TemplatePicker value="classic" onChange={() => {}} />,
    );
    expect(getByRole("button", { name: /classic/i })).toBeTruthy();
    expect(getByRole("button", { name: /modern/i })).toBeTruthy();
    expect(getByRole("button", { name: /compact/i })).toBeTruthy();
  });
});

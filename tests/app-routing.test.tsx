import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AppRoutes } from "@/App";

describe("app routing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows Login when visiting /app/resume without a token", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/app/resume"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(container.textContent).toMatch(/login/i);
  });
});

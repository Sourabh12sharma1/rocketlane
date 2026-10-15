import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { Signup } from "@/routes/app/Signup";
import { Login } from "@/routes/app/Login";
import { VerifyOtp } from "@/routes/app/VerifyOtp";
import { TOKEN_KEY } from "@/lib/api";

function renderSignup(initial = "/app/signup") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <AuthProvider>
        <Routes>
          <Route path="/app/signup" element={<Signup />} />
          <Route path="/app/verify-otp" element={<div>verify-otp-page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("auth screens", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "tok_test",
          token_type: "bearer",
          user: {
            id: "u1",
            email: "a@example.com",
            phone: "+15551234567",
            phone_verified: false,
          },
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Signup shows email, password, phone and submits register", async () => {
    const { container } = renderSignup();
    expect(container.querySelector('input[type="email"]')).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
    expect(container.querySelector('input[type="tel"]')).toBeTruthy();

    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: "a@example.com" },
    });
    fireEvent.change(container.querySelector('input[type="password"]')!, {
      target: { value: "secret123" },
    });
    fireEvent.change(container.querySelector('input[type="tel"]')!, {
      target: { value: "+15551234567" },
    });

    await act(async () => {
      fireEvent.click(
        [...container.querySelectorAll("button")].find((b) => b.type === "submit")!,
      );
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).toContain("/api/auth/register");
    expect(init?.method).toBe("POST");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok_test");
    expect(container.textContent).toContain("verify-otp-page");
  });

  it("Login navigates to verify-otp when phone not verified", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/app/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/app/login" element={<Login />} />
            <Route path="/app/verify-otp" element={<div>verify-otp-page</div>} />
            <Route path="/app/resume" element={<div>resume-page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: "a@example.com" },
    });
    fireEvent.change(container.querySelector('input[type="password"]')!, {
      target: { value: "secret123" },
    });

    await act(async () => {
      fireEvent.click(
        [...container.querySelectorAll("button")].find((b) => b.type === "submit")!,
      );
    });

    await waitFor(() => {
      expect(container.textContent).toContain("verify-otp-page");
    });
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).toContain("/api/auth/login");
  });

  it("VerifyOtp requests and verifies code", async () => {
    localStorage.setItem(TOKEN_KEY, "tok_test");
    const fetchMock = fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, expires_in: 300 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ phone_verified: true }) });

    const { container } = render(
      <MemoryRouter initialEntries={["/app/verify-otp"]}>
        <AuthProvider>
          <Routes>
            <Route path="/app/verify-otp" element={<VerifyOtp />} />
            <Route path="/app/resume" element={<div>resume-page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.click(
        [...container.querySelectorAll("button")].find((b) =>
          /send|request/i.test(b.textContent ?? ""),
        )!,
      );
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/auth/otp/request");

    fireEvent.change(container.querySelector('input[inputmode="numeric"]')!, {
      target: { value: "123456" },
    });

    await act(async () => {
      fireEvent.click(
        [...container.querySelectorAll("button")].find((b) => b.type === "submit")!,
      );
    });

    await waitFor(() => {
      expect(container.textContent).toContain("resume-page");
    });
    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/auth/otp/verify");
  });
});

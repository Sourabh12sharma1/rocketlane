import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ResumeEditor } from "@/routes/app/ResumeEditor";
import type { ResumeRecord } from "@/lib/resumeTypes";

const mockResume: ResumeRecord = {
  id: "r1",
  title: "My Resume",
  template_id: "classic",
  updated_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  content: {
    contact: {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 555 0100",
      location: "San Francisco",
      links: [],
    },
    summary: "Product engineer with 8 years of experience.",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    links: [],
    certifications: [],
    languages: [],
    custom: [],
  },
};

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={["/app/resume/r1"]}>
      <Routes>
        <Route path="/app/resume/:id" element={<ResumeEditor />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResumeEditor", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (String(url).includes("/api/resumes/r1")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResume,
          });
        }
        return Promise.resolve({ ok: false, json: async () => ({}) });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows Contact and Summary fields for mock resume", async () => {
    const { getByLabelText } = renderEditor();
    await waitFor(() => {
      expect((getByLabelText(/full name/i) as HTMLInputElement).value).toBe("Jane Doe");
    });
    expect((getByLabelText(/email/i) as HTMLInputElement).value).toBe("jane@example.com");
    expect((getByLabelText(/^summary$/i) as HTMLTextAreaElement).value).toBe(
      "Product engineer with 8 years of experience.",
    );
  });
});

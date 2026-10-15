import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Home } from "@/routes/index";
import { Login } from "@/routes/app/Login";
import { Signup } from "@/routes/app/Signup";
import { VerifyOtp } from "@/routes/app/VerifyOtp";
import { ResumeList } from "@/routes/app/ResumeList";
import { ResumeNew } from "@/routes/app/ResumeNew";
import { ResumeEditor } from "@/routes/app/ResumeEditor";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppShell />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="verify-otp" element={<VerifyOtp />} />
        <Route
          path="resume"
          element={
            <RequireAuth>
              <ResumeList />
            </RequireAuth>
          }
        />
        <Route
          path="resume/new"
          element={
            <RequireAuth>
              <ResumeNew />
            </RequireAuth>
          }
        />
        <Route
          path="resume/:id"
          element={
            <RequireAuth>
              <ResumeEditor />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}

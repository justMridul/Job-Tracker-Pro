// src/pages/AuthPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./auth.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const nav = useNavigate();
  const loc = useLocation();
  const { login, register } = useAuth();

  const canSubmit = useMemo(() => {
    if (!form.email || !form.password) return false;
    if (mode === "register" && !form.name) return false;
    return true;
  }, [form, mode]);

  useEffect(() => {
    setErr("");
    setSuccessMsg("");
  }, [mode]);

  const nextPath = loc.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setErr("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login({ email: form.email, password: form.password });
        if (!res.success) return setErr(res.message || "Login failed");
        nav(nextPath, { replace: true });
      } else {
        const res = await register(form.name, form.email, form.password);
        if (!res.success) return setErr(res.message || "Registration failed");
        setSuccessMsg(res.message || "Account created! You can now login.");
        setMode("login");
      }
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrapper" data-boot>
      <div className="bg-grid" />
      <div className="particles" />
      <div className="auth-card" data-animate>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {mode === "login" ? "Sign in to continue" : "Join to track jobs and internships"}
        </p>

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                minLength={2}
                maxLength={80}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-row">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="ghost"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {err && <div className="error">{err}</div>}
          {successMsg && <div className="success">{successMsg}</div>}

          <button className="primary" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div className="switch">
            {mode === "login" ? (
              <>
                <span>New here?</span>
                <button type="button" className="link" onClick={() => setMode("register")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <button type="button" className="link" onClick={() => setMode("login")}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


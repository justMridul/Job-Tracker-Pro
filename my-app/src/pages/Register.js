// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../utils/authService";
import Button from "../components/buttons/Button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(name, email, password);
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.overlay} />
      <form onSubmit={onSubmit} style={{ ...styles.formContainer, position: "relative", zIndex: 1 }} noValidate>
        <h2 style={styles.heading}>Create Account</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <label htmlFor="name" style={styles.label}>Full Name</label>
        <input
          id="name"
          type="text"
          value={name}
          style={styles.input}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          style={styles.input}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        <Button type="submit" variant="primary" size="lg" disabled={loading} ariaLabel="Create Account">
          {loading ? "Creating..." : "Create Account"}
        </Button>

        <p style={styles.bottomText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    background: "linear-gradient(135deg, #6b73ff 0%, #000dff 100%)",
    padding: "16px",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 0,
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: "24px",
    fontWeight: "700",
    fontSize: "1.8rem",
    color: "#111827",
    textAlign: "center",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    marginBottom: "20px",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    transition: "border-color 0.25s ease",
  },
  errorMessage: {
    marginBottom: "16px",
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },
  bottomText: {
    marginTop: "16px",
    fontSize: "0.9rem",
    color: "#e0e0e0",
    textAlign: "center",
  },
  link: {
    color: "#22c55e",
    textDecoration: "none",
    fontWeight: "600",
  },
};

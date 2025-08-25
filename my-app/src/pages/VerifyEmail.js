import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    async function verify() {
      try {
        const res = await API.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
        // Redirect after 3 seconds
        setTimeout(() => navigate("/auth", { replace: true }), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed.");
      }
    }

    verify();
  }, [location.search, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", textAlign: "center" }}>
      {status === "loading" && <h2>Verifying your email...</h2>}
      {status === "success" && (
        <div>
          <h2 style={{ color: "green" }}>✅ {message}</h2>
          <p>Redirecting you to login...</p>
        </div>
      )}
      {status === "error" && (
        <div>
          <h2 style={{ color: "red" }}>❌ {message}</h2>
          <p>Please try again or request a new verification email.</p>
        </div>
      )}
    </div>
  );
}

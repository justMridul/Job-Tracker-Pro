// src/utils/authService.js
import api from "./api";

export async function register(name, email, password) {
  const { data } = await api.post("/auth/register", { name, email, password });
  // Expect: { accessToken, refreshToken, user } or similar
  return data;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

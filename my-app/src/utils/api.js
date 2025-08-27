import axios from "axios";

// ✅ Use environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const API = axios.create({
  baseURL: API_BASE_URL, // ✅ Use variable instead of hardcoded URL
  withCredentials: true, // allow cookies if you later set any
});

// Attach access token to each request
API.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Helper to set/remove access token explicitly
export function setAccessToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

// ✅ Fix refresh token function to use environment variable
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token stored");

  const res = await axios.post(
    `${API_BASE_URL}/auth/refresh`, // ✅ Use variable instead of hardcoded URL
    { refreshToken },
    { withCredentials: true }
  );

  const { accessToken } = res.data;
  localStorage.setItem("accessToken", accessToken);
  return accessToken;
};

// Response interceptor for handling 401 and refreshing token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // ✅ Fixed path
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth API (Google OAuth only) =====
export const googleAuth = (credential) => API.post("/auth/google", { credential });
export const logoutUser = () => API.post("/auth/logout");
export const getMe = () => API.get("/auth/me");

// ===== Application API =====
export const createApplication = (data) => API.post("/applications", data);
export const updateApplication = (id, data) => API.put(`/applications/${id}`, data);
export const updateApplicationStatus = (id, status) =>
  API.put(`/applications/${id}/status`, { status });
export const getApplicationsByUser = (userId, queryParams) =>
  API.get(`/applications/user/${userId}`, { params: queryParams });

// ===== Optional Job API =====
export const createJob = (data) => API.post("/api/jobs", data);
export const updateJob = (id, data) => API.put(`/api/jobs/${id}`, data);
export const getJobs = (queryParams) => API.get("/api/jobs", { params: queryParams });
export const getJobById = (id) => API.get(`/api/jobs/${id}`);

export default API;

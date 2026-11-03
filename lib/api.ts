import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000, // 90s to handle Render free tier cold start (~50s)
});

// Automatically retry once on timeout or network error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Only retry once, only on timeout or network error (no response)
    if (!config._retried && (error.code === "ECONNABORTED" || !error.response)) {
      config._retried = true;
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;

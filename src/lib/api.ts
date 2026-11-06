import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 8_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "A solicitação excedeu o tempo limite. Tente novamente.";
    }
    return Promise.reject(error);
  },
);

import axios from "axios";
import keycloak from "../contexts/keycloak";

export const http = axios.create({
  baseURL: "http://localhost:3000", // ✅ ton NestJS
});

// Avant chaque requête: refresh + inject Bearer
http.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    // refresh si expire bientôt
    await keycloak.updateToken(30);
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});
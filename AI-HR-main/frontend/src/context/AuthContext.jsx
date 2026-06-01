import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("smart_hr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("smart_hr_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("smart_hr_token", data.token);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("smart_hr_token", data.token);
    setUser(data.user);
  }

  async function googleLogin(idToken) {
    const { data } = await api.post("/auth/google", { idToken });
    localStorage.setItem("smart_hr_token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("smart_hr_token");
    setUser(null);
  }

  const value = useMemo(() => ({ user, setUser, loading, login, register, logout, googleLogin }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem("token"));
  const [tempToken, setTempTokenState] = useState(localStorage.getItem("tempToken"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const setToken = (value) => {
    setTokenState(value);
    if (value) localStorage.setItem("token", value);
    else localStorage.removeItem("token");
  };

  const setTempToken = (value) => {
    setTempTokenState(value);
    if (value) localStorage.setItem("tempToken", value);
    else localStorage.removeItem("tempToken");
  };

  const logout = () => {
    setToken(null);
    setTempToken(null);
    setUser(null);
    localStorage.clear();
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        logout();
      }

      setLoadingUser(false);
    };

    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        tempToken,
        setTempToken,
        user,
        setUser,
        logout,
        loadingUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

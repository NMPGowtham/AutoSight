import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("access_token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(savedToken);

        // Get fresh user details from backend
        const currentUser = await getCurrentUser();

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.error("Failed to restore user session:", error);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    // Login only gets the token
    const response = await loginUser(email, password);

    const accessToken = response.access_token;

    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);

    // Now fetch actual user details
    const currentUser = await getCurrentUser();

    localStorage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);

    return {
      ...response,
      user: currentUser,
    };
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
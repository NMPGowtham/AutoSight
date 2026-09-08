import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");

    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to restore user session:", error);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // --------------------------------------------------
    // MOCK LOGIN
    // This will be replaced with the real API later.
    // --------------------------------------------------

    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!username || !password) {
      throw new Error("Username and password are required.");
    }

    const mockResponse = {
      access_token: "mock-access-token-12345",
      user: {
        id: "INS-001",
        name: username,
        role: username === "admin" ? "ADMIN" : "INSPECTOR",
      },
    };

    localStorage.setItem("access_token", mockResponse.access_token);

    localStorage.setItem("user", JSON.stringify(mockResponse.user));

    setToken(mockResponse.access_token);
    setUser(mockResponse.user);

    return mockResponse;
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

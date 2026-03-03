"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "BUYER" | "SELLER" | "ADMIN";
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    userType: "BUYER" | "SELLER",
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://auction-platform-backend-uvjo.onrender.com/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token || data.id);
      localStorage.setItem("userType", data.userType);
      localStorage.setItem("userData", JSON.stringify(data));
      setUser(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    userType: "BUYER" | "SELLER",
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://auction-platform-backend-uvjo.onrender.com/users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, userType }),
        },
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token || data.id);
      localStorage.setItem("userType", data.userType);
      localStorage.setItem("userData", JSON.stringify(data));
      setUser(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

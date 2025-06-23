"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { adminApi, APIError } from "@/lib/api";
import {
  LoginCredentials,
  LoginResponse,
  AdminUser,
  AuthContextType,
} from "@/lib/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminApi.verifyToken();
      setAdmin(response.admin);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("admin_token");
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string; data?: LoginResponse }> => {
    try {
      const response = await adminApi.login(credentials);

      localStorage.setItem("admin_token", response.token);
      setAdmin(response.admin);
      setIsAuthenticated(true);

      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error instanceof APIError
          ? error.message
          : "Login failed. Please try again.";

      return { success: false, error: errorMessage };
    }
  };

  const logout = (): void => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
    setIsAuthenticated(false);
    window.location.href = "/admin/login";
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

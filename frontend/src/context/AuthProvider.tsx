import {
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useRef,
} from "react";

import { AuthContext } from "./AuthContext";
import { setAuthorizationHeaderToken } from "../api/AuthToken";
import Cookies from "js-cookie";
import { getRequest } from "../api/ApiRequests";
import { type AuthUser } from "../interfaces/Auth";
import AxiosInstanceCustom from "../api/AxiosInstance";
import  type { AuthContextType } from "../interfaces/Auth";


// Module-level guards — survive React Strict Mode's unmount/remount cycle
let _initialized = false;
let _refreshInProgress = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [mainLoading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);


  // ─── Proactive refresh ───────────────────────────────────────────────────────
  const proactiveRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleProactiveRefresh = (token: string) => {
    // Clear any existing scheduled refresh
    if (proactiveRefreshTimer.current) {
      clearTimeout(proactiveRefreshTimer.current);
      proactiveRefreshTimer.current = null;
    }

    try {
      // Decode JWT payload (base64) to get expiry time
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return;

      const payload = JSON.parse(atob(payloadBase64));
      if (!payload.exp) return;

      const expiresAtMs = payload.exp * 1000;           // convert to ms
      const nowMs = Date.now();
      const msUntilExpiry = expiresAtMs - nowMs;
      const REFRESH_BEFORE_MS = 60 * 1000;              // refresh 1 min before expiry

      const delay = msUntilExpiry - REFRESH_BEFORE_MS;

      if (delay <= 0) {
        // Token already close to / past expiry — refresh immediately
        refreshAccessToken();
        return;
      }

      console.log(`[Auth] Proactive refresh scheduled in ${Math.round(delay / 1000)}s`);

      proactiveRefreshTimer.current = setTimeout(async () => {
        console.log("[Auth] Proactive refresh triggered");
        await refreshAccessToken();
      }, delay);

    } catch (e) {
      // Malformed token — skip scheduling
      console.warn("[Auth] Could not schedule proactive refresh:", e);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const refreshAccessToken = async (): Promise<string | null> => {
    if (_refreshInProgress) {
      return null;
    }
    _refreshInProgress = true;
    
    try {
      const response = await AxiosInstanceCustom.post("/auth/refresh-token", {});

      const token = response.data.data;

      if (token) {
        setAccessToken(token);

        setAuthorizationHeaderToken(token);

        scheduleProactiveRefresh(token); // ← schedule next proactive refresh

        console.log("This: ", token);
        return token;

      } else {
        return null;
      }

    } catch (err:any) {
      return null;

    } finally {
      _refreshInProgress = false;
    }
  };

  const fetchAuthenticatedUser = async (): Promise<AuthUser | null> => {
    try {
      const response = await getRequest("/auth/auth-user");
      console.log(response)
      return response.data.data;

    } catch (error:any) {
      return null;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await AxiosInstanceCustom.post("/auth/login", { username, password });
      const { access_token, user } = response.data;
      setAccessToken(access_token);
      setAuthorizationHeaderToken(access_token);
      setUser(user);
      scheduleProactiveRefresh(access_token);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const signup = async (fullname: string, username: string, email: string, password: string) => {
    try {
      const response = await AxiosInstanceCustom.post("/auth/signup", { fullname, username, email, password });
      const { access_token, user } = response.data;
      setAccessToken(access_token);
      setAuthorizationHeaderToken(access_token);
      setUser(user);
      scheduleProactiveRefresh(access_token);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Signup failed");
    }
  };

  const logout = async () => {
    // Clear proactive refresh timer on logout
    if (proactiveRefreshTimer.current) {
      clearTimeout(proactiveRefreshTimer.current);
      proactiveRefreshTimer.current = null;
    }

    try {
      await AxiosInstanceCustom.post("/auth/logout");

    } catch (error) {

    } finally {
      setAccessToken(null);
      setUser(null);

      delete AxiosInstanceCustom.defaults.headers.common["Authorization"];
      
      Cookies.remove("refreshToken");
    }
  };

  useEffect(() => {
    const interceptor = AxiosInstanceCustom.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/auth/refresh-token") &&
          !originalRequest.url.includes("/auth/logout")
        ) {
          originalRequest._retry = true;

          const newToken = await refreshAccessToken();
          console.log(`New: ${newToken}`);
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            return AxiosInstanceCustom(originalRequest);

          } else {
            await logout();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      AxiosInstanceCustom.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    setAuthorizationHeaderToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (_initialized) return;
    _initialized = true;

    const initAuth = async () => {
      try {
        const token = await refreshAccessToken();

        if (token) {
          const userData = await fetchAuthenticatedUser();
          setUser(userData);

        } else {

          // await logout();
        }
      } catch (error) {
        await logout();
        
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const contextValue: AuthContextType = {
    mainLoading,
    user,
    setUser,
    setLoading,
    accessToken,
    setAccessToken,
    logout,
    login,
    signup,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
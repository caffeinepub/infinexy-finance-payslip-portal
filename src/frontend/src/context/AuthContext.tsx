import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthUser {
  isAdmin: boolean;
  username: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

const STORAGE_KEY = "infinexy_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => setUser(null);

  useEffect(() => {
    // no-op, already initialized from localStorage
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

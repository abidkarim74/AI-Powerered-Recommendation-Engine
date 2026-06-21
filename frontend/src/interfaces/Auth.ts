export interface AuthUser {
  id: string
  email: string
  fullname: string
  username: string
  created_at: string,
}


export interface AuthContextType  {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  mainLoading: boolean;
  user: AuthUser | null;
  setUser: (value: AuthUser | null) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (fullname: string, username: string, email: string, password: string) => Promise<void>;
};

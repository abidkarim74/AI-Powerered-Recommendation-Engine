import { createContext } from "react";
import type { AuthContextType } from "../interfaces/Auth";


export const AuthContext = createContext<AuthContextType | undefined>(undefined);
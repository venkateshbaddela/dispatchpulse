import {createContext, useContext } from "react";
import { type AuthContextType } from "./AuthContext";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error('useAut must be used within an AuthProvider');
    }
    return context;
}
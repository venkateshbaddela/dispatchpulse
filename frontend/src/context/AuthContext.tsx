import React, {useState, useEffect} from 'react';
import { AuthContext } from './useAuth';
import type {User, LoginCredentials, RegisterPayload} from '../types/auth';
import { authApi } from '../api/auth.api';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(() => {
        const cachedUser = localStorage.getItem('auth_user');
        return cachedUser ? JSON.parse(cachedUser) : null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const profile = await authApi.getCurrentUser();
                    setUser(profile);
                    localStorage.setItem('auth_user', JSON.stringify(profile));
                } catch {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const data = await authApi.login(credentials);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const register = async (payload: RegisterPayload) => {
        const data = await authApi.register(payload);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, isAuthenticated: !!user, isLoading,login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
};


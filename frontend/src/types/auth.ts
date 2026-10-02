import type { Organization } from "./organization";

export type UserRole = 'ADMIN' | 'RESPONDER' | 'VIEWER';

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_on_call: boolean;
    organization: Organization | null;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    org_name?: string;
}
import type { Organization } from "./organization";

export type UserRole = 'ADMIN' | 'RESPONDER' | 'VIEWER';

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_on_call: boolean;
    active_incidents_count?: number;
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

export interface InviteMemberPayload {                                                        
    email: string;                                                                            
    password: string;                                                                         
    role: UserRole;                                                                           
    first_name?: string;                                                                      
    last_name?: string;                                                                       
}                                                                                             
                                                                                                
export interface UpdateUserPayload {                                                          
    role?: UserRole;                                                                          
    is_on_call?: boolean;                                                                     
    first_name?: string;                                                                      
    last_name?: string;                                                                       
}   
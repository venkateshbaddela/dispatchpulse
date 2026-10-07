import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {Spinner} from '../ui/Spinner';

export const ProtectedRoute: React.FC = () => {
    const {isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-obsidian-canvas text-slate-900 dark:text-slate-100">
                <div className="flex flex-col items-center gap-3">
                    <Spinner size="lg" />
                    <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Verifying Session...</p>
                </div>
            </div>
        )
    }

    return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace/>

}
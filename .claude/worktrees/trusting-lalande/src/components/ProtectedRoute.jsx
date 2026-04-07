import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthStore();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4a853]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // 로그인 페이지로 리다이렉트하되, 현재 위치를 저장하여 로그인 후 돌아올 수 있게 함
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;

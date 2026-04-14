// src/components/ProtectedRoute.js

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    // 1. Si le contexte est en cours de chargement initial, ne rien faire
    if (loading) {
        // Optionnel : afficher un loader pendant le temps que React vérifie le token dans localStorage
        return <div style={{ textAlign: 'center', padding: '50px' }}>Vérification de l'authentification...</div>;
    }

    // 2. Si l'utilisateur est authentifié, il peut accéder aux routes enfants
    if (isAuthenticated) {
        return <Outlet />;
    }

    // 3. Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
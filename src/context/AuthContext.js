// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken, logoutUser } from '../services/API';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    // Initialise l'état en vérifiant si un token existe déjà dans localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem('auth_token')
    );
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user_data')) || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialisation de l'API (à exécuter une seule fois au montage)
        const token = localStorage.getItem('auth_token');
        if (token) {
            // 🔑 CORRECTION CRUCIALE : Applique le token à Axios au chargement initial
            setAuthToken(token); 
            setIsAuthenticated(true); // Assure que l'état est synchro
        }
        setLoading(false);
    }, []);

    // Fonction appelée par Login.js et Register.js
    const login = ({ user: userData, token }) => {
        // Stockage du token et des données utilisateur pour la persistance
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Configuration du header d'Axios pour les futures requêtes
        setAuthToken(token); 
        
        // Mise à jour de l'état
        setIsAuthenticated(true);
        setUser(userData);
    };

    // Fonction appelée par le bouton de Déconnexion
    const logout = async () => {
        try {
            // Optionnel: informer le backend que le token n'est plus valide
            await logoutUser(); 
        } catch (error) {
            console.error("Erreur lors de la déconnexion côté API:", error);
            // On continue la déconnexion côté client même en cas d'échec API
        }
        
        // Nettoyage du localStorage et de l'état
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
    };

    // Ne rend les enfants que lorsque le chargement initial est terminé
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Initialisation de la session...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
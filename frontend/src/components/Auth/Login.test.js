// src/components/Auth/Login.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/API';

// --- MOCK DE L'API ET DU CONTEXTE ---

// 1. Mock de l'API (simule l'appel HTTP)
jest.mock('../../services/API', () => ({
    loginUser: jest.fn(),
}));

// 2. Mock du Contexte d'Authentification (simule le hook useAuth)
// C'est essentiel car le composant Login appelle login et utilise navigate
const mockLogin = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Utilise les vrais composants (Link)
    useNavigate: () => mockNavigate, // Simule useNavigate
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        login: mockLogin,
    }),
}));

// --- SCÉNARIOS DE TEST ---

describe('Composant Login', () => {
    // Nettoyer les mocks entre chaque test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('doit rendre le formulaire avec tous les champs requis', () => {
        render(<Login />);
        
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    });

    it('doit afficher une erreur de validation pour les champs vides à la soumission', async () => {
        render(<Login />);
        
        // Simuler la soumission sans remplir les champs
        fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
        
        // Attendre que les messages d'erreur de React Hook Form apparaissent
        await waitFor(() => {
            expect(screen.getByText(/L'email est requis/i)).toBeInTheDocument();
            expect(screen.getByText(/Le mot de passe est requis/i)).toBeInTheDocument();
        });
        
        // L'API ne devrait PAS être appelée
        expect(loginUser).not.toHaveBeenCalled();
    });

    it('doit appeler la fonction login en cas de succès de la connexion', async () => {
        // Simuler une réponse de connexion réussie de l'API
        loginUser.mockResolvedValue({ 
            data: { 
                token: 'fake-token', 
                user: { id: 1, name: 'Test' } 
            } 
        });
        
        render(<Login />);

        // 1. Remplir les champs
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@organisateur.com' } });
        fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });

        // 2. Soumettre le formulaire
        fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

        // 3. Attendre la résolution de l'appel API
        await waitFor(() => {
            // Vérifier que l'API a été appelée avec les données correctes
            expect(loginUser).toHaveBeenCalledWith({
                email: 'test@organisateur.com',
                password: 'password123',
            });
            
            // Vérifier que la fonction de contexte `login` a été appelée pour stocker le token
            expect(mockLogin).toHaveBeenCalledWith({ 
                token: 'fake-token', 
                user: { id: 1, name: 'Test' } 
            });
        });
        
        // 4. L'utilisateur doit être redirigé vers l'espace organisateur
        expect(mockNavigate).toHaveBeenCalledWith('/organisateur/evenements', { replace: true });
    });

    it('doit afficher un message d\'erreur en cas d\'échec de la connexion (mauvaises infos)', async () => {
        // Simuler une réponse d'erreur de l'API (ex: 401 Unauthorized)
        loginUser.mockRejectedValue({ 
            response: { 
                data: { message: 'Identifiants invalides.' } 
            } 
        });
        
        render(<Login />);
        
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'mauvais@email.com' } });
        fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'mauvaispass' } });
        fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

        // Attendre que l'erreur soit affichée à l'utilisateur
        await waitFor(() => {
            expect(screen.getByText(/Identifiants invalides./i)).toBeInTheDocument();
        });
        
        // S'assurer qu'aucune redirection n'a eu lieu
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
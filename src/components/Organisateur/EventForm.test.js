// src/components/Organisateur/EventForm.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventForm from './EventForm';

// Importe les fonctions API à simuler (mocks)
import { createEvent, updateEvent, fetchEventDetails } from '../../services/API';

// --- MOCK DES DÉPENDANCES ---

// 1. Mock de l'API : Simule les appels HTTP
jest.mock('../../services/API', () => ({
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    fetchEventDetails: jest.fn(),
}));

// 2. Mock de React Router DOM : Simule la navigation et les paramètres d'URL
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    // Simule useParams pour les modes de modification
    useParams: jest.fn(), 
}));

// --- CONFIGURATION DES TESTS ---

// Utilisé pour simplifier l'accès aux champs
const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/Titre de l'événement/i), { target: { value: 'Concert de Test' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Description du concert' } });
    fireEvent.change(screen.getByLabelText(/Lieu/i), { target: { value: 'Zénith de Paris' } });
    fireEvent.change(screen.getByLabelText(/Date et Heure/i), { target: { value: '2025-10-31T20:00' } });
    fireEvent.change(screen.getByLabelText(/Capacité maximale/i), { target: { value: '5000' } });
};

describe('Composant EventForm', () => {
    // Nettoyage avant chaque test
    beforeEach(() => {
        jest.clearAllMocks();
        // S'assurer que useParams ne retourne rien par défaut (mode Création)
        require('react-router-dom').useParams.mockReturnValue({}); 
    });

    // =============================================================
    // SCÉNARIO 1 : MODE CRÉATION (isEditMode = false)
    // =============================================================

    it('doit rendre le titre "Créer un nouvel événement" en mode création', () => {
        render(<EventForm />);
        expect(screen.getByText(/Créer un nouvel événement/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Créer l'événement/i })).toBeInTheDocument();
    });
    
    it('doit afficher des erreurs de validation pour les champs requis', async () => {
        render(<EventForm />);
        
        // Soumettre le formulaire vide
        fireEvent.click(screen.getByRole('button', { name: /Créer l'événement/i }));
        
        // Attendre que les messages d'erreur de React Hook Form apparaissent
        await waitFor(() => {
            // Vérifier que plusieurs messages d'erreur apparaissent
            expect(screen.getAllByText(/Ce champ est requis/i).length).toBeGreaterThanOrEqual(4); 
        });
        
        expect(createEvent).not.toHaveBeenCalled();
    });

    it('doit appeler createEvent et rediriger en cas de succès de la création', async () => {
        // Simuler une réponse de création réussie
        createEvent.mockResolvedValue({ data: { id: 1, title: 'Concert de Test' } });
        
        render(<EventForm />);
        
        // Remplir le formulaire
        fillForm();
        
        // Soumettre
        fireEvent.click(screen.getByRole('button', { name: /Créer l'événement/i }));
        
        await waitFor(() => {
            // Vérifier que l'API de création a été appelée
            expect(createEvent).toHaveBeenCalledTimes(1);
        });
        
        // Vérifier la redirection vers la liste des événements de l'organisateur
        expect(mockNavigate).toHaveBeenCalledWith('/organisateur/evenements');
    });
    
    it('doit afficher un message d\'erreur si l\'appel createEvent échoue', async () => {
        // Simuler une erreur API (ex: 500 ou erreur de validation backend)
        createEvent.mockRejectedValue({ response: { data: { message: 'Erreur de serveur' } } });
        
        render(<EventForm />);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /Créer l'événement/i }));

        await waitFor(() => {
            // L'erreur doit être affichée dans le composant
            expect(screen.getByText(/Erreur de serveur/i)).toBeInTheDocument();
        });
        
        expect(mockNavigate).not.toHaveBeenCalled();
    });


    // =============================================================
    // SCÉNARIO 2 : MODE MODIFICATION (isEditMode = true)
    // =============================================================

    it('doit rendre le titre "Modifier l\'événement" et pré-remplir les champs en mode modification', async () => {
        const MOCKED_EVENT_ID = '99';
        
        // Configure useParams pour l'ID de l'événement à modifier
        require('react-router-dom').useParams.mockReturnValue({ id: MOCKED_EVENT_ID });
        
        // Simuler les données de l'événement existant
        fetchEventDetails.mockResolvedValue({ 
            data: { 
                id: 99, 
                title: 'Ancien Titre', 
                description: 'Ancienne description',
                location: 'Vieux Lieu',
                // Le format doit être compatible avec l'input type="datetime-local" (YYYY-MM-DDTHH:mm)
                date: '2024-12-24T18:00:00.000000Z', 
                capacity: 100
            } 
        });
        
        render(<EventForm isEditMode={true} />);
        
        // 1. Vérifier le titre et l'appel de chargement
        expect(screen.getByText(/Chargement des données/i)).toBeInTheDocument();
        
        // 2. Attendre que les données soient chargées
        await waitFor(() => {
            expect(fetchEventDetails).toHaveBeenCalledWith(MOCKED_EVENT_ID);
        });
        
        // 3. Vérifier que le formulaire est en mode modification
        expect(screen.getByText(/Modifier l'événement/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enregistrer les modifications/i })).toBeInTheDocument();
        
        // 4. Vérifier que les champs sont pré-remplis
        expect(screen.getByLabelText(/Titre de l'événement/i)).toHaveValue('Ancien Titre');
        expect(screen.getByLabelText(/Capacité maximale/i)).toHaveValue(100);
        // La date est un peu plus délicate à vérifier dans RTL, mais on peut vérifier le titre
    });


    it('doit appeler updateEvent et rediriger en cas de succès de la modification', async () => {
        const MOCKED_EVENT_ID = '99';
        
        require('react-router-dom').useParams.mockReturnValue({ id: MOCKED_EVENT_ID });
        
        // 1. Simuler le chargement initial des données
        fetchEventDetails.mockResolvedValue({ 
            data: { 
                id: 99, 
                title: 'Titre Initial', 
                description: 'Desc', 
                location: 'Lieu',
                date: '2024-12-24T18:00:00.000000Z', 
                capacity: 100
            } 
        });
        
        // 2. Simuler la réponse de modification réussie
        updateEvent.mockResolvedValue({});
        
        const { getByRole } = render(<EventForm isEditMode={true} />);

        // Attendre que le chargement initial soit terminé
        await waitFor(() => {
            expect(fetchEventDetails).toHaveBeenCalled();
        });
        
        // 3. Modifier un champ
        fireEvent.change(screen.getByLabelText(/Titre de l'événement/i), { target: { value: 'Nouveau Titre' } });

        // 4. Soumettre le formulaire
        fireEvent.click(getByRole('button', { name: /Enregistrer les modifications/i }));

        await waitFor(() => {
            // Vérifier que la fonction updateEvent a été appelée avec le bon ID
            expect(updateEvent).toHaveBeenCalledTimes(1);
            expect(updateEvent.mock.calls[0][0]).toBe(MOCKED_EVENT_ID); // 1er argument est l'ID
        });

        // 5. Vérifier la redirection
        expect(mockNavigate).toHaveBeenCalledWith('/organisateur/evenements');
    });
});
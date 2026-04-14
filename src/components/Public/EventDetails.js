// src/components/Public/EventDetails.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventDetails } from '../../services/API';
import EventRegistrationForm from './EventRegistrationForm'; // Sous-composant pour le formulaire

// Liste des catégories pour l'affichage
const categories = [
    { id: '1', name: 'Musique' },
    { id: '2', name: 'Conférence' },
    { id: '3', name: 'Sport' },
    { id: '4', name: 'Art & Culture' },
    { id: '5', name: 'Technologie' },
    { id: '6', name: 'Éducation' },
];

const EventDetails = () => {
    // Récupère l'ID de l'événement depuis l'URL (défini dans App.js : /evenement/:id)
    const { id } = useParams(); 
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDetails = async () => {
            setIsLoading(true);
            setError(null);
            setEvent(null);

            try {
                // Appel de l'API pour récupérer les détails de l'événement
                const response = await fetchEventDetails(id);
                setEvent(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des détails:", err);
                setError("Désolé, impossible de trouver cet événement ou le serveur est indisponible.");
            } finally {
                setIsLoading(false);
            }
        };

        // Assurez-vous que l'ID est bien là avant de charger
        if (id) {
            loadDetails();
        }
    }, [id]); 


    // --- Rendu conditionnel ---

    if (isLoading) {
        return <div className="loading-state" style={{ textAlign: 'center', padding: '50px' }}>Chargement des détails de l'événement... ⏳</div>;
    }

    if (error) {
        return <div className="error-state alert-error" style={{ color: '#dc3545', border: '1px solid #dc3545', padding: '15px' }}>{error}</div>;
    }

    if (!event) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Événement non disponible.</div>;
    }
    
    // Calcul de la date et de l'heure formatées
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Récupération du nom de la catégorie
    const categoryName = categories.find(cat => cat.id === event.category_id?.toString())?.name || 'Non catégorisé';

    // --- Rendu final ---

    return (
        <div className="event-details-container">
            {/* En-tête avec titre et catégorie */}
            <div className="event-header">
                <div className="event-title-section">
                    <h1 className="event-main-title">{event.title}</h1>
                    <div className="event-category-badge">
                        <span className="icon">🏷️</span>
                        {categoryName}
                    </div>
                </div>
            </div>

            <div className="event-details-layout">
                {/* Colonne des Détails */}
                <div className="event-details-content">
                    {/* Informations principales */}
                    <div className="event-info-card">
                        <div className="info-item">
                            <span className="icon">📅</span>
                            <div>
                                <strong>Date et heure</strong>
                                <p>{formattedDate} à {formattedTime}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="icon">📍</span>
                            <div>
                                <strong>Lieu</strong>
                                <p>{event.location}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="icon">👥</span>
                            <div>
                                <strong>Places disponibles</strong>
                                <p className={event.capacity > 10 ? 'capacity-good' : 'capacity-low'}>
                                    {event.capacity} places
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="event-description-card">
                        <h2>À propos de l'événement</h2>
                        <div className="description-content">
                            {event.description}
                        </div>
                    </div>
                </div>

                {/* Colonne du Formulaire d'Inscription */}
                <div className="event-registration-sidebar">
                    <div className="registration-card">
                        <h2>Inscription à l'événement</h2>
                        {event.capacity > 0 ? (
                            <EventRegistrationForm eventId={event.id} />
                        ) : (
                            <div className="event-full-notice">
                                <span className="icon">⚠️</span>
                                <p>Désolé, l'événement est complet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
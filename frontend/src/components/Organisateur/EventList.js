// src/components/Organisateur/EventList.js (Aucune modification nécessaire)

import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyEvents, deleteEvent } from '../../services/API';
import { Link } from 'react-router-dom';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null); 

    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setNotification(null); 

        try {
            // Cette requête devrait maintenant fonctionner grâce à la correction dans AuthContext.js
            const response = await fetchMyEvents(); 
            setEvents(response.data); 
        } catch (err) {
            console.error("Erreur lors du chargement des événements:", err);
            // 🔑 Amélioration de la gestion d'erreur 401/403:
            let errorMessage = "Impossible de charger les événements. Vérifiez votre connexion.";
            if (err.response?.status === 401 || err.response?.status === 403) {
                 errorMessage = "Accès refusé. Veuillez vous déconnecter et vous reconnecter pour rafraîchir la session.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []); 

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);


    const handleDelete = async (eventId, eventTitle) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement : "${eventTitle}" ? Cette action est irréversible.`)) {
            return;
        }

        try {
            setNotification({ type: 'info', message: `Suppression de l'événement en cours...` });

            await deleteEvent(eventId);
            
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            
            setNotification({ type: 'success', message: `L'événement "${eventTitle}" a été supprimé avec succès.` });

        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            
            let errorMessage = `Erreur: Impossible de supprimer l'événement. Le serveur a renvoyé une erreur.`;
            if (err.response?.status === 419) {
                 errorMessage = "Erreur de sécurité (419) : Le jeton CSRF a expiré. Veuillez vous reconnecter et réessayer l'action.";
            } else if (err.response?.status === 403) {
                 errorMessage = "Accès refusé. Vérifiez que vous avez la permission de supprimer cet événement.";
            }
            
            setNotification({ type: 'error', message: errorMessage });
        }
    };


    const NotificationDisplay = () => {
        if (!notification) return null;
        
        const alertClass = 
            notification.type === 'success' ? 'alert-success' : 
            notification.type === 'error' ? 'alert-danger' : 
            'alert';

        return <div className={`alert ${alertClass}`}>{notification.message}</div>;
    };


    if (isLoading) {
        return <div className="loading-state">Chargement de vos événements... ⏳</div>;
    }

    return (
        <div className="event-list-container">
            <header className="list-header">
                <h2>Mes Événements Publiés ({events.length})</h2> 
                <Link to="/organisateur/nouveau" className="btn-primary">
                    + Ajouter un nouvel événement
                </Link>
            </header>

            <NotificationDisplay /> 

            {error && <div className="alert alert-danger">{error}</div>}

            {events.length === 0 ? (
                <div className="empty-state">
                    <p>Vous n'avez pas encore publié d'événement.</p>
                    <Link to="/organisateur/nouveau">Commencez ici !</Link>
                </div>
            ) : (
                <div className="list-grid">
                    {events.map((event) => (
                        <div key={event.id} className="event-card">
                            <h3>{event.title}</h3>
                            <p>Lieu : {event.location || event.lieu || 'Non spécifié'}</p>
                            <div className="card-actions">
                                <Link 
                                    to={`/organisateur/modifier/${event.id}`} 
                                    className="btn-secondary"
                                >
                                    Modifier
                                </Link>
                                <button 
                                    onClick={() => handleDelete(event.id, event.title)} 
                                    className="btn-danger"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;
// src/components/Organisateur/EventCardOrganisateur.js

import React from 'react';
import { Link } from 'react-router-dom';

const EventCardOrganisateur = ({ event, onDelete }) => {
    // 🔑 Assurez-vous que les propriétés correspondent à vos données (id, title, location, date)
    const { id, title, location, date } = event;
    
    // Formatage de la date pour un affichage lisible
    const formattedDate = date ? new Date(date).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Date/Heure non spécifiée';

    return (
        <div className="event-card-organisateur">
            
            <div className="event-info-section">
                <h3 className="event-title-organisateur">{title}</h3>
                
                <p className="event-detail">
                    <span className="icon">📍</span> Lieu : **{location}**
                </p>
                
                <p className="event-detail">
                    <span className="icon">📅</span> Date et Heure : **{formattedDate}**
                </p>
            </div>

            <div className="event-actions-section">
                <Link 
                    to={`/organisateur/modifier/${id}`} 
                    className="btn-secondary"
                >
                    Modifier
                </Link>
                
                <button 
                    onClick={() => onDelete(id)} 
                    className="btn-danger"
                >
                    Supprimer
                </button>
            </div>
        </div>
    );
};

export default EventCardOrganisateur;
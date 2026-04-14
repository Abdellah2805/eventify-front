// src/components/Public/HomePage.js (FINAL CSS-FRIENDLY)

import React, { useState, useEffect, useCallback } from 'react';
import { fetchPublicEvents } from '../../services/API';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'; 

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { register, handleSubmit } = useForm();
    
    // États de pagination et filtres
    const [currentFilters, setCurrentFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);

    const loadEvents = useCallback(async (filters, page) => {
        setIsLoading(true);
        setError(null);

        const params = { ...filters, page };

        try {
            const response = await fetchPublicEvents(params);
            
            const data = response.data;
            
            setEvents(data.data || []); 
            setCurrentPage(data.current_page || 1);
            setLastPage(data.last_page || 1);
            setTotalEvents(data.total || 0);

        } catch (err) {
            // L'erreur affichée sur la capture d'écran se produit ici. 
            // C'est souvent un problème CORS ou une API éteinte.
            console.error("Erreur lors du chargement des événements publics:", err);
            setError("Impossible de charger les événements. Veuillez réessayer plus tard.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents(currentFilters, currentPage);
    }, [currentFilters, currentPage, loadEvents]);


    const onSearchSubmit = (data) => {
        const validFilters = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v)
        );
        setCurrentPage(1);
        setCurrentFilters(validFilters);
    };
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };


    const categories = [
        { id: '', name: 'Toutes les catégories' },
        { id: '1', name: 'Musique' },
        { id: '2', name: 'Conférence' },
        { id: '3', name: 'Sport' },
        { id: '4', name: 'Art & Culture' },
        { id: '5', name: 'Technologie' },
        { id: '6', name: 'Éducation' },
    ];
    
    
    // Composant de Contrôles de Pagination (Utilise les classes)
    const PaginationControls = () => {
        if (lastPage <= 1) return null;

        return (
            <div className="pagination-controls">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="btn-secondary" // Utilisation de la classe
                >
                    &larr; Précédent
                </button>
                
                <span className="pagination-info">
                    Page {currentPage} sur {lastPage} (Total: {totalEvents} événements)
                </span>
                
                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage || isLoading}
                    className="btn-secondary" // Utilisation de la classe
                >
                    Suivant &rarr;
                </button>
            </div>
        );
    };


    return (
        <div className="homepage-container">
            <h1>Découvrez les prochains événements Eventify</h1>
            
            {/* Utilisation de la classe search-form (mise en page via CSS externe) */}
            <form onSubmit={handleSubmit(onSearchSubmit)} className="search-form">
                <div className="form-row">
                    
                    <div className="form-group search-input">
                        <label htmlFor="search">Rechercher par titre ou lieu</label>
                        <input id="search" type="text" placeholder="Ex: Concert de rock à Paris" {...register('search')} />
                    </div>

                    <div className="form-group filter-input">
                        <label htmlFor="category_id">Catégorie</label>
                        <select id="category_id" {...register('category_id')}>
                            {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                    </div>

                    <div className="form-group filter-input">
                        <label htmlFor="date">À partir de (Date)</label>
                        <input id="date" type="date" {...register('date')} />
                    </div>
                    
                    <button type="submit" className="btn-primary search-button">
                        Rechercher
                    </button>
                </div>
            </form>

            {isLoading && <div className="loading-state">Chargement des événements... ⏳</div>}
            {/* Utilisation de la classe alert-danger */}
            {error && <div className="alert alert-danger">{error}</div>}

            {!isLoading && !error && events.length > 0 && (
                <>
                    <PaginationControls />
                    
                    <PaginationControls />
                    
                    <div className="event-public-list">
                        {events.map((event) => {
                            const categoryName = categories.find(cat => cat.id === event.category_id?.toString())?.name || 'Non catégorisé';
                            return (
                                <div key={event.id} className="event-card-public">
                                    <h3 className="event-title">{event.title}</h3>

                                    {/* Catégorie */}
                                    <p>
                                        <span className="icon">🏷️</span>
                                        {categoryName}
                                    </p>

                                    {/* Lieu */}
                                    <p>
                                        <span className="icon">📍</span>
                                        {event.location}
                                    </p>

                                    {/* Date */}
                                    <p>
                                        <span className="icon">📅</span>
                                        {new Date(event.date).toLocaleString('fr-FR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>

                                    {/* Lien de Détail */}
                                    <Link to={`/evenement/${event.id}`} className="details-link">
                                        Voir les détails →
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                    
                    <PaginationControls />
                </>
            )}
            
            {!isLoading && !error && events.length === 0 && (
                 <div className="empty-state">
                    <p>Aucun événement ne correspond à vos critères de recherche.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
// src/components/Organisateur/EventForm.js

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// 🔑 updateEvent et createEvent incluent déjà la gestion du CSRF (voir API.js)
import { createEvent, updateEvent, fetchEventDetails } from '../../services/API'; 

const EventForm = ({ isEditMode = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    
    // États
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitMessage, setSubmitMessage] = useState(null); 
    
    
    // Fonction de chargement pour le mode modification
    const loadEventDetails = useCallback(async () => {
        if (!id) return;

        try {
            const response = await fetchEventDetails(id);
            const eventData = response.data;

            // Formater la date pour l'input datetime-local (YYYY-MM-DDTHH:mm)
            const formattedDate = eventData.date ? eventData.date.substring(0, 16) : '';

            reset({
                title: eventData.title,
                description: eventData.description,
                location: eventData.location,
                date: formattedDate,
                capacity: eventData.capacity,
                category_id: eventData.category_id,
            });
        } catch (error) {
            setSubmitError("Erreur lors du chargement des détails de l'événement.");
        } finally {
            setIsLoading(false);
        }
    }, [id, reset]);

    useEffect(() => {
        if (isEditMode) {
            loadEventDetails();
        } else {
            setIsLoading(false); // Pas de chargement en mode création
        }
    }, [isEditMode, loadEventDetails]);
    
    
    // Fonction de soumission (Création ou Modification)
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitMessage(null);

        try {
            if (isEditMode) {
                // L'appel utilise updateEvent qui gère le CSRF et la méthode PUT
                await updateEvent(id, data);
                setSubmitMessage({ type: 'success', text: 'Événement mis à jour avec succès ! Redirection...' });
            } else {
                // L'appel utilise createEvent qui gère le CSRF et la méthode POST
                await createEvent(data);
                setSubmitMessage({ type: 'success', text: 'Événement créé avec succès ! Redirection vers la liste...' });
            }

            // Délai de 1.5s avant la navigation pour garantir l'affichage du message de succès
            setTimeout(() => {
                navigate('/organisateur/evenements', { replace: true });
            }, 1500); 

        } catch (error) {
            console.error("Erreur de soumission:", error);
            
            // 🔑 CORRECTION CLÉ : Gestion spécifique du 419 (CSRF Mismatch)
            let errorMessage = "Erreur de serveur. Veuillez vérifier les données.";
            
            if (error.response?.status === 419) {
                errorMessage = "Échec de sécurité (419) : La session a expiré. Veuillez vous déconnecter et vous reconnecter.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setSubmitError(errorMessage);
            
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return <div className="loading-state">Chargement des données... ⏳</div>;
    }

    return (
        <div className="form-container">
            <h2>{isEditMode ? 'Modifier l\'événement' : 'Créer un nouvel événement'}</h2>
            
            {/* Affichage du message de succès ou d'erreur */}
            {submitMessage && (
                <div className={`alert alert-${submitMessage.type}`}>{submitMessage.text}</div>
            )}
            {submitError && <div className="alert alert-danger">{submitError}</div>}
            
            <form onSubmit={handleSubmit(onSubmit)}>
                
                {/* Champ Titre */}
                <div className="form-group">
                    <label htmlFor="title">Titre de l'événement</label>
                    <input id="title" type="text" {...register('title', { required: "Le titre est requis" })} />
                    {errors.title && <p className="error-message">{errors.title.message}</p>}
                </div>

                {/* Champ Description */}
                <div className="form-group">
                    <label htmlFor="description">Description détaillée</label>
                    <textarea id="description" rows="4" {...register('description', { required: "La description est requise" })}></textarea>
                    {errors.description && <p className="error-message">{errors.description.message}</p>}
                </div>
                
                {/* Champ Date et Heure */}
                <div className="form-group">
                    <label htmlFor="date">Date et Heure de l'événement</label>
                    <input id="date" type="datetime-local" {...register('date', { required: "La date et l'heure sont requises" })} />
                    {errors.date && <p className="error-message">{errors.date.message}</p>}
                </div>
                
                {/* Champ Lieu */}
                <div className="form-group">
                    <label htmlFor="location">Lieu (Ville, Adresse)</label>
                    <input id="location" type="text" {...register('location', { required: "Le lieu est requis" })} />
                    {errors.location && <p className="error-message">{errors.location.message}</p>}
                </div>
                
                {/* Champ Capacité */}
                <div className="form-group">
                    <label htmlFor="capacity">Nombre de places disponibles</label>
                    <input id="capacity" type="number" {...register('capacity', {
                        required: "La capacité est requise",
                        min: { value: 1, message: "Doit être au moins 1" }
                    })} />
                    {errors.capacity && <p className="error-message">{errors.capacity.message}</p>}
                </div>

                {/* Champ Catégorie */}
                <div className="form-group">
                    <label htmlFor="category_id">Catégorie</label>
                    <select id="category_id" {...register('category_id')}>
                        <option value="">Sélectionner une catégorie</option>
                        <option value="1">Musique</option>
                        <option value="2">Conférence</option>
                        <option value="3">Sport</option>
                        <option value="4">Art & Culture</option>
                        <option value="5">Technologie</option>
                        <option value="6">Éducation</option>
                    </select>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Soumission en cours...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer l\'événement')}
                </button>
            </form>
        </div>
    );
};

export default EventForm;
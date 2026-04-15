// src/components/Public/EventRegistrationForm.js

import { useState } from 'react';
import { useForm } from 'react-hook-form';

const EventRegistrationForm = ({ eventId }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // Pour la confirmation / erreur

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setFeedback(null);

        try {
            
            // Si Laravel retourne 201 Created (ou 200 OK)
            setFeedback({ 
                type: 'success', 
                message: `Inscription réussie pour ${data.email} ! Une confirmation a été envoyée.` 
            });
            reset(); // Réinitialise les champs du formulaire

        } catch (error) {
            console.error("Erreur d'inscription:", error);
            
            // Gestion des erreurs de validation de Laravel ou d'autres erreurs spécifiques
            const errorMessage = error.response?.data?.message 
                               || error.response?.data?.errors?.email?.[0] // Exemple d'erreur spécifique Laravel
                               || "Une erreur est survenue lors de l'inscription.";

            setFeedback({ 
                type: 'error', 
                message: errorMessage
            });

        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="registration-form">

            <div className="form-intro">
                <span className="icon">📝</span>
                <p>Veuillez remplir le formulaire ci-dessous pour réserver votre place.</p>
            </div>

            {/* Champ Nom */}
            <div className="form-group">
                <label htmlFor="name">Votre Nom et Prénom</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Ex: Jean Dupont"
                    {...register('name', { required: 'Votre nom est requis' })}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>

            {/* Champ Email */}
            <div className="form-group">
                <label htmlFor="email">Votre Email (pour la confirmation)</label>
                <input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    {...register('email', {
                        required: 'Votre email est requis',
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Format d\'email invalide'
                        }
                    })}
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary registration-submit">
                {isSubmitting ? (
                    <>
                        <span className="icon">⏳</span>
                        Enregistrement...
                    </>
                ) : (
                    <>
                        <span className="icon">✅</span>
                        Confirmer mon inscription
                    </>
                )}
            </button>

            {/* Affichage du Feedback */}
            {feedback && (
                <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} registration-feedback`}>
                    {feedback.message}
                </div>
            )}

        </form>
    );
};

export default EventRegistrationForm;
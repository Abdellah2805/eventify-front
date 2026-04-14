// src/components/Auth/Register.js

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/API';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Pour valider que le mot de passe et sa confirmation correspondent
    const password = watch('password'); 

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // L'API de Laravel attend 'name', 'email', 'password', 'password_confirmation'
            const response = await registerUser(data);
            
            // Appeler la fonction de contexte pour stocker le token et l'utilisateur
            login(response.data); 
            
            // Rediriger vers l'espace organisateur
            navigate('/organisateur/evenements', { replace: true });

        } catch (error) {
            console.error("Erreur d'inscription:", error);
            // Tente d'afficher une erreur spécifique de Laravel (ex: email déjà pris)
            const emailError = error.response?.data?.errors?.email?.[0];
            const errorMessage = emailError || error.response?.data?.message || "Échec de l'inscription. Veuillez vérifier vos informations.";
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Utilisation de la classe CSS pour le conteneur
        <div className="form-container">
            <h2>Créer un compte Eventify</h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Champ Nom / Organisation */}
                <div className="form-group">
                    <label htmlFor="name">Nom / Organisation</label>
                    <input
                        id="name"
                        type="text"
                        {...register('name', { required: "Le nom est requis" })}
                    />
                    {errors.name && <p className="error-message">{errors.name.message}</p>}
                </div>

                {/* Champ Email */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register('email', { required: "L'email est requis" })}
                    />
                    {errors.email && <p className="error-message">{errors.email.message}</p>}
                </div>

                {/* Champ Mot de passe */}
                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password', { 
                            required: "Le mot de passe est requis",
                            minLength: { value: 8, message: "Minimum 8 caractères" }
                        })}
                    />
                    {errors.password && <p className="error-message">{errors.password.message}</p>}
                </div>

                {/* Champ Confirmer le mot de passe */}
                <div className="form-group">
                    <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        {...register('password_confirmation', {
                            required: "La confirmation du mot de passe est requise",
                            validate: value => 
                                value === password || "Les mots de passe ne correspondent pas"
                        })}
                    />
                    {errors.password_confirmation && <p className="error-message">{errors.password_confirmation.message}</p>}
                </div>

                {/* Affichage de l'erreur de soumission */}
                {submitError && <div className="alert alert-danger">{submitError}</div>}

                {/* Bouton de Soumission */}
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Déjà un compte ? <Link to="/login">Connectez-vous ici</Link>
            </p>
        </div>
    );
};

export default Register;
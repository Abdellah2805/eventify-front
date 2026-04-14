// src/components/Header/Header.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Importez votre hook d'authentification ici (ex: import { useAuth } from '../../context/AuthContext';)

const Header = () => {
    // 🔑 État pour gérer l'ouverture/fermeture du menu mobile
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- SIMULATION D'AUTHENTIFICATION (à remplacer par votre logique réelle) ---
    // En se basant sur vos captures d'écran, l'utilisateur est souvent connecté.
    const isAuthenticated = true; 
    // const { isAuthenticated, logout } = useAuth(); // Votre logique réelle

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Gestion du scroll du body quand le menu est ouvert
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }

        // Cleanup au démontage du composant
        return () => {
            document.body.classList.remove('menu-open');
        };
    }, [isMenuOpen]);

    return (
        <nav>
            <Link to="/" className="eventify-logo">
                Eventify
            </Link>

            {/* 🔑 Bouton Burger (le code CSS le rend visible uniquement sur mobile) */}
            <button className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
            </button>

            {/* 🔑 Navigation : la classe 'active' est ajoutée quand le menu est ouvert */}
            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                {/* Bouton de fermeture */}
                <button className="menu-close" onClick={closeMenu} aria-label="Fermer le menu">
                    ✕
                </button>

                <Link to="/" className="nav-link" onClick={closeMenu}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">Accueil</span>
                </Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/organisateur/evenements" className="nav-link" onClick={closeMenu}>
                            <span className="nav-icon">🎭</span>
                            <span className="nav-text">Mon Espace Organisateur</span>
                        </Link>
                        <div className="menu-divider"></div>
                        <button
                            onClick={() => {
                                closeMenu();
                                // Insérez ici votre fonction de déconnexion réelle (ex: logout())
                            }}
                            className="btn-danger"
                        >
                            <span className="nav-icon">🚪</span>
                            <span className="nav-text">Déconnexion</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-secondary" onClick={closeMenu}>
                            <span className="nav-icon">🔐</span>
                            <span className="nav-text">Connexion</span>
                        </Link>
                        <Link to="/register" className="btn-primary" onClick={closeMenu}>
                            <span className="nav-icon">✨</span>
                            <span className="nav-text">Inscription</span>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Header;
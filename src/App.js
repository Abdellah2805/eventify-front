// src/App.js

import React, { useState } from 'react'; // 🔑 Importation de useState
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Composants d'Authentification Organisateur
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

// Composants de l'Espace Organisateur (Protégé)
import ProtectedRoute from './components/ProtectedRoute'; 
import EventList from './components/Organisateur/EventList';
import EventForm from './components/Organisateur/EventForm';

// Composants Publics (Utilisateur Final)
import HomePage from './components/Public/HomePage'; 
import EventDetails from './components/Public/EventDetails'; 
// Assurez-vous d'avoir importé le CSS dans src/index.js ou ici pour les styles globaux
import './styles/App.css'; 

// --- Composant de Navigation Modulaire ---

const NavMenu = () => {
    // 🔑 État pour gérer l'ouverture/fermeture du menu mobile
    const [isOpen, setIsOpen] = useState(false);
    
    // 🔑 Fonction pour basculer l'état
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    
    const { isAuthenticated, logout } = useAuth();
    
    // Les styles de navigation sont maintenant gérés entièrement par App.css
    return (
        <nav>
            {/* Logo, utilisant la classe CSS eventify-logo */}
            <Link to="/" className="eventify-logo" onClick={() => setIsOpen(false)}>Eventify</Link>
            
            {/* 🔑 Bouton Hamburger (Visible sur mobile) */}
            <button className={`menu-toggle ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-expanded={isOpen}>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
            </button>
            
            {/* 🔑 Conteneur des liens avec la classe 'active' conditionnelle */}
            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Accueil</Link> 
                
                {!isAuthenticated && (
                    <>
                        <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Connexion Organisateur</Link> 
                        <Link 
                            to="/register" 
                            className="btn-primary" 
                            onClick={() => setIsOpen(false)}
                        >
                            Inscription Organisateur
                        </Link> 
                    </>
                )}
                
                {isAuthenticated && (
                    <>
                        <Link to="/organisateur/evenements" className="nav-link" onClick={() => setIsOpen(false)}>Mon Espace Organisateur</Link> 
                        <button 
                            // 🔑 Ferme le menu après déconnexion
                            onClick={() => {logout(); setIsOpen(false);}} 
                            className="btn-danger"
                        >
                            Déconnexion
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

// --- Composant Principal de l'Application ---

function App() {
    return (
        <Router>
            {/* AuthProvider entoure tout pour que l'état d'auth soit globalement accessible */}
            <AuthProvider> 
                <NavMenu /> 
                
                <main className="main-content">
                    <Routes>
                        
                        {/* 🌎 Routes Publiques */}
                        <Route path="/" element={<HomePage />} /> 
                        <Route path="/evenement/:id" element={<EventDetails />} /> 
                        
                        {/* Pages d'Authentification Organisateur */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        
                        
                        {/* 🔑 Routes Protégées (Espace Organisateur) */}
                        <Route element={<ProtectedRoute />}>
                            
                            <Route path="/organisateur/evenements" element={<EventList />} /> 
                            <Route path="/organisateur/nouveau" element={<EventForm />} />
                            <Route path="/organisateur/modifier/:id" element={<EventForm isEditMode={true} />} />
                            
                        </Route>
                        
                        {/* Route par défaut (Page 404) */}
                        <Route path="*" element={
                            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                <h2 style={{ color: '#ff6700' }}>404 - Page Non Trouvée</h2>
                                <p>Désolé, cette adresse n'existe pas !</p>
                                <Link to="/" style={{ color: '#007bff', fontWeight: 'bold' }}>Retour à l'accueil</Link>
                            </div>
                        } />
                    </Routes>
                </main>
            </AuthProvider>
        </Router>
    );
}

export default App;
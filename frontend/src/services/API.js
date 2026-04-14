// src/services/API.js

import axios from 'axios';

// 💡 ATTENTION : Configure l'URL de base de ton backend Laravel
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fonction pour obtenir la valeur d'un cookie par son nom.
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    // 🔑 CONSERVATION CRUCIALE : Permet l'envoi et la réception des cookies (session, CSRF)
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// 🔑 Intercepteur pour ajouter automatiquement le token CSRF aux requêtes
api.interceptors.request.use(config => {
    const token = getCookie('XSRF-TOKEN');
    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    return config;
}, error => {
    return Promise.reject(error);
});

/**
 * Fonction essentielle pour obtenir le cookie CSRF.
 */
const getCsrfToken = async () => {
    try {
        // C'est cette requête qui demande au serveur de nous envoyer le cookie CSRF
        await axios.get('http://localhost:8000/sanctum/csrf-cookie'); 
        console.log("CSRF cookie récupéré.");
        return true;
    } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF. Cela peut être lié à la configuration CORS/SANCTUM sur le serveur.", error);
        return false;
    }
};

/**
 * Définit le token d'authentification (Bearer Token) pour toutes les requêtes futures.
 */
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// --- Fonctions d'Authentification ---

export const registerUser = async (data) => {
    await getCsrfToken();
    return api.post('/register', data);
};

export const loginUser = async (data) => {
    await getCsrfToken();
    return api.post('/login', data);
};

export const logoutUser = async () => {
    await getCsrfToken();
    return api.post('/logout');
};

// --- Fonctions Publiques ---

export const fetchPublicEvents = (params = {}) => {
    return api.get('/events', { params: params });
};

export const fetchEventDetails = (eventId) => {
    return api.get(`/events/${eventId}`);
};

export const registerToEvent = async (eventId, userData) => {
    await getCsrfToken();
    return api.post(`/events/${eventId}/register`, userData);
};


// --- Fonctions Organisateur (Protégées par Token) ---

export const fetchMyEvents = () => {
    // Les GET n'ont pas besoin de getCsrfToken, seulement du Bearer Token (géré par AuthContext)
    return api.get('/organisateur/events');
};

export const createEvent = async (data) => {
    await getCsrfToken();
    return api.post('/organisateur/events', data);
};

/**
 * Fonction pour modifier un événement existant : PUT /organisateur/events/{eventId}
 */
export const updateEvent = async (eventId, data) => {
    // 🔑 Fixe le 419 en utilisant POST avec un champ caché _method: 'PUT'
    await getCsrfToken();
    
    
    return api.put(`/organisateur/events/${eventId}`, data);

};

/**
 * Fonction pour supprimer un événement : DELETE /organisateur/events/{eventId}
 */
export const deleteEvent = async (eventId) => {
    // 🔑 Fixe le 419 en utilisant POST avec un champ caché _method: 'DELETE'
    await getCsrfToken();
    
    
    // Pour les DELETE, certains serveurs sont plus tolérants en utilisant DELETE direct
    // Mais pour la fiabilité avec CSRF, on utilise le POST/méthode.
    // Cependant, pour la suppression, nous allons essayer le DELETE direct (plus propre) avec CSRF:
    return api.delete(`/organisateur/events/${eventId}`);
    // Si la suppression ne fonctionne toujours pas, revenez à:
    // return api.post(`/organisateur/events/${eventId}`, payload);
};


export default api;
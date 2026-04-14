// src/api/axios.js (exemple)

import axios from 'axios';

// 🔑 URL de base de votre API (à ajuster)
const API_BASE_URL = 'http://localhost:8000/api'; 

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 🔑 ESSENTIEL : Permet d'envoyer les cookies (session, CSRF)
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    
});

// Dans votre fichier d'authentification ou d'API

// 🔑 Fonction pour obtenir le jeton CSRF
export const getCsrfToken = async () => {
    try {
        // 🔑 1. Appel au backend pour qu'il définisse le cookie CSRF
        // (Ceci suppose que votre backend a une route dédiée pour cela)
        await apiClient.get('/sanctum/csrf-cookie'); 
        console.log("CSRF cookie successfully retrieved.");
        return true;
    } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF", error);
        return false;
    }
};

// ...
// 🔑 AVANT votre requête de connexion ou de formulaire :
// const isCsrfReady = await getCsrfToken();
// if (isCsrfReady) { 
//    // ... faites la requête POST/PUT/DELETE
// }


export default apiClient;
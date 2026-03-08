import api from '../../../config/api.config';

/**
 * Liste tous les clients (users avec role 'client')
 */
export const getClients = async () => {
    const response = await api.get('/users');
    // Filtrer uniquement les clients (pas les admins)
    return { data: response.data.filter(u => u.role === 'client') };
};

/**
 * Récupérer les locations d'un client spécifique
 */
export const getClientRentals = async (userId) => {
    const response = await api.get(`/rentals/all`);
    const filtered = response.data.filter(r => r.user_id === userId);
    return { data: filtered };
};

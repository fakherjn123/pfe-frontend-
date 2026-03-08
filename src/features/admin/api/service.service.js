import api from '../../../config/api.config';

/**
 * Liste tous les entretiens planifiés
 */
export const getServices = async () => {
    return await api.get('/services');
};

/**
 * Alertes urgentes (assurances expirées, etc.)
 */
export const getAlerts = async () => {
    return await api.get('/services/alerts');
};

/**
 * Planifier un nouvel entretien
 */
export const createService = async (data) => {
    return await api.post('/services', data);
};

/**
 * Mettre à jour le statut d'un entretien
 */
export const updateServiceStatus = async (id, status) => {
    return await api.put(`/services/${id}/status`, { status });
};

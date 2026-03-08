import api from '../../../config/api.config';

/**
 * Statistiques gÃ©nÃ©rales (vÃ©hicules, locationsâDT¦)
 */
export const getDashboardStats = async () => {
    return await api.get('/dashboard/stats');
};

/**
 * Statistiques financiÃ¨res (revenus du mois, totalâDT¦)
 */
export const getFinancialStats = async () => {
    return await api.get('/dashboard/financial');
};

/**
 * Top 5 voitures les plus louÃ©es
 */
export const getTopCars = async () => {
    return await api.get('/dashboard/top-cars');
};

/**
 * Historique mensuel
 */
export const getMonthlyHistory = async () => {
    return await api.get('/dashboard/history');
};

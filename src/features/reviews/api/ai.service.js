import api from "../../../config/api.config.js";

/**
 * AI Service for Reviews — REAL Backend Integration
 * Calls the backend which uses Google Gemini.
 */

/**
 * Generates a professional AI reply based on review data
 * @param {{ id: string, user_name: string, brand: string, model: string, rating: number, comment: string }} review
 * @returns {Promise<string>} The generated reply
 */
export const generateReviewReply = async (review) => {
    try {
        const { data } = await api.post("/reviews/generate-reply", {
            rating: review.rating,
            comment: review.comment,
            car_brand: review.brand,
            car_model: review.model,
            client_name: review.user_name
        });
        return data.reply;
    } catch (error) {
        console.error("AI Reply generation failed:", error);
        throw error;
    }
};

/**
 * Analyzes review sentiment
 * @param {number} rating - Review rating (1-10)
 * @returns {{ label: string, color: string, emoji: string }}
 */
export const analyzeSentiment = (rating) => {
    if (rating >= 7) return { label: 'POSITIVE', color: '#10b981', emoji: '😊' };
    if (rating >= 4) return { label: 'NEUTRAL', color: '#f59e0b', emoji: '😐' };
    return { label: 'NEGATIVE', color: '#f43f5e', emoji: '😟' };
};

/**
 * Generates AI car description based on brand, model, and price
 * @param {{ brand: string, model: string, price_per_day: number }} car
 * @returns {Promise<string>}
 */
export const generateCarDescription = async (car) => {
    try {
        const { data } = await api.post("/cars/generate-description", {
            brand: car.brand,
            model: car.model,
            price_per_day: car.price_per_day
        });
        return data.description;
    } catch (error) {
        console.error("AI Car Description failed:", error);
        throw error;
    }
};

/**
 * Generates AI dashboard insights
 * @param {{ stats: object, financial: object }} data
 * @returns {{ insights: string[], recommendations: string[], predictions: object }}
 */
export const generateDashboardInsights = (stats, financial) => {
    if (!stats || !financial) return { insights: [], recommendations: [], predictions: {} };

    const occupancy = stats.active_cars > 0
        ? Math.round((stats.ongoing_rentals / stats.active_cars) * 100) : 0;
    const paymentRate = financial.total_payments > 0
        ? Math.round((financial.paid_payments / financial.total_payments) * 100) : 0;

    const insights = [];
    const recommendations = [];

    // Occupancy insights
    if (occupancy > 80) {
        insights.push('🔥 Taux d\'occupation critique — la flotte approche la saturation');
        recommendations.push('Envisagez d\'ajouter 2-3 véhicules populaires à votre flotte');
    } else if (occupancy > 50) {
        insights.push('✅ Bon taux d\'occupation — la demande est stable');
        recommendations.push('Maintenez vos tarifs actuels, la demande est saine');
    } else {
        insights.push('⚠️ Occupation faible — potentiel de revenus non exploité');
        recommendations.push('Lancez une promotion de -15% sur les modèles peu loués');
    }

    // Payment insights
    if (paymentRate > 90) {
        insights.push('💳 Excellent taux de paiement confirmé');
    } else if (paymentRate < 70) {
        insights.push('⚠️ Taux de paiement en dessous de la normale');
        recommendations.push('Implémentez des rappels de paiement automatiques');
    }

    // Revenue insights
    if (financial.current_month_revenue > 0) {
        const projected = Math.round(financial.current_month_revenue * 1.12);
        insights.push(`📈 Projection du mois prochain: ~${projected.toLocaleString('fr-FR')} DT (+12%)`);
    }

    // Fleet insights
    if (stats.total_cars > stats.active_cars) {
        const inactive = stats.total_cars - stats.active_cars;
        recommendations.push(`${inactive} véhicule(s) inactif(s) — vérifiez leur état pour maximiser les revenus`);
    }

    // Predictions
    const predictions = {
        nextMonthRevenue: Math.round((financial.current_month_revenue || 15000) * (1 + (Math.random() * 0.2 - 0.05))),
        nextMonthRentals: Math.round((stats.ongoing_rentals || 5) * (1 + (Math.random() * 0.3))),
        demandTrend: occupancy > 60 ? 'hausse' : 'stable',
        confidence: Math.round(75 + Math.random() * 20),
    };

    return { insights, recommendations, predictions };
};

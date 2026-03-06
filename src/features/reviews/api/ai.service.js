/**
 * AI Service for Reviews — Frontend Simulation
 * Generates professional auto-replies and simulates email sending.
 * Ready to be swapped with a real AI backend (e.g., Gemini, OpenAI).
 */

const POSITIVE_TEMPLATES = [
    (name, car) => `Cher(e) ${name}, merci infiniment pour votre retour positif concernant la ${car} ! Votre satisfaction est notre plus grande récompense. Nous espérons avoir le plaisir de vous revoir très bientôt. L'équipe BMZ Location reste à votre disposition.`,
    (name, car) => `Bonjour ${name}, nous sommes ravis de lire votre avis enthousiaste sur la ${car} ! Votre confiance nous motive à maintenir l'excellence de nos services. Au plaisir de vous accompagner lors de votre prochain voyage.`,
    (name, car) => `${name}, quel plaisir de recevoir votre témoignage ! La ${car} fait partie de nos modèles phares et nous sommes heureux qu'elle ait répondu à vos attentes. N'hésitez pas à nous contacter pour vos prochaines locations.`,
];

const NEUTRAL_TEMPLATES = [
    (name, car) => `Cher(e) ${name}, nous vous remercions d'avoir pris le temps de partager votre expérience avec la ${car}. Vos retours sont essentiels pour améliorer nos services. Nous serions ravis d'en discuter davantage pour rendre votre prochaine expérience encore meilleure.`,
    (name, car) => `Bonjour ${name}, merci pour votre avis sur la ${car}. Nous prenons note de vos observations et travaillons continuellement à l'amélioration de notre service. Contactez-nous si vous souhaitez partager des suggestions supplémentaires.`,
];

const NEGATIVE_TEMPLATES = [
    (name, car) => `Cher(e) ${name}, nous sommes sincèrement désolés que votre expérience avec la ${car} n'ait pas été à la hauteur de vos attentes. Nous prenons votre retour très au sérieux et notre équipe technique a été informée. Nous aimerions vous offrir une compensation lors de votre prochaine location. Contactez-nous directement pour en discuter.`,
    (name, car) => `Bonjour ${name}, nous regrettons profondément votre insatisfaction concernant la ${car}. Chaque avis négatif est une opportunité d'amélioration pour nous. Notre responsable qualité vous contactera sous 24h pour résoudre cette situation. Merci de votre compréhension.`,
];

/**
 * Generates a professional AI reply based on review data
 * @param {{ user_name: string, brand: string, model: string, rating: number, comment: string }} review
 * @returns {Promise<string>} The generated reply
 */
export const generateReviewReply = async (review) => {
    // Simulate AI processing delay (300-800ms)
    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

    const name = review.user_name || 'Client';
    const car = `${review.brand || ''} ${review.model || ''}`.trim() || 'voiture';
    const rating = review.rating || 3;

    let templates;
    if (rating >= 4) templates = POSITIVE_TEMPLATES;
    else if (rating >= 3) templates = NEUTRAL_TEMPLATES;
    else templates = NEGATIVE_TEMPLATES;

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template(name, car);
};

/**
 * Simulates sending an AI-generated reply via email
 * @param {string} email - Client email address
 * @param {string} reply - The AI-generated reply text
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const simulateSendEmail = async (email, reply) => {
    // Simulate email sending delay (1-2s)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

    // 95% success rate simulation
    if (Math.random() > 0.05) {
        return { success: true, message: `Réponse envoyée avec succès à ${email || 'client'}` };
    }
    return { success: false, message: 'Erreur lors de l\'envoi. Veuillez réessayer.' };
};

/**
 * Analyzes review sentiment
 * @param {number} rating - Review rating (1-5)
 * @returns {{ label: string, color: string, emoji: string }}
 */
export const analyzeSentiment = (rating) => {
    if (rating >= 4) return { label: 'Positif', color: '#10b981', emoji: '😊' };
    if (rating >= 3) return { label: 'Neutre', color: '#f59e0b', emoji: '😐' };
    return { label: 'Négatif', color: '#f43f5e', emoji: '😟' };
};

/**
 * Generates AI car description based on brand, model, and price
 * @param {{ brand: string, model: string, price_per_day: number }} car
 * @returns {Promise<string>}
 */
export const generateCarDescription = async (car) => {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const { brand, model, price_per_day } = car;
    const b = brand || 'Véhicule';
    const m = model || '';
    const p = price_per_day || 0;

    const descriptions = [
        `Découvrez l'élégance et la performance de la ${b} ${m}. Ce véhicule premium allie confort exceptionnel, technologies de pointe et design raffiné. Idéale pour vos déplacements professionnels comme pour vos escapades, elle offre une expérience de conduite incomparable à seulement ${p} DT/jour. Réservez dès maintenant et vivez une expérience automobile d'exception.`,
        `La ${b} ${m} incarne le parfait équilibre entre puissance et sophistication. Équipée des dernières innovations technologiques et d'un intérieur luxueux, elle transforme chaque trajet en moment de plaisir. Disponible à partir de ${p} DT/jour, cette perle de notre flotte vous attend pour des aventures inoubliables.`,
        `Prenez le volant de la magnifique ${b} ${m} et redécouvrez le plaisir de conduire. Son moteur performant, son habitacle spacieux et ses finitions haut de gamme en font le choix parfait pour les conducteurs exigeants. À ${p} DT/jour, offrez-vous le meilleur de l'automobile sans compromis.`,
        `La ${b} ${m} est bien plus qu'une simple voiture — c'est une déclaration de style. Design dynamique, motorisation efficiente et confort absolu caractérisent ce bijou de notre collection. Pour ${p} DT/jour seulement, faites de chaque route une destination.`,
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
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

import api from "../../../config/api.config";

export const getCarReviewsService = (car_id) => api.get(`/reviews/car/${car_id}`);
export const addReviewService = (data) => api.post("/reviews", data);
export const updateReviewService = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReviewService = (id) => api.delete(`/reviews/${id}`);
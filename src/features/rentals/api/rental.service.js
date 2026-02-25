import api from "../../../config/api.config";

export const rentCarService = (data) => api.post("/rentals", data);
export const getMyRentalsService = () => api.get("/rentals/my");
export const cancelRentalService = (id) => api.put(`/rentals/cancel/${id}`);
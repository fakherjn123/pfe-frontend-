import api from "../../../config/api.config";

export const createPaymentService = (data) => api.post("/payments", data);
export const confirmCashService = (id) => api.put(`/payments/confirm-cash/${id}`);
import api from "../../../config/api.config";

export const createPayment = (data) =>
api.post("/payments", data);
export const confirmCash = (id) =>
  api.put(`/payments/${id}/confirm`);
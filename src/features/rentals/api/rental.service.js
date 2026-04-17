import api from "../../../config/api.config";

export const rentCar = (data) =>
  api.post("/rentals", data);

export const getMyRentals = () =>
  api.get("/rentals/my");

export const cancelRental = (id) =>
  api.put(`/rentals/cancel/${id}`);

export const getCancellationPreview = (id) =>
  api.get(`/rentals/cancel-preview/${id}`);

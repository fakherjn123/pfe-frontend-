import api from "../../../config/api.config";

export const rentCar = (data) =>
  api.post("/rentals", data);

export const getMyRentals = () =>
  api.get("/rentals/my");

export const cancelRental = (id) =>
  api.put(`/rentals/${id}/cancel`);
import api from "../../../config/api.config";

export const rentCar = (data) =>
  api.post("/rentals", data);

export const getMyRentals = () =>
  api.get("/rentals/my");

// Backend route is: PUT /rentals/cancel/:id
export const cancelRental = (id) =>
  api.put(`/rentals/cancel/${id}`);





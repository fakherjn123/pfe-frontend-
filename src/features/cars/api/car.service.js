import api from "../../../config/api.config";

export const getCarsService = () =>
  api.get("/cars");

export const getCarByIdService = (id) =>
  api.get(`/cars/${id}`);
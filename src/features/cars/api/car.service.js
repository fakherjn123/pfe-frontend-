import api from "../../../config/api.config";

export const getCars = (params) =>
  api.get("/cars", { params });

export const getCarById = (id) =>
  api.get(`/cars/${id}`);

export const addCar = (data) =>
  api.post("/cars", data);

export const updateCar = (id, data) =>
  api.put(`/cars/${id}`, data);

export const deleteCar = (id) =>
  api.delete(`/cars/${id}`);
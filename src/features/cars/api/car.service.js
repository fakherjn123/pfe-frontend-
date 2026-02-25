import api from "../../../config/api.config";

export const getCarsService = () =>
  api.get("/cars");
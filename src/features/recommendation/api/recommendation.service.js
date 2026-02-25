import api from "../../../config/api.config";

export const getRecommendationService = (data) =>
  api.post("/recommendation", data);
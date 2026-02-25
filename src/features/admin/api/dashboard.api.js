import api from "../../../config/api.config";

export const getStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};
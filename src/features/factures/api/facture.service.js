import api from "../../../config/api.config";

// CLIENT
export const getMyFactures = () => {
  return api.get("/facture/my");
};

// ADMIN
export const getAllFactures = () => {
  return api.get("/facture");
};

// BOTH (admin can access any, client only his)
export const getFacturePDF = (id) => {
  return api.get(`/facture/pdf/${id}`);
};
export const downloadFacture = async (id) => {
  const response = await api.get(`/facture/pdf/${id}`, {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `facture-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
};
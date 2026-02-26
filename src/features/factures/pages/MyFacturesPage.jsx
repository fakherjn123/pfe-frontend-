import { useEffect, useState } from "react";
import { getMyFactures, getFacturePDF } from "../api/facture.service";

export default function MyFacturesPage() {
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    const res = await getMyFactures();
    setFactures(res.data.factures);
  };

  const viewPDF = async (id) => {
    const res = await getFacturePDF(id);
    alert(`Facture Total: ${res.data.total} TND`);
  };

  return (
   <div className="min-h-screen p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        My Invoices
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {factures.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700">
                {f.brand} {f.model}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(f.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Total:
                <span className="font-bold text-black ml-2">
                  {f.total} TND
                </span>
              </p>
            </div>

            <button
              onClick={() => downloadFacture(f.id)}
              className="w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition"
            >
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
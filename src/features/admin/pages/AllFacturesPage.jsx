import { useEffect, useState } from "react";
import { getAllFactures, getFacturePDF } from "../../factures/api/facture.service";

export default function AllFacturesPage() {
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const res = await getAllFactures();
    setFactures(res.data.factures);
  };

  const viewPDF = async (id) => {
    const res = await getFacturePDF(id);
    alert(`Client: ${res.data.email}`);
  };

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        All Invoices (Admin)
      </h2>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Car</th>
              <th className="p-4">Total</th>
              <th className="p-4">Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {factures.map((f) => (
              <tr
                key={f.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4">{f.email}</td>
                <td className="p-4">
                  {f.brand} {f.model}
                </td>
                <td className="p-4 font-semibold">
                  {f.total} TND
                </td>
                <td className="p-4">
                  {new Date(f.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => downloadFacture(f.id)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
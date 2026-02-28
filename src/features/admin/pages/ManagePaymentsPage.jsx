import { useEffect, useState } from "react";
import api from "../../../config/api.config";

export default function ManagerPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleConfirmCash = async (id) => {
    if (!window.confirm("Confirmer la réception du paiement en espèces ?")) return;
    try {
      await api.put(`/payments/confirm-cash/${id}`);
      fetchPayments(); // Refresh list to update status
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur de confirmation");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments</h1>
          <p className="text-slate-500 mt-1">Manage rental transactions and cash confirmations.</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Client</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Car</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Method</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500">#{String(p.id).padStart(4, "0")}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{p.email}</td>
                    <td className="px-6 py-4 text-slate-600">{p.brand} {p.model}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.amount} TND</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${p.method === 'card' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                        {p.method === 'card' ? '💳 Card' : '💵 Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {p.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.method === 'cash' && p.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmCash(p.id)}
                          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Accept Cash
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
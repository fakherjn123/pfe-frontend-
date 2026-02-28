import { useEffect, useState } from "react";
import api from "../../../config/api.config";

export default function ManagerPaymentsPage() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Manage Payments 💳</h2>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 20
      }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th>ID</th>
            <th>Client</th>
            <th>Car</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p.id} style={{
              textAlign: "center",
              borderBottom: "1px solid #eee"
            }}>
              <td>{p.id}</td>
              <td>{p.email}</td>
              <td>{p.brand} {p.model}</td>
              <td><strong>{p.amount} TND</strong></td>
              <td>{p.method}</td>
              <td>
                {new Date(p.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
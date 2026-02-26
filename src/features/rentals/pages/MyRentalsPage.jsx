import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRentals } from "../api/rental.service";

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await getMyRentals();
      setRentals(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>My Rentals</h2>

      {rentals.length === 0 ? (
        <p>No rentals yet.</p>
      ) : (
        rentals.map((r) => (
          <div key={r.id} style={{ marginBottom: "20px" }}>
            <p>Car: {r.brand} {r.model}</p>
            <p>Status: {r.status}</p>

            {/* FIX #3: Afficher le bouton Pay uniquement si la location attend un paiement */}
            {r.status === "awaiting_payment" && (
              <button
                onClick={() => navigate(`/payment/${r.id}`)}
              >
                Pay
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
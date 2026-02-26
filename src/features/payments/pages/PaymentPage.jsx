import { useParams, useNavigate } from "react-router-dom";
import { createPayment } from "../api/payment.service";

export default function PaymentPage() {

  const { rentalId } = useParams();
  const navigate = useNavigate();

  console.log("Param rentalId:", rentalId);

  const handlePay = async () => {
    if (!rentalId) {
      alert("Invalid rental id");
      return;
    }

    try {
      await createPayment({
        rental_id: parseInt(rentalId),
        method: "card"
      });

      alert("Payment successful");
      navigate("/rentals");

    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Payment</h2>
      <button onClick={handlePay}>
        Pay Now
      </button>
    </div>
  );
}
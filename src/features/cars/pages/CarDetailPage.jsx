import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../config/api.config";

export default function CarDetailPage() {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchCar();
    fetchReviews();
  }, []);

  const fetchCar = async () => {
    try {
      const res = await api.get(`/cars/${id}`);
      setCar(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addReview = async () => {
    try {
      await api.post("/reviews", {
        car_id: id,
        rating,
        comment
      });

      setComment("");
      fetchReviews();
    } catch (error) {
      alert("You must login to review.");
    }
  };

  const rentCar = async () => {
    if (!startDate || !endDate) {
      alert("Please select dates");
      return;
    }
if (new Date(endDate) <= new Date(startDate)) {
    alert("End date must be after start date");
    return;
  }
    try {
      await api.post("/rentals", {
        car_id: Number(id),
        start_date: startDate,
        end_date: endDate
      });

      alert("Car rented successfully 🚗");
    } catch (error) {
      console.error(error);
      alert("Error renting car");
    }
  };

  if (!car) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold mb-4">
          {car.brand} {car.model}
        </h1>

        <p className="text-xl mb-4">
          {car.price_per_day} TND / day
        </p>

        <p className="mb-6">
          Status:
          <span className={`ml-2 font-bold ${car.available ? "text-green-600" : "text-red-600"}`}>
            {car.available ? "Available" : "Not Available"}
          </span>
        </p>

        {/* RENT SECTION */}
        <div className="mt-6">

          <div className="flex gap-4 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <button
            onClick={rentCar}
            className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            Rent This Car
          </button>

        </div>

      </div>

      {/* REVIEWS */}
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((r) => (
          <div key={r.id} className="border-b py-4">
            <p className="font-semibold">{r.name}</p>
            <p>Rating: {r.rating}/10</p>
            <p className="text-gray-600">{r.comment}</p>
          </div>
        ))}

        {/* Add Review */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Add Review</h3>

          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />

          <textarea
            placeholder="Your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />

          <button
            onClick={addReview}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Submit Review
          </button>
        </div>

      </div>

    </div>
  );
}
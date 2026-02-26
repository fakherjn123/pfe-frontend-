import { Link } from "react-router-dom";

export default function CarCard({ car }) {
  return (
    <div className="card">
      <h3>{car.brand} {car.model}</h3>
      <p>{car.price_per_day} TND / day</p>
      <Link to={`/cars/${car.id}`}>View</Link>
    </div>
  );
}
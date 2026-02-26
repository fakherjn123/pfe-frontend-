import { useEffect, useState } from "react";
import { getCars } from "../api/car.service";
import CarCard from "../components/CarCard";

export default function CarsPage() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    getCars().then(res => setCars(res.data));
  }, []);

  return (
    <div>
      <h2>Cars</h2>
      {cars.map(car => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
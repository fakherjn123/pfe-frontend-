import { useEffect, useState } from "react";
import { getCarsService } from "../api/car.service";

export default function CarsPage() {

  const [cars,setCars]=useState([]);

  useEffect(()=>{
    getCarsService()
      .then(res=>setCars(res.data));
  },[]);

  return (
    <div>
      <h1>Cars</h1>

      {cars.map(car=>(
        <div key={car.id}>
          {car.brand} - {car.model}
        </div>
      ))}
    </div>
  );
}
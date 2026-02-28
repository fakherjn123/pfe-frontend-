import { useEffect, useState } from "react";
import { getCars } from "../api/car.service";
import { Link } from "react-router-dom";

function CarCard({ car }) {
  return (
    <Link
      to={`/cars/${car.id}`}
      className="group block"
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:-translate-y-1">

        {/* Full-width edge-to-edge image */}
        <div className="w-full h-48 bg-[#f9f9f9] flex items-center justify-center overflow-hidden border-b border-slate-100">
          <img
            src={car.image ? `http://localhost:3000${car.image}` : "https://picsum.photos/400/250"}
            alt={car.brand}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5">
          {/* Top row */}
          <div className="flex justify-between items-start mb-4">
            <div className={`w-2 h-2 rounded-full mt-1.5 ${car.available ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-slate-400 text-xs font-semibold tracking-wider">
              #{String(car.id).padStart(3, "0")}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-slate-900 font-extrabold text-xl mb-1 tracking-tight">
            {car.brand}
          </h3>
          <p className="text-slate-500 text-sm mb-5 font-medium">
            {car.model}
          </p>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <div>
              <span className="text-slate-400 text-xs font-medium block mb-0.5">per day</span>
              <div className="text-slate-900 font-extrabold text-2xl tracking-tight leading-none">
                {car.price_per_day} <span className="text-slate-300 text-sm font-medium ml-0.5">TND</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white shrink-0">
              &rarr;
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({ brand: "", maxPrice: "", available: "" });
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    setLoading(true);
    const params = {};
    if (filters.brand) params.brand = filters.brand;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.available !== "") params.available = filters.available;
    const res = await getCars(params);
    setCars(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  const inputClass = "bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all flex-1 min-w-[140px]";

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200 py-12 px-6 sm:px-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Available Fleet
          </p>
          <div className="flex justify-between items-end flex-wrap gap-6">
            <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl tracking-tight leading-tight m-0">
              Find your<br />perfect car
            </h1>
            <span className="text-slate-600 text-sm font-medium bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
              {cars.length} vehicles
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 pb-20">
        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8 flex gap-3 flex-wrap items-center shadow-sm">
          <input
            placeholder="Brand (e.g. BMW)"
            value={filters.brand}
            onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}
            className={inputClass}
          />
          <input
            placeholder="Max price (TND)"
            type="number"
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
            className={inputClass}
          />
          <select
            value={filters.available}
            onChange={e => setFilters(f => ({ ...f, available: e.target.value }))}
            className={`${inputClass} flex-none ${filters.available ? "text-slate-900" : "text-slate-400"}`}
          >
            <option value="">All status</option>
            <option value="true">Available</option>
            <option value="false">Rented</option>
          </select>
          <button
            onClick={fetchCars}
            className="bg-slate-900 text-white border-0 px-6 py-2.5 text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap hover:bg-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-slate-200"
          >
            Search
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-slate-400 py-20 text-center text-sm font-medium">Loading vehicles...</div>
        ) : cars.length === 0 ? (
          <div className="text-slate-400 py-20 text-center text-sm font-medium">No vehicles found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cars.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>
    </div>
  );
}
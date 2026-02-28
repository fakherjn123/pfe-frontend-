import { useEffect, useState } from "react";
import api from "../../../config/api.config";

function StatCard({ label, value, note, accentClass = "bg-slate-900" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${accentClass}`} />
      </div>
      <div className="text-slate-900 text-3xl font-extrabold tracking-tight leading-none">
        {value ?? <span className="text-slate-300">—</span>}
      </div>
      {note && <div className="text-slate-500 text-xs mt-2">{note}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [topCars, setTopCars] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(console.error);
    api.get("/dashboard/financial").then(r => setFinancial(r.data)).catch(console.error);
    api.get("/dashboard/top-cars").then(r => setTopCars(r.data)).catch(console.error);
  }, []);

  const SectionTitle = ({ children }) => (
    <h2 className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-4">
      {children}
    </h2>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-6 sm:px-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-500 text-sm mb-1.5 font-medium">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight m-0">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 pb-20">
        {/* Fleet */}
        <SectionTitle>Fleet overview</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard label="Total vehicles" value={stats?.total_cars} accentClass="bg-indigo-500" />
          <StatCard label="Active" value={stats?.active_cars} accentClass="bg-green-500" />
          <StatCard label="Total rentals" value={stats?.total_rentals} accentClass="bg-amber-500" />
          <StatCard label="Ongoing" value={stats?.ongoing_rentals} note="In use" accentClass="bg-sky-500" />
          <StatCard label="Confirmed" value={stats?.confirmed_rentals} note="Upcoming" accentClass="bg-violet-500" />
          <StatCard label="Users" value={stats?.total_users} accentClass="bg-rose-500" />
        </div>

        {/* Financial */}
        <SectionTitle>Revenue</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total revenue"
            value={financial ? `${financial.total_revenue} TND` : null}
            note={`${financial?.paid_payments ?? 0} paid`}
            accentClass="bg-green-500"
          />
          <StatCard
            label="This month"
            value={financial ? `${financial.current_month_revenue} TND` : null}
            accentClass="bg-amber-500"
          />
          <StatCard label="Payments" value={financial?.total_payments} accentClass="bg-indigo-500" />
          <StatCard label="Confirmed" value={financial?.paid_payments} accentClass="bg-sky-500" />
        </div>

        {/* Top cars */}
        {topCars.length > 0 && (
          <>
            <SectionTitle>Top vehicles</SectionTitle>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {topCars.map((car, i) => (
                <div key={car.id} className={`flex items-center p-4 sm:px-6 hover:bg-slate-50 transition-colors ${i < topCars.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <span className="w-8 text-slate-300 text-sm font-bold shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <span className="text-slate-900 text-sm font-semibold">{car.brand} </span>
                    <span className="text-slate-500 text-sm">{car.model}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 rounded-full bg-slate-100 relative" style={{ width: `${Math.max(40, (car.total_rentals / (topCars[0]?.total_rentals || 1)) * 120)}px` }}>
                      <div className="absolute top-0 left-0 h-full rounded-full bg-slate-900 transition-all duration-500" style={{ width: `${(car.total_rentals / (topCars[0]?.total_rentals || 1)) * 100}%` }} />
                    </div>
                    <span className="text-slate-900 text-sm font-bold min-w-[1.5rem] text-right">
                      {car.total_rentals}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick links */}
        <div className="flex gap-3 mt-10 flex-wrap">
          <a href="/admin/factures" className="text-slate-600 text-sm font-medium px-5 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            All invoices &rarr;
          </a>
          <a href="/" className="text-slate-600 text-sm font-medium px-5 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            Browse fleet &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
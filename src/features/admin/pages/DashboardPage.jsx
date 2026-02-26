import { useEffect, useState } from "react";
import api from "../../../config/api.config";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats")
       .then(res => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Total Cars: {stats.total_cars}</p>
      <p>Total Rentals: {stats.total_rentals}</p>
      <p>Total Users: {stats.total_users}</p>
    </div>
  );
}
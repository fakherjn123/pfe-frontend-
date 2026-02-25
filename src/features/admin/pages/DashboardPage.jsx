import { useEffect, useState } from "react";
import { getStats } from "../api/dashboard.api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then((res) => setStats(res.data));
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
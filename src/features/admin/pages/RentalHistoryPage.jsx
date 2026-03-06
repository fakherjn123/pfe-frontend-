import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../config/api.config";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

export default function RentalHistoryPage() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRentals, setTotalRentals] = useState(0);

    useEffect(() => {
        setLoading(true);
        api.get("/rentals/all")
            .then(res => {
                const rentals = res.data;
                setTotalRentals(rentals.length);

                // Group by Month Year
                const grouped = rentals.reduce((acc, rental) => {
                    const d = new Date(rental.start_date);
                    // Format as YYYY-MM to sort chronologically easier
                    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

                    if (!acc[monthKey]) {
                        acc[monthKey] = {
                            monthKey,
                            name: label,
                            locations: 0,
                            revenus: 0
                        };
                    }
                    acc[monthKey].locations += 1;
                    acc[monthKey].revenus += Number(rental.total_price) || 0;
                    return acc;
                }, {});

                // Convert to array and sort chronologically
                const dataArray = Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

                setChartData(dataArray);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Custom Tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e8e8e8",
                    padding: "16px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    fontFamily: sans
                }}>
                    <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#0a0a0a" }}>{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color }} />
                            <span style={{ fontSize: 13, color: "#666", flex: 1 }}>{entry.name}:</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0a0a0a" }}>
                                {entry.value} {entry.name === "Revenus" ? "TND" : ""}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
            <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "36px 40px" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ color: "#0a0a0a", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                            Évolution des Locations
                        </h1>
                        <p style={{ color: "#bbb", fontSize: 13, margin: "6px 0 0" }}>
                            Aperçu mensuel (Total: {totalRentals} locations)
                        </p>
                    </div>
                    <Link to="/admin/rentals" style={{
                        textDecoration: "none", color: "#0a0a0a", fontSize: 13, fontWeight: 600,
                        padding: "10px 18px", border: "1px solid #e8e8e8", borderRadius: 8,
                        background: "#fff", transition: "all 0.15s"
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#999"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; }}
                    >
                        ← Retour aux locations
                    </Link>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 40px 80px" }}>
                {loading ? (
                    <div style={{ color: "#ccc", padding: "60px 0", textAlign: "center", fontSize: 13 }}>Chargement des données...</div>
                ) : chartData.length === 0 ? (
                    <div style={{
                        background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
                        padding: "60px", textAlign: "center",
                    }}>
                        <p style={{ color: "#ccc", fontSize: 14, margin: "0 0 16px" }}>Aucune donnée disponible pour afficher le graphique.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                        {/* Chart 1: Evolution of Rentals */}
                        <div style={{ background: "#fff", padding: "32px", borderRadius: 16, border: "1px solid #ebebeb", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0a0a0a" }}>Nombre de locations par mois</h3>
                                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaa" }}>Courbe d'évolution du volume de réservations</p>
                            </div>
                            <div style={{ height: 350, width: "100%" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorLocations" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="locations" name="Locations" stroke="#0a0a0a" strokeWidth={3} fillOpacity={1} fill="url(#colorLocations)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0a0a0a' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Evolution of Revenue */}
                        <div style={{ background: "#fff", padding: "32px", borderRadius: 16, border: "1px solid #ebebeb", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0a0a0a" }}>Chiffre d'affaires par mois (TND)</h3>
                                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaa" }}>Courbe d'évolution des revenus générés</p>
                            </div>
                            <div style={{ height: 350, width: "100%" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

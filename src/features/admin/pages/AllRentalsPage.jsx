import { useEffect, useState } from "react";
import api from "../../../config/api.config";

const sans = "'Inter', 'Helvetica Neue', sans-serif";

const STATUS = {
    confirmed: { color: "#0ea5e9", bg: "#f0f9ff", label: "Confirmed" },
    ongoing: { color: "#22c55e", bg: "#f0fdf4", label: "Ongoing" },
    completed: { color: "#aaa", bg: "#fafafa", label: "Completed" },
    cancelled: { color: "#f87171", bg: "#fff5f5", label: "Cancelled" },
    awaiting_payment: { color: "#f59e0b", bg: "#fffbeb", label: "Payment required" },
};

export default function AllRentalsPage() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get("/rentals/all")
            .then(res => setRentals(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const days = (s, e) => Math.ceil((new Date(e) - new Date(s)) / 86400000);

    return (
        <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: sans, paddingTop: 64 }}>
            <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "36px 40px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ color: "#0a0a0a", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                            All Rentals
                        </h1>
                        <p style={{ color: "#bbb", fontSize: 13, margin: "6px 0 0" }}>
                            {rentals.length} total booking{rentals.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button onClick={() => window.location.href = '/admin/rentals/history'} style={{
                        background: "#0a0a0a", color: "#fff", border: "none", padding: "10px 18px",
                        fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                        fontFamily: sans, transition: "opacity 0.2s"
                    }} onMouseEnter={e => e.currentTarget.style.opacity = 0.8} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                        Voir l'Historique Mensuel
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 40px 80px" }}>
                {loading ? (
                    <div style={{ color: "#ccc", padding: "60px 0", textAlign: "center", fontSize: 13 }}>Loading...</div>
                ) : rentals.length === 0 ? (
                    <div style={{
                        background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
                        padding: "60px", textAlign: "center",
                    }}>
                        <p style={{ color: "#ccc", fontSize: 14, margin: "0 0 16px" }}>No bookings found.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {rentals.map(rental => {
                            const cfg = STATUS[rental.status] || STATUS.confirmed;
                            const d = days(rental.start_date, rental.end_date);
                            return (
                                <div key={rental.id} style={{
                                    background: "#fff", border: "1px solid #ebebeb", borderRadius: 12,
                                    padding: "24px", display: "flex", justifyContent: "space-between",
                                    alignItems: "flex-start", gap: 20, flexWrap: "wrap",
                                }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                            <span style={{
                                                background: cfg.bg, color: cfg.color,
                                                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                                            }}>{cfg.label}</span>
                                            <span style={{ color: "#ddd", fontSize: 12 }}>#{String(rental.id).padStart(4, "0")} • {rental.user_name || `Client #${rental.user_id}`}</span>
                                        </div>
                                        <h3 style={{ color: "#0a0a0a", fontSize: 18, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                                            {rental.brand || rental.Car?.brand} {rental.model || rental.Car?.model}
                                        </h3>
                                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                            {[
                                                { label: "From", value: fmt(rental.start_date) },
                                                { label: "To", value: fmt(rental.end_date) },
                                                { label: "Duration", value: `${d} day${d !== 1 ? "s" : ""}` },
                                                { label: "Total", value: `${rental.total_price} TND` },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <div style={{ color: "#bbb", fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{label}</div>
                                                    <div style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 600 }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

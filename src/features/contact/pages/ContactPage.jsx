import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import api from '../../../config/api.config';
import toast from 'react-hot-toast';
import Footer from '../../../shared/components/layout/Footer';

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const BLUE = "#2563EB";

const inputStyle = {
  width: "100%", padding: "12px 16px", fontSize: 14,
  border: "1px solid #E5E7EB", borderRadius: 8, outline: "none",
  fontFamily: sans, boxSizing: "border-box", background: "#fff",
  color: "#111827", transition: "border-color 0.2s",
};

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [contactDetails, setContactDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contacts/info')
      .then(res => setContactDetails(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contacts', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      toast.error("Une erreur est survenue lors de l'envoi.");
    }
  };

  const standardDetails = contactDetails.filter(d => d.type !== 'description');

  const typeIcon = (type) => {
    if (type === 'address') return <MapPin size={20} />;
    if (type === 'phone' || type === 'whatsapp') return <Phone size={20} />;
    if (type === 'email') return <Mail size={20} />;
    return <MapPin size={20} />;
  };

  // Default contact info if API returns nothing
  const defaultInfo = [
    { id: 1, type: 'address', label: 'Adresse', value: 'Avenue Hédi Chaker, Sahloul 4, Sousse 4054, Tunisie' },
    { id: 2, type: 'phone', label: 'Téléphone', value: '+216 29 015 948' },
    { id: 3, type: 'email', label: 'Email', value: 'contact@bmz-location.tn' },
  ];
  const infos = standardDetails.length > 0 ? standardDetails : defaultInfo;

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: sans }}>

      {/* ─── Hero Header ─────────────────────────────────────── */}
      <div style={{
        background: "#0F172A", padding: "80px 32px 64px",
        textAlign: "center", color: "#fff",
      }}>
        <span style={{
          display: "inline-block", background: "rgba(37,99,235,0.2)", color: "#93C5FD",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>Nous contacter</span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.03em" }}>
          Parlons de votre projet
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 17, maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
          Une question ? Un devis ? Notre équipe est disponible 7j/7 pour vous répondre.
        </p>
      </div>

      {/* ─── Content ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <div style={{
          background: "#fff", borderRadius: 20,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          display: "grid", gridTemplateColumns: "1fr 1.4fr",
          overflow: "hidden", marginTop: -32, marginBottom: 80,
        }}>

          {/* Left — Contact Info */}
          <div style={{ background: BLUE, padding: "56px 44px", color: "#fff" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Informations de contact</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 48px", lineHeight: 1.6 }}>
              Remplissez le formulaire ou contactez-nous directement via les coordonnées ci-dessous.
            </p>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginBottom: 6, width: "40%" }} />
                      <div style={{ height: 14, background: "rgba(255,255,255,0.12)", borderRadius: 4, width: "70%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {infos.map((d) => (
                  <div key={d.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {typeIcon(d.type)}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {d.label}
                      </p>
                      {d.type === 'email' ? (
                        <a href={`mailto:${d.value}`} style={{ color: "#fff", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>{d.value}</a>
                      ) : d.type === 'phone' || d.type === 'whatsapp' ? (
                        <a href={`tel:${d.value}`} style={{ color: "#fff", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>{d.value}</a>
                      ) : (
                        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{d.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hours */}
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Horaires d'ouverture
              </p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "0 0 4px" }}>Lundi – Vendredi : 8h00 – 19h00</p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "0 0 4px" }}>Samedi : 9h00 – 17h00</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
                <span style={{ color: "#4ADE80", fontSize: 13, fontWeight: 600 }}>Support 24/7 disponible</span>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div style={{ padding: "56px 44px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
              Envoyez-nous un message
            </h2>
            <p style={{ color: "#6B7280", fontSize: 14, margin: "0 0 36px" }}>
              Nous vous répondrons dans les plus brefs délais.
            </p>

            {submitted ? (
              <div style={{
                background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12,
                padding: "28px 24px", display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "#DCFCE7",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Send size={22} color="#16A34A" />
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#166534" }}>Message envoyé !</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#166534", opacity: 0.8 }}>
                    Merci de nous avoir contactés, nous vous répondrons rapidement.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nom complet *</label>
                    <input type="text" name="name" required placeholder="Jean Dupont" value={formData.name} onChange={handleChange}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = BLUE}
                      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email *</label>
                    <input type="email" name="email" required placeholder="vous@exemple.com" value={formData.email} onChange={handleChange}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = BLUE}
                      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Téléphone</label>
                    <input type="tel" name="phone" placeholder="+216 XX XXX XXX" value={formData.phone} onChange={handleChange}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = BLUE}
                      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Sujet *</label>
                    <input type="text" name="subject" required placeholder="Votre sujet" value={formData.subject} onChange={handleChange}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = BLUE}
                      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Message *</label>
                  <textarea name="message" required rows={5} placeholder="Décrivez votre demande..." value={formData.message} onChange={handleChange}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                  />
                </div>
                <button type="submit" style={{
                  background: BLUE, color: "#fff", border: "none",
                  padding: "13px 32px", fontSize: 15, fontFamily: sans, fontWeight: 700,
                  borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  alignSelf: "flex-start", transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseLeave={e => e.currentTarget.style.background = BLUE}
                >
                  <Send size={16} />
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;

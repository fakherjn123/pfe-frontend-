import { useEffect, useState } from "react";
import api from "../../../config/api.config";

export default function ManagerCarsPage() {
  const [cars, setCars] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    id: null,
    brand: "",
    model: "",
    price_per_day: "",
    status: "available",
    image: null,
  });

  // 🔥 Fetch Cars
  const fetchCars = async () => {
    try {
      const res = await api.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // 🔥 Open Add Modal
  const openAdd = () => {
    setIsEdit(false);
    setForm({
      id: null,
      brand: "",
      model: "",
      price_per_day: "",
      status: "available",
      image: null,
    });
    setImagePreview(null);
    setIsOpen(true);
  };

  // 🔥 Open Edit Modal
  const openEdit = (car) => {
    setIsEdit(true);
    setForm({
      id: car.id,
      brand: car.brand,
      model: car.model,
      price_per_day: car.price_per_day,
      status: car.status,
      image: null, // مهم جداً
    });
    setImagePreview(
      car.image ? `http://localhost:3000${car.image}` : null
    );
    setIsOpen(true);
  };

  // 🔥 Submit (Add / Update)
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("price_per_day", form.price_per_day);
      formData.append("status", form.status);

      // مهم: ما نبعثوش image كان اذا كانت File جديدة
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (isEdit) {
        await api.put(`/cars/${form.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/cars", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsOpen(false);
      fetchCars();

    } catch (err) {
      console.error(err);
      alert("Error saving car");
    }
  };

  // 🔥 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this car permanently?")) return;

    try {
      await api.delete(`/cars/${id}`);
      fetchCars();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Manage Cars 🚗</h2>

      <button
        onClick={openAdd}
        style={{
          marginBottom: 20,
          padding: "10px 18px",
          background: "#000",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        + Add Car
      </button>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 20
      }}>
        {cars.map((car) => (
          <div key={car.id} style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 15
          }}>
            <img
              src={
                car.image
                  ? `http://localhost:3000${car.image}`
                  : "https://picsum.photos/300/180"
              }
              alt={car.brand}
              style={{
                width: "100%",
                height: 180,
                objectFit: "contain",
                backgroundColor: "#f9f9f9", // Add a small background in case the image doesn't take full width
                borderRadius: 8,
              }}
            />

            <h3>{car.brand}</h3>
            <p>{car.model}</p>
            <p><strong>{car.price_per_day} TND</strong></p>

            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 12,
                background:
                  car.status === "available"
                    ? "#d4f8d4"
                    : "#ffd6d6",
              }}
            >
              {car.status}
            </span>

            <div style={{ marginTop: 10 }}>
              <button onClick={() => openEdit(car)}>
                Edit
              </button>

              <button
                onClick={() => handleDelete(car.id)}
                style={{
                  background: "red",
                  color: "#fff",
                  marginLeft: 10
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: 30,
            borderRadius: 12,
            width: 400
          }}>
            <h3>{isEdit ? "Edit Car" : "Add Car"}</h3>

            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) =>
                setForm({ ...form, brand: e.target.value })
              }
            />

            <input
              placeholder="Model"
              value={form.model}
              onChange={(e) =>
                setForm({ ...form, model: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price per day"
              value={form.price_per_day}
              onChange={(e) =>
                setForm({ ...form, price_per_day: e.target.value })
              }
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setForm({ ...form, image: file });
                setImagePreview(URL.createObjectURL(file));
              }}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "contain",
                  backgroundColor: "#f9f9f9",
                  marginTop: 10,
                  borderRadius: 8
                }}
              />
            )}

            <div style={{ marginTop: 20 }}>
              <button onClick={handleSubmit}>
                {isEdit ? "Update" : "Add"}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(form);
      navigate("/");
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e)=>
            setForm({...form,email:e.target.value})
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e)=>
            setForm({...form,password:e.target.value})
          }
        />

        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
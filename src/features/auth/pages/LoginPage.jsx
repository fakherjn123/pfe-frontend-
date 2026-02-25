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

    await login(form);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        onChange={(e)=>
          setForm({...form,email:e.target.value})
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>
          setForm({...form,password:e.target.value})
        }
      />

      <button>Login</button>
    </form>
  );
}
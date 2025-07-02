import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function Signup() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    address: "",
    password: "",
    password2: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password2) {
      alert("Parollar mos emas!");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);

        // JWT tokenni parse qilib userni contextga saqlaymiz
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        setUser({
          name: payload.name,
          surname: payload.surname,
          email: payload.email,
          phone: payload.phone,
          birthday: payload.birthday,
          gender: payload.gender,
          address: payload.address,
        });

        navigate("/");
      } else {
        alert(`Xatolik: ${data.msg}`);
      }
    } catch (err) {
      alert("Serverda xatolik yuz berdi.");
      console.error(err);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-panel">
        <h2>Ro‘yxatdan o‘tish</h2>
        <form onSubmit={handleSubmit}>
          <input className="input" type="text" name="name" placeholder="Ism" value={form.name} onChange={handleChange} required />
          <input className="input" type="text" name="surname" placeholder="Familiya" value={form.surname} onChange={handleChange} required />
          <input className="input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input className="input" type="tel" name="phone" placeholder="Telefon raqam" value={form.phone} onChange={handleChange} required />
          <input className="input" type="date" name="birthday" placeholder="Tug‘ilgan sana" value={form.birthday} onChange={handleChange} required />
          <select className="input" name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Jinsi</option>
            <option value="Erkak">Erkak</option>
            <option value="Ayol">Ayol</option>
          </select>
          <input className="input" type="text" name="address" placeholder="Manzil" value={form.address} onChange={handleChange} />
          <input className="input" type="password" name="password" placeholder="Parol" value={form.password} onChange={handleChange} required />
          <input className="input" type="password" name="password2" placeholder="Parolni tasdiqlang" value={form.password2} onChange={handleChange} required />
          <button className="btn--submit" type="submit">Ro‘yxatdan o‘tish</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;

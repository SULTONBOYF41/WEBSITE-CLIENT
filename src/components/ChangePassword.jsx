import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

function ChangePassword({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.put(
        `${API_URL}/profile/password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(res.data.msg || "Parol muvaffaqiyatli o'zgartirildi!");
      setOldPassword("");
      setNewPassword("");
      if (onClose) setTimeout(onClose, 1500); // modal bo'lsa yopiladi
    } catch (err) {
      setMsg(err.response?.data?.msg || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 350,
        margin: "16px auto",
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fafbfc",
      }}
    >
      <h3>Parolni o‘zgartirish</h3>
      {msg && (
        <div style={{ color: msg.includes("muvaffaqiyatli") ? "green" : "red", marginBottom: 10 }}>
          {msg}
        </div>
      )}
      <div>
        <input
          type="password"
          placeholder="Eski parol"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Yangi parol"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          background: "#2979ff",
          color: "#fff",
          padding: "8px 18px",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        {loading ? "Saqlanmoqda..." : "Saqlash"}
      </button>
      {onClose && (
        <button
          type="button"
          style={{ marginLeft: 10, background: "#eee" }}
          onClick={onClose}
        >
          Bekor qilish
        </button>
      )}
    </form>
  );
}

export default ChangePassword;

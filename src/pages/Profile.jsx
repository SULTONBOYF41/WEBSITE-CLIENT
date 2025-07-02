import React, { useEffect, useState } from "react";
import axios from "axios";
import ChangePassword from "../components/ChangePassword";

const API_URL = "http://localhost:4000/api";

function Profile() {
    const [user, setUser] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [msg, setMsg] = useState("");
    const [showPasswordForm, setShowPasswordForm] = useState(false); // yangi state

    // JWT token localStorage'da saqlangan deb olamiz
    const token = localStorage.getItem("token");

    // Foydalanuvchi malumotini olish
    useEffect(() => {
        axios
            .get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUser(res.data);
                setEditData(res.data);
            })
            .catch(() => setMsg("Ma'lumotlarni yuklashda xatolik"));
    }, []);

    // Tahrirlash uchun inputlar
    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Profilni saqlash
    const handleSave = () => {
        axios
            .put(`${API_URL}/profile`, editData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUser(res.data.user);
                setEditMode(false);
                setMsg(res.data.msg || "Profil yangilandi!");
            })
            .catch((e) =>
                setMsg(
                    e.response?.data?.msg || "Profilni yangilashda xatolik"
                )
            );
    };

    // Avatar fayl tanlash
    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    // Avatar yuklash
    const handleAvatarUpload = () => {
        if (!avatarFile) return setMsg("Fayl tanlanmagan!");
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        axios
            .post(`${API_URL}/profile/avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                setUser((prev) => ({
                    ...prev,
                    avatar: res.data.avatar,
                }));
                setMsg("Avatar yuklandi!");
            })
            .catch(() => setMsg("Rasm yuklashda xatolik!"));
    };

    if (!user) return <div>Yuklanmoqda...</div>;

    return (
        <div style={{ maxWidth: 400, margin: "40px auto", padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
            <h2>Profil</h2>
            {msg && <div style={{ color: "green", margin: "10px 0" }}>{msg}</div>}

            <div style={{ marginBottom: 20, textAlign: "center" }}>
                <img
                    src={
                        user.avatar
                            ? `${API_URL}/profile/avatar/${user.avatar}`
                            : "/default-avatar.png"
                    }
                    alt="Avatar"
                    width={100}
                    height={100}
                    style={{ borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 10px" }}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "block", margin: "0 auto 8px" }}
                />
                <button
                    onClick={handleAvatarUpload}
                    style={{ display: "block", margin: "0 auto", background: "#770E13", color: "#fff", border: "none", padding: "6px 18px", borderRadius: "6px" }}
                >
                    Rasmni yuklash
                </button>
            </div>


            {!editMode ? (
                <>
                    <div><b>Ism:</b> {user.name}</div>
                    <div><b>Familiya:</b> {user.surname}</div>
                    <div><b>Email:</b> {user.email}</div>
                    <div><b>Telefon:</b> {user.phone}</div>
                    <div><b>Tug‘ilgan sana:</b> {user.birthday}</div>
                    <div><b>Jinsi:</b> {user.gender}</div>
                    <div><b>Manzil:</b> {user.address}</div>
                    <button onClick={() => setEditMode(true)} style={{ marginTop: 20 }}>Tahrirlash</button>
                    {/* Parolni o‘zgartirish tugmasi */}
                    <button
                        onClick={() => setShowPasswordForm((prev) => !prev)}
                        style={{ marginTop: 10, marginLeft: 10, background: "#efefef", color: "#333", borderRadius: 4 }}
                    >
                        {showPasswordForm ? "Yopish" : "Parolni o‘zgartirish"}
                    </button>
                    {/* Parol o‘zgartirish formi */}
                    {showPasswordForm && (
                        <ChangePassword onClose={() => setShowPasswordForm(false)} />
                    )}
                </>
            ) : (
                <>
                    <input name="name" value={editData.name || ""} onChange={handleChange} placeholder="Ism" />
                    <input name="surname" value={editData.surname || ""} onChange={handleChange} placeholder="Familiya" />
                    <input name="email" value={editData.email || ""} onChange={handleChange} placeholder="Email" />
                    <input name="phone" value={editData.phone || ""} onChange={handleChange} placeholder="Telefon" />
                    <input name="birthday" value={editData.birthday || ""} onChange={handleChange} placeholder="Tug‘ilgan sana" />
                    <input name="gender" value={editData.gender || ""} onChange={handleChange} placeholder="Jinsi" />
                    <input name="address" value={editData.address || ""} onChange={handleChange} placeholder="Manzil" />
                    <div style={{ marginTop: 10 }}>
                        <button onClick={handleSave}>Saqlash</button>
                        <button onClick={() => setEditMode(false)} style={{ marginLeft: 8 }}>Bekor qilish</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Profile;

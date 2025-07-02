import React, { useContext, useState } from "react";
import Logo from "../assets/icons/logo.jpg";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = "http://localhost:4000/api";

const Navbar = () => {
    const { user, setUser, logout } = useContext(UserContext);
    const [showProfile, setShowProfile] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [msg, setMsg] = useState("");

    const handleLogout = () => {
        logout();
        setShowProfile(false);
        setEditMode(false);
    };

    const handleEditClick = () => {
        setEditForm(user);
        setEditMode(true);
    };

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(editForm),
            });

            const data = await response.json();

            if (response.ok && data.user && data.token) {
                setUser(data.user);
                localStorage.setItem("token", data.token);
                setEditMode(false);
                setShowProfile(true);
                setMsg("Profil yangilandi!");
            } else {
                setMsg("Xatolik: " + (data.msg || "Profil yangilanmadi"));
            }
        } catch (err) {
            setMsg("Tarmoq xatoligi yoki server ishlamayapti.");
        }
    };

    // ===== AVATAR YUKLASH =====
    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            setMsg("Rasm tanlanmadi!");
            return;
        }
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        try {
            const response = await fetch(`${API_URL}/profile/avatar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });
            const data = await response.json();
            if (response.ok && data.avatar) {
                setUser(prev => ({
                    ...prev,
                    avatar: data.avatar,
                }));
                setMsg("Rasm muvaffaqiyatli yangilandi!");
                setAvatarFile(null);
            } else {
                setMsg("Rasm yuklashda xatolik: " + (data.msg || ""));
            }
        } catch (err) {
            setMsg("Serverda xatolik yuz berdi.");
        }
    };

    // Avatar url (profilda va navbar iconida)
    const getAvatarUrl = (avatar) =>
        avatar
            ? `${API_URL}/profile/avatar/${avatar}`
            : "/default-avatar.png";

    return (
        <>
            <header className="header">
                <div className="container">
                    <div className="header_wrap">
                        <div className="header__logo">
                            <img src={Logo} alt="website logo" />
                        </div>

                        <nav className="nav">
                            <Link className="nav__links" to="/">Bosh sahifa</Link>
                            <Link className="nav__links" to="/products">Mahsulotlar</Link>
                            <Link className="nav__links" to="/about">Biz haqimizda</Link>
                            <Link className="nav__links" to="/contact">Bog‘lanish</Link>
                        </nav>

                        <div className="header__buttons">
                            {!user ? (
                                <>
                                    <div className="login">
                                        <Link to="/login" className="login__btn btn--primary">Login</Link>
                                    </div>
                                    <div className="signup">
                                        <Link to="/signup" className="login__btn btn--primary">Sign up</Link>
                                    </div>
                                </>
                            ) : (
                                <div className="profile">
                                    <button
                                        onClick={() => setShowProfile(true)}
                                        className="profile__icon"
                                        title="Profil"
                                        style={{ padding: 0, border: "none", background: "none" }}
                                    >
                                        {/* Avatar icon */}
                                        <img
                                            src={getAvatarUrl(user.avatar)}
                                            alt="Avatar"
                                            style={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                border: "2px solid #770E13"
                                            }}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Profil paneli */}
            {showProfile && user && (
                <div className="profile-panel">
                    <button className="close-btn" onClick={() => { setShowProfile(false); setEditMode(false); setMsg(""); }}>×</button>
                    <h3>Foydalanuvchi ma’lumotlari</h3>

                    {/* SCROLL QILINADIGAN QISM */}
                    <div className="profile-content">
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <img
                                src={user.avatar ? `${API_URL}/profile/avatar/${user.avatar}` : "/default-avatar.png"}
                                alt="Avatar"
                                width={100}
                                height={100}
                                style={{ borderRadius: "50%", objectFit: "cover" }}
                            />
                            {editMode && (
                                <>
                                    <input type="file" onChange={handleAvatarChange} />
                                    <button onClick={handleAvatarUpload} style={{ marginTop: 8 }}>Rasmini yuklash</button>
                                </>
                            )}
                        </div>
                        {msg && <div style={{ color: "#990000", marginBottom: 10 }}>{msg}</div>}

                        {!editMode ? (
                            <>
                                <p><strong>Ism:</strong> {user.name}</p>
                                <p><strong>Familiya:</strong> {user.surname}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Telefon:</strong> {user.phone}</p>
                                <p><strong>Tug‘ilgan sana:</strong> {user.birthday}</p>
                                <p><strong>Jinsi:</strong> {user.gender}</p>
                                <p><strong>Manzil:</strong> {user.address}</p>
                            </>
                        ) : (
                            <>
                                <input className="input" type="text" name="name" value={editForm.name || ""} onChange={handleChange} placeholder="Ism" />
                                <input className="input" type="text" name="surname" value={editForm.surname || ""} onChange={handleChange} placeholder="Familiya" />
                                <input className="input" type="email" name="email" value={editForm.email || ""} onChange={handleChange} placeholder="Email" />
                                <input className="input" type="tel" name="phone" value={editForm.phone || ""} onChange={handleChange} placeholder="Telefon" />
                                <input className="input" type="date" name="birthday" value={editForm.birthday || ""} onChange={handleChange} placeholder="Tug‘ilgan sana" />
                                <select className="input" name="gender" value={editForm.gender || ""} onChange={handleChange}>
                                    <option value="">Jinsi</option>
                                    <option value="Erkak">Erkak</option>
                                    <option value="Ayol">Ayol</option>
                                </select>
                                <input className="input" type="text" name="address" value={editForm.address || ""} onChange={handleChange} placeholder="Manzil" />
                            </>
                        )}
                    </div>

                    {/* HAR DOIM PASTDA CHIQADIGAN TUGMALAR */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {editMode ? (
                            <>
                                <button onClick={handleSaveEdit} className="logout__btn">Saqlash</button>
                                <button onClick={() => setEditMode(false)} className="logout__btn" style={{ background: "#999" }}>Bekor qilish</button>
                            </>
                        ) : (
                            <button onClick={handleEditClick} className="logout__btn">Tahrirlash</button>
                        )}
                        <button onClick={handleLogout} className="logout__btn" style={{ marginTop: 10 }}>Chiqish</button>
                    </div>
                </div>

            )}
        </>
    );
};

export default Navbar;

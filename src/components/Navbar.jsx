import React, { useContext, useState } from "react";
import Logo from "../assets/icons/logo.jpg";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
    const { user, setUser, logout } = useContext(UserContext);
    const [showProfile, setShowProfile] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});

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
                setUser(data.user); // context yangilanadi
                localStorage.setItem("token", data.token); // yangi token ham saqlanadi
                setEditMode(false);
                setShowProfile(true);
                alert("Profil yangilandi!");
            } else {
                alert("Xatolik: " + (data.msg || "Profil yangilanmadi"));
            }
        } catch (err) {
            alert("Tarmoq xatoligi yoki server ishlamayapti.");
        }
    };


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
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" fill="#770E13" viewBox="0 -960 960 960">
                                            <path d="M480-480.67q-66 0-109.67-43.66Q326.67-568 326.67-634t43.66-109.67Q414-787.33 480-787.33t109.67 43.66Q633.33-700 633.33-634t-43.66 109.67Q546-480.67 480-480.67ZM160-160v-100q0-36.67 18.5-64.17T226.67-366q65.33-30.33 127.66-45.5 62.34-15.17 125.67-15.17t125.33 15.5q62 15.5 127.28 45.3 30.54 14.42 48.96 41.81Q800-296.67 800-260v100H160Z" />
                                        </svg>
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
                    <button className="close-btn" onClick={() => { setShowProfile(false); setEditMode(false); }}>×</button>
                    <h3>Foydalanuvchi ma’lumotlari</h3>
                    {!editMode ? (
                        <>
                            <p><strong>Ism:</strong> {user.name}</p>
                            <p><strong>Familiya:</strong> {user.surname}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Telefon:</strong> {user.phone}</p>
                            <p><strong>Tug‘ilgan sana:</strong> {user.birthday}</p>
                            <p><strong>Jinsi:</strong> {user.gender}</p>
                            <p><strong>Manzil:</strong> {user.address}</p>
                            <button onClick={handleEditClick} className="logout__btn" style={{ marginTop: 12 }}>Tahrirlash</button>
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
                            <button onClick={handleSaveEdit} className="logout__btn" style={{ marginTop: 12 }}>Saqlash</button>
                            <button onClick={() => setEditMode(false)} className="logout__btn" style={{ background: "#999", marginTop: 8 }}>Bekor qilish</button>
                        </>
                    )}
                    <button onClick={handleLogout} className="logout__btn" style={{ marginTop: 18 }}>Chiqish</button>
                </div>
            )}
        </>
    );
};

export default Navbar;

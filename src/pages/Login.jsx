import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);

                // JWT dan foydalanuvchi ma’lumotini to‘liq olish
                const payload = JSON.parse(atob(data.token.split(".")[1]));
                setUser(payload); // <-- TO‘LIQ foydalanuvchi ma’lumotlari

                navigate("/");
            } else {
                alert(`Xatolik: ${data.msg}`);
            }
        } catch (err) {
            alert("Tarmoq xatoligi yuz berdi.");
            console.error(err);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page-elements">
                <h2>Kirish</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        className="input"
                        type="email"
                        placeholder="Email kiriting"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Parol kiriting"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="btn--submit" type="submit">Kirish</button>
                </form>
            </div>
        </div>
    );
}

export default Login;

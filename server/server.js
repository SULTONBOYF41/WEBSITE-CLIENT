const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db/database');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Signup
app.post('/api/signup', (req, res) => {
  const { name, surname, email, phone, password, birthday, gender, address } = req.body;
  if (!name || !surname || !email || !phone || !password || !birthday || !gender) {
    return res.status(400).json({ msg: "Barcha maydonlarni to'ldiring!" });
  }
  const hash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (name, surname, email, phone, password, birthday, gender, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, surname, email, phone, hash, birthday, gender, address],
    function (err) {
      if (err) return res.status(409).json({ msg: "Email allaqachon mavjud yoki xatolik" });
      // Foydalanuvchiga JWT token va barcha ma’lumotlarni qaytaramiz
      const user = { id: this.lastID, name, surname, email, phone, birthday, gender, address };
      const token = jwt.sign(user, "secret_key");
      res.json({ msg: "Ro‘yxatdan o‘tish muvaffaqiyatli", token, ...user });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(401).json({ msg: 'Email yoki parol xato' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Email yoki parol xato' });

    // JWT token va barcha user ma’lumotlarini yuboramiz
    const token = jwt.sign({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      gender: user.gender,
      address: user.address
    }, 'secret_key');

    res.json({
      token,
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      gender: user.gender,
      address: user.address
    });
  });
});

// Middleware: token orqali userni aniqlash
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Token yo‘q' });
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ msg: 'Token noto‘g‘ri' });
  }
}

// Profil yangilash endpointi
app.put('/api/profile', authMiddleware, (req, res) => {
  const id = req.user.id;
  const { name, surname, email, phone, birthday, gender, address } = req.body;

  console.log('UPDATE users SET ...', { id, name, surname, email, phone, birthday, gender, address });

  db.run(
    `UPDATE users SET
      name = ?,
      surname = ?,
      email = ?,
      phone = ?,
      birthday = ?,
      gender = ?,
      address = ?
     WHERE id = ?`,
    [name, surname, email, phone, birthday, gender, address, id],
    function (err) {
      if (err) {
        console.log('DB ERROR:', err);
        return res.status(500).json({ msg: 'Bazaga saqlashda xatolik', detail: err.message });
      }
      const user = { id, name, surname, email, phone, birthday, gender, address };
      const token = jwt.sign(user, "secret_key");
      res.json({ msg: "Profil yangilandi!", user, token });
    }
  );
});

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});

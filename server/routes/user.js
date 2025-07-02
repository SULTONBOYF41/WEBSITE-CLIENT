// server/routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

// Multer sozlamalari
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ===================== PROFILE =====================

// Profil olish (token bilan)
router.get('/profile', authMiddleware, (req, res) => {
  const id = req.user.id;
  db.get('SELECT id, name, surname, email, phone, birthday, gender, address, avatar FROM users WHERE id = ?', [id], (err, user) => {
    if (err || !user) return res.status(404).json({ msg: 'User topilmadi' });
    res.json(user);
  });
});

// ===================== SIGNUP (AVATAR bilan) =====================

// YANGILANGAN: Signup — avatar rasm bilan
router.post('/signup', upload.single('avatar'), (req, res) => {
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  
  const { name, surname, email, phone, password, birthday, gender, address } = req.body;
  const avatar = req.file ? req.file.filename : null;

  if (!name || !surname || !email || !phone || !password || !birthday || !gender) {
    // Rasm majburiy emas, lekin boshqa maydonlar majburiy
    return res.status(400).json({ msg: "Barcha maydonlarni to'ldiring!" });
  }
  const hash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (name, surname, email, phone, password, birthday, gender, address, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, surname, email, phone, hash, birthday, gender, address, avatar],
    function (err) {
      if (err) return res.status(409).json({ msg: "Email allaqachon mavjud yoki xatolik" });
      const user = {
        id: this.lastID, name, surname, email, phone, birthday, gender, address, avatar
      };
      const token = jwt.sign(user, "secret_key");
      res.json({ msg: "Ro‘yxatdan o‘tish muvaffaqiyatli", token, ...user });
    }
  );
});

// ===================== LOGIN =====================
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(401).json({ msg: 'Email yoki parol xato' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Email yoki parol xato' });

    const token = jwt.sign({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
      gender: user.gender,
      address: user.address,
      avatar: user.avatar
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
      address: user.address,
      avatar: user.avatar
    });
  });
});

// ===================== PROFILNI YANGILASH =====================
router.put('/profile', authMiddleware, (req, res) => {
  const id = req.user.id;
  const { name, surname, email, phone, birthday, gender, address } = req.body;

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
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        const userData = {
          id,
          name,
          surname,
          email,
          phone,
          birthday,
          gender,
          address,
          avatar: user?.avatar || null
        };
        const token = jwt.sign(userData, "secret_key");
        res.json({ msg: "Profil yangilandi!", user: userData, token });
      });
    }
  );
});

// ===================== AVATAR YUKLASH =====================
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  console.log('==== avatar upload ====');
  console.log('file:', req.file);
  console.log('user:', req.user);

  const userId = req.user.id;
  const avatar = req.file ? req.file.filename : null;
  if (!avatar) return res.status(400).json({ msg: 'Fayl topilmadi' });

  // Eski avatarni o'chirish (agar mavjud bo'lsa)
  db.get('SELECT avatar FROM users WHERE id = ?', [userId], (err, user) => {
    if (user && user.avatar) {
      const oldPath = path.join('uploads', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Yangi avatar nomini saqlash
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId], function (err) {
      if (err) return res.status(500).json({ msg: 'Yuklashda xatolik' });
      res.json({ msg: 'Avatar muvaffaqiyatli yuklandi', avatar });
    });
  });
});

// ===================== AVATARNI OLIB KO‘RISH =====================
router.get('/profile/avatar/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ msg: 'Fayl topilmadi' });
  }
});

// ===================== PAROLNI O‘ZGARTIRISH =====================
router.put('/profile/password', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ msg: "Ikkala parol ham kiritilsin!" });

  db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) return res.status(404).json({ msg: 'User topilmadi' });
    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Eski parol noto'g'ri" });

    const hash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hash, userId], function (err) {
      if (err) return res.status(500).json({ msg: 'Bazaga yozishda xatolik' });
      res.json({ msg: "Parol muvaffaqiyatli o'zgartirildi!" });
    });
  });
});

module.exports = router;

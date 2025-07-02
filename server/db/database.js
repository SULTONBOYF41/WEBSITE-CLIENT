// server/db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) return console.error('DB error:', err.message);
  console.log('Connected to SQLite DB');
});

// Users table agar bo‘lmasa yaratiladi
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar TEXT,
    name TEXT,
    surname TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    birthday TEXT,
    gender TEXT,
    address TEXT
  )
`);


module.exports = db;

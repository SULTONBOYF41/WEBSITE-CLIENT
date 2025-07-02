const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// !!! Ushbu qatorlarni qo'shing !!!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Bu /uploads/avatar.jpg ga ochiq kirish beradi

// Routerni ulash
const userRouter = require('./routes/user');
app.use('/api', userRouter);

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});

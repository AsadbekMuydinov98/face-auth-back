const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.route');
const checkRoutes = require('./routes/check.route');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
app.use(express.json());

// CORS sozlash
const corsOptions = {
  origin: ['http://localhost:5173', 'https://face-auth-two.vercel.app/'], // Ruxsat berilgan domenlar
  methods: 'GET,POST,PUT,DELETE', // Ruxsat berilgan HTTP metodlar
  credentials: true, // Cookie va autentifikatsiya ma'lumotlarini yuborishga ruxsat
};

app.use(cors(corsOptions));
app.use(fileUpload({}));
app.use('/static', express.static(path.join(__dirname, 'static')));

const PORT = process.env.PORT || 4000;

const bootstrap = async () => {
  try {
    await mongoose.connect('mongodb+srv://asasedmor:4aBz0btJqLcRDhs2@cluster0.qswkqgp.mongodb.net/?retryWrites=true&w=majority&appName=Ecom/myDatabase');
    console.log('Connected DB');
  } catch (error) {
    console.log(`Error connecting with DB: ${error}`);
  }
};

bootstrap();

app.use('/api/auth', authRoutes);
app.use('/api/check', checkRoutes);

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishlayapti`);
});
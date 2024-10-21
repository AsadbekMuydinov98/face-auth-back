const authService = require('../service/auth.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const fs = require('fs');

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });


const { loadModels } = require('../utils/faceDetection');
loadModels();


const signup = async (req, res) => {
  const { name, email, password , picture} = req.body;

  try {
    const token = await authService.createUser(name, email, password, picture);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await authService.loginUser(email, password);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const profile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).send('Serverda xato');
  }
};


const faceLogin = async (req, res) => {
  const { picture } = req.body;

  if (!picture) {
    return res.status(400).json({ msg: "Rasm yuborilmadi" });
  }

  try {
    // Yuzni tahlil qilish
    const base64Data = picture.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const inputImage = await canvas.loadImage(imageBuffer);
    const inputDescriptor = await faceapi.detectSingleFace(inputImage).withFaceLandmarks().withFaceDescriptor();

    if (!inputDescriptor) {
      return res.status(400).json({ msg: "Yuz topilmadi" });
    }

    // Foydalanuvchilarni bazadan olish
    const users = await userModel.find({});

    for (const user of users) {
      if (!user.picture) {
        continue; // Agar foydalanuvchi rasmi yo'q bo'lsa, davom ettiramiz
      }

      // To'liq yo'lni yarating
      const imagePath = path.join(__dirname, '../static', user.picture);
      
      const storedImage = await canvas.loadImage(imagePath); // fetchImage o'rniga
      const storedDescriptor = await faceapi.detectSingleFace(storedImage).withFaceLandmarks().withFaceDescriptor();

      if (!storedDescriptor) {
        continue; // Agar saqlangan rasmda yuz topilmasa, davom ettiramiz
      }

      // Descriptorlar o'rtasidagi masofani solishtirish
      const distance = faceapi.euclideanDistance(inputDescriptor.descriptor, storedDescriptor.descriptor);

      if (distance < 0.6) {
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, 'secretTokenKey', { expiresIn: '1h' });

        return res.json({ user, msg: "Muvaffaqiyatli kirish", token });
      }
    }

    return res.status(401).json({ msg: "Foydalanuvchi topilmadi" });
  } catch (error) {
    return res.status(500).json({ msg: `Xatolik yuz berdi: ${error.message}` });
  }
};





const checkFaces = async (req, res) => {
  const { descriptor } = req.body;

  if (!descriptor || !Array.isArray(descriptor)) {
    return res.status(400).json({ msg: "Descriptor yuborilmadi yoki noto'g'ri format" });
  }

  try {
    // Foydalanuvchilarni bazadan olish
    const users = await userModel.find({});
    const recognizedUsers = [];

    for (const user of users) {
      if (!user.picture) {
        continue; // Agar foydalanuvchi rasmi yo'q bo'lsa, davom ettiramiz
      }

      const imagePath = path.join(__dirname, '../static', user.picture);

      // Rasm faylini tekshirish
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ msg: "Rasm topilmadi: " + imagePath });
      }

      
      const storedImage = await canvas.loadImage(imagePath); // fetchImage o'rniga
      const storedDescriptor = await faceapi.detectSingleFace(storedImage).withFaceLandmarks().withFaceDescriptor();


      if (!storedDescriptor) {
        continue; // Agar saqlangan rasmda yuz topilmasa, davom ettiramiz
      }

      const distance = faceapi.euclideanDistance(descriptor, storedDescriptor.descriptor);

      if (distance < 0.6) {
        recognizedUsers.push({ name: user.name, picture: user.picture });
      }
    }

    if (recognizedUsers.length > 0) {
      return res.json({ msg: "Foydalanuvchilar topildi", recognizedUsers });
    }

    return res.status(401).json({ msg: "Foydalanuvchi topilmadi" });
  } catch (error) {
    return res.status(500).json({ msg: `Xatolik yuz berdi: ${error.message}` });
  }
};




module.exports = {
  signup,
  login,
  profile,
  faceLogin,
  checkFaces
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const fileService = require('./file.service')

const secretKey = 'secretTokenKey';

const createUser = async (name, email, password, picture) => {
  const fileName = fileService.save(picture)
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    throw new Error('Foydalanuvchi allaqachon mavjud');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new userModel({ name, email, password: hashedPassword, picture: fileName });
  await user.save();

  const payload = {
    user: { id: user.id }
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: '7d' });
  return token;
};

const loginUser = async (email, password) => {
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error('Foydalanuvchi topilmadi');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Parol noto\'g\'ri');
  }

  const payload = {
    user: { id: user.id }
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  return token;
};

const getUserProfile = async (userId) => {
  const user = await userModel.findById(userId).select('-password');
  return user;
};

module.exports = {
  createUser,
  loginUser,
  getUserProfile
};

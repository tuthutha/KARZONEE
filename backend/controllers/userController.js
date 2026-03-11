import mongoose from 'mongoose';
import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// TOKEN
const TOKEN_EXPIRES_IN = '24h';
const JWT_SECRET = 'your_jwt_secret_here';

const createToken = (userId) => {
  const secret = JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined on the server');
  return jwt.sign({ id: userId }, secret, { expiresIn: TOKEN_EXPIRES_IN });
};

// REGISTER FUNCTION

export async function register(req, res) {
  try {
    const name = String(req.body.name || '').trim();
    const emailRaw = String(req.body.email || '').trim();
    const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 8 ký tự',
      });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được đăng ký',
      });
    }

    const newId = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      _id: newId,
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = createToken(newId.toString());

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error', err);
    if (err.code === 11000)
      return res.status(409).json({
        success: false,
        message: 'Email đã được đăng ký',
      });

    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
    });
  }
}

// LOGIN FUNCTION

export async function login(req, res) {
  try {
    const emailRaw = String(req.body.email || '').trim();
    const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}

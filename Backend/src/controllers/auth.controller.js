const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    // httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    // httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = new User({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({ user, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push(refreshToken);
    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    res.json({ user, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    // Rotate tokens
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setTokenCookies(res, accessToken, newRefreshToken);
    res.json({ message: 'Tokens refreshed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshTokens: token });
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        await user.save();
      }
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, refresh, logout, getMe };
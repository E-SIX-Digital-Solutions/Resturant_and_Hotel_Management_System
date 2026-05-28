import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (name, email, password, role = 'admin') => {
  let user = await User.findOne({ email });

  if (user) {
    throw new Error('User already exists');
  }

  user = new User({ name, email, password, role });
  await user.save();

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

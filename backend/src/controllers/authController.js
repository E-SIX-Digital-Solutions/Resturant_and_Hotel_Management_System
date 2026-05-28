import { asyncHandler } from '../middleware/asyncHandler.js';
import { registerValidation, loginValidation } from '../validations/index.js';
import { registerUser, loginUser } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = asyncHandler(async (req, res) => {
  const { error, value } = registerValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  const result = await registerUser(value.name, value.email, value.password, value.role);

  successResponse(res, 201, 'User registered successfully', result);
});

export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  const result = await loginUser(value.email, value.password);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  successResponse(res, 200, 'Login successful', result);
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  successResponse(res, 200, 'Logout successful');
});

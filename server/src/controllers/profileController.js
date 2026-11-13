import * as db from '../services/supabase/dbService.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await db.getProfile(req.farmerId);
    res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch profile', 500, 'DATABASE_ERROR', error.message));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await db.updateProfile(req.farmerId, req.body);
    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(new AppError('Failed to update profile', 500, 'DATABASE_ERROR', error.message));
  }
};

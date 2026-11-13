import { supabase, supabaseAdmin } from '../config/supabase.js';
import { hasSupabaseConfig } from '../config/env.js';
import { AppError } from './errorHandler.js';

// Default mock farmer for development/testing when Supabase credentials are not set
export const DEV_DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

export const authenticateFarmer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (hasSupabaseConfig && token) {
      // Validate Supabase Auth token
      const client = supabaseAdmin || supabase;
      const { data: { user }, error } = await client.auth.getUser(token);

      if (error || !user) {
        return next(new AppError('Invalid or expired authentication session', 401, 'UNAUTHORIZED'));
      }

      req.user = user;
      req.farmerId = user.id;
      return next();
    }

    // In local development mode without Supabase or for testing
    const devFarmerId = req.headers['x-farmer-id'] || req.headers['x-mock-farmer-id'] || DEV_DEFAULT_FARMER_ID;
    
    if (!hasSupabaseConfig) {
      req.user = {
        id: devFarmerId,
        email: 'farmer@agripulse.ai',
        user_metadata: { full_name: 'Kisan Patel' },
      };
      req.farmerId = devFarmerId;
      return next();
    }

    if (!token) {
      return next(new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED'));
    }

    return next(new AppError('Authentication failed', 401, 'UNAUTHORIZED'));
  } catch (error) {
    next(new AppError('Authentication verification failed', 401, 'UNAUTHORIZED', error.message));
  }
};

import * as db from '../services/supabase/dbService.js';
import { AppError } from '../middleware/errorHandler.js';

export const listPlots = async (req, res, next) => {
  try {
    const plots = await db.getPlots(req.farmerId);
    res.json({
      success: true,
      data: plots,
      message: 'Plots retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch plots', 500, 'DATABASE_ERROR', error.message));
  }
};

export const getPlot = async (req, res, next) => {
  try {
    const plot = await db.getPlotById(req.farmerId, req.params.id);
    if (!plot) {
      return next(new AppError('Plot not found or access denied', 404, 'NOT_FOUND'));
    }
    res.json({
      success: true,
      data: plot,
      message: 'Plot retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to retrieve plot', 500, 'DATABASE_ERROR', error.message));
  }
};

export const createPlot = async (req, res, next) => {
  try {
    const created = await db.createPlot(req.farmerId, req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Farm plot created successfully',
    });
  } catch (error) {
    next(new AppError('Failed to create farm plot', 500, 'DATABASE_ERROR', error.message));
  }
};

export const updatePlot = async (req, res, next) => {
  try {
    const updated = await db.updatePlot(req.farmerId, req.params.id, req.body);
    if (!updated) {
      return next(new AppError('Plot not found or access denied', 404, 'NOT_FOUND'));
    }
    res.json({
      success: true,
      data: updated,
      message: 'Farm plot updated successfully',
    });
  } catch (error) {
    next(new AppError('Failed to update farm plot', 500, 'DATABASE_ERROR', error.message));
  }
};

export const deletePlot = async (req, res, next) => {
  try {
    const deleted = await db.deletePlot(req.farmerId, req.params.id);
    if (!deleted) {
      return next(new AppError('Plot not found or access denied', 404, 'NOT_FOUND'));
    }
    res.json({
      success: true,
      data: { id: req.params.id },
      message: 'Farm plot deleted successfully',
    });
  } catch (error) {
    next(new AppError('Failed to delete farm plot', 500, 'DATABASE_ERROR', error.message));
  }
};

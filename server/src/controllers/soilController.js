import * as db from '../services/supabase/dbService.js';
import { analyzeSoilData } from '../services/gemini/soilAnalyzer.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSoilRecords = async (req, res, next) => {
  try {
    const plotId = req.params.id;
    const records = await db.getSoilRecordsByPlot(req.farmerId, plotId);
    res.json({
      success: true,
      data: records,
      message: 'Soil records retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch soil records', 500, 'DATABASE_ERROR', error.message));
  }
};

export const createSoilRecord = async (req, res, next) => {
  try {
    const plotId = req.params.id || req.body.plot_id;
    const newRecord = await db.createSoilRecord(req.farmerId, {
      ...req.body,
      plot_id: plotId,
    });
    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Soil record saved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to save soil record', 500, 'DATABASE_ERROR', error.message));
  }
};

export const analyzeSoil = async (req, res, next) => {
  try {
    const soilData = req.body;
    let plot = {};
    if (soilData.plot_id) {
      plot = (await db.getPlotById(req.farmerId, soilData.plot_id)) || {};
    }
    const profile = await db.getProfile(req.farmerId);
    const analysis = await analyzeSoilData(soilData, plot, profile?.preferred_language || 'en');

    // Optionally save the record if plot_id is present
    if (soilData.plot_id && soilData.save_record) {
      await db.createSoilRecord(req.farmerId, soilData);
    }

    res.json({
      success: true,
      data: analysis,
      message: 'Soil analysis completed successfully',
    });
  } catch (error) {
    next(new AppError('Failed to analyze soil data', 500, 'AI_ANALYSIS_ERROR', error.message));
  }
};

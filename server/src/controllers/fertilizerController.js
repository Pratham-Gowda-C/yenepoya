import * as db from '../services/supabase/dbService.js';
import { generateFertilizerPlan } from '../services/gemini/fertilizerAdvisor.js';
import { AppError } from '../middleware/errorHandler.js';

export const recommendFertilizer = async (req, res, next) => {
  try {
    const { crop_name, growth_stage, plot_id, farm_area, area_unit, nitrogen, phosphorus, potassium, ph, language } = req.body;

    let soilData = { nitrogen, phosphorus, potassium, ph };
    let area = farm_area || 1;
    let unit = area_unit || 'acres';

    if (plot_id) {
      const plot = await db.getPlotById(req.farmerId, plot_id);
      if (plot) {
        area = farm_area || plot.area;
        unit = area_unit || plot.area_unit;
      }
      const soilRecords = await db.getSoilRecordsByPlot(req.farmerId, plot_id);
      if (soilRecords && soilRecords.length > 0) {
        const latest = soilRecords[0];
        soilData = {
          nitrogen: nitrogen ?? latest.nitrogen,
          phosphorus: phosphorus ?? latest.phosphorus,
          potassium: potassium ?? latest.potassium,
          ph: ph ?? latest.ph,
        };
      }
    }

    const plan = await generateFertilizerPlan({
      cropName: crop_name,
      growthStage: growth_stage,
      farmArea: area,
      areaUnit: unit,
      soilData,
      language: language || 'en',
    });

    const saved = await db.saveFertilizerPlan(req.farmerId, {
      plot_id: plot_id || null,
      crop_name,
      growth_stage,
      fertilizer_data: plan,
    });

    res.status(201).json({
      success: true,
      data: {
        id: saved.id,
        ...plan,
        created_at: saved.created_at,
      },
      message: 'Fertilizer plan formulated successfully',
    });
  } catch (error) {
    next(new AppError('Failed to formulate fertilizer advisory', 500, 'AI_ADVISORY_ERROR', error.message));
  }
};

export const getFertilizerHistory = async (req, res, next) => {
  try {
    const history = await db.getFertilizerHistory(req.farmerId);
    res.json({
      success: true,
      data: history,
      message: 'Fertilizer advisory history retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch fertilizer advisory history', 500, 'DATABASE_ERROR', error.message));
  }
};

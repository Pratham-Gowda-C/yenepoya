import * as db from '../services/supabase/dbService.js';
import { diagnosePlantDisease } from '../services/gemini/diseaseDetector.js';
import { supabaseAdmin, supabase } from '../config/supabase.js';
import { hasSupabaseConfig } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

export const diagnoseDisease = async (req, res, next) => {
  try {
    const { crop_name, plant_part, symptoms, plot_id, language } = req.body;
    const file = req.file;

    if (!crop_name) {
      return next(new AppError('Crop name is required', 400, 'VALIDATION_ERROR'));
    }

    let imagePath = null;

    // If file provided and Supabase configured, upload to Supabase Storage
    if (file) {
      if (hasSupabaseConfig) {
        const client = supabaseAdmin || supabase;
        const fileExt = file.originalname ? file.originalname.split('.').pop() : 'jpg';
        const fileName = `${req.farmerId}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await client.storage
          .from('crop-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = client.storage.from('crop-images').getPublicUrl(fileName);
          imagePath = publicUrl || fileName;
        } else {
          console.warn('Supabase storage upload failed, using local identifier:', uploadError?.message);
          imagePath = `uploads/${fileName}`;
        }
      } else {
        // Fallback data URI for local development preview
        imagePath = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    }

    // Call Gemini Multimodal Disease Diagnosis
    const diagnosisResult = await diagnosePlantDisease({
      imageBuffer: file ? file.buffer : null,
      mimeType: file ? file.mimetype : 'image/jpeg',
      cropName: crop_name,
      plantPart: plant_part || 'Leaf',
      symptoms: symptoms || '',
      language: language || 'en',
    });

    // Save record to database
    const saved = await db.saveDiseaseDiagnosis(req.farmerId, {
      plot_id: plot_id || null,
      crop_name,
      image_path: imagePath,
      symptoms,
      diagnosis: diagnosisResult,
      ai_model: 'Gemini-Vision-PlantPathology',
    });

    res.status(201).json({
      success: true,
      data: {
        id: saved.id,
        image_path: imagePath,
        ...diagnosisResult,
        created_at: saved.created_at,
      },
      message: 'Plant disease diagnosis completed successfully',
    });
  } catch (error) {
    next(new AppError('Failed to complete disease diagnosis', 500, 'AI_DIAGNOSIS_ERROR', error.message));
  }
};

export const getDiseaseHistory = async (req, res, next) => {
  try {
    const history = await db.getDiseaseHistory(req.farmerId);
    res.json({
      success: true,
      data: history,
      message: 'Disease diagnosis history retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch disease diagnosis history', 500, 'DATABASE_ERROR', error.message));
  }
};

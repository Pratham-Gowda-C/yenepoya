import * as db from '../services/supabase/dbService.js';
import { handleAgriculturalChat } from '../services/gemini/chatAssistant.js';
import { fetchWeatherData } from '../services/weather/weatherService.js';
import { AppError } from '../middleware/errorHandler.js';

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await db.getChatConversations(req.farmerId);
    res.json({
      success: true,
      data: conversations,
      message: 'Chat conversations retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch chat conversations', 500, 'DATABASE_ERROR', error.message));
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { title, language } = req.body;
    const conversation = await db.createChatConversation(
      req.farmerId,
      title || 'New Crop Consultation',
      language || 'en'
    );
    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Chat conversation created successfully',
    });
  } catch (error) {
    next(new AppError('Failed to create chat conversation', 500, 'DATABASE_ERROR', error.message));
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const messages = await db.getChatMessages(req.farmerId, conversationId);
    res.json({
      success: true,
      data: messages,
      message: 'Messages retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch messages', 500, 'DATABASE_ERROR', error.message));
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { message, plot_id, language } = req.body;

    if (!message || !message.trim()) {
      return next(new AppError('Message content cannot be empty', 400, 'VALIDATION_ERROR'));
    }

    // Save user's question
    const userMsg = await db.addChatMessage(req.farmerId, conversationId, 'user', message.trim());

    // Context gathering
    const profile = await db.getProfile(req.farmerId);
    let plot = {};
    let soil = {};

    if (plot_id) {
      plot = (await db.getPlotById(req.farmerId, plot_id)) || {};
      const soilRecords = await db.getSoilRecordsByPlot(req.farmerId, plot_id);
      if (soilRecords && soilRecords.length > 0) soil = soilRecords[0];
    } else {
      const allPlots = await db.getPlots(req.farmerId);
      if (allPlots && allPlots.length > 0) {
        plot = allPlots[0];
        const soilRecords = await db.getSoilRecordsByPlot(req.farmerId, plot.id);
        if (soilRecords && soilRecords.length > 0) soil = soilRecords[0];
      }
    }

    const weather = await fetchWeatherData(plot.latitude || 12.9716, plot.longitude || 77.5946);
    const history = await db.getChatMessages(req.farmerId, conversationId);

    // Call Gemini Agricultural Assistant
    const aiResponse = await handleAgriculturalChat({
      message: message.trim(),
      history,
      farmerProfile: profile,
      plot,
      soil,
      weather,
      language: language || profile?.preferred_language || 'en',
    });

    // Save AI assistant reply
    const assistantMsg = await db.addChatMessage(
      req.farmerId,
      conversationId,
      'assistant',
      aiResponse.answer,
      {
        intent: aiResponse.intent,
        related_actions: aiResponse.related_actions,
        missing_information: aiResponse.missing_information,
        safety_notice: aiResponse.safety_notice,
      }
    );

    res.status(201).json({
      success: true,
      data: {
        user_message: userMsg,
        assistant_message: assistantMsg,
        structured: aiResponse,
      },
      message: 'Message processed successfully',
    });
  } catch (error) {
    next(new AppError('Failed to process chat message', 500, 'AI_ASSISTANT_ERROR', error.message));
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const deleted = await db.deleteChatConversation(req.farmerId, req.params.id);
    if (!deleted) {
      return next(new AppError('Conversation not found or access denied', 404, 'NOT_FOUND'));
    }
    res.json({
      success: true,
      data: { id: req.params.id },
      message: 'Chat conversation deleted successfully',
    });
  } catch (error) {
    next(new AppError('Failed to delete chat conversation', 500, 'DATABASE_ERROR', error.message));
  }
};

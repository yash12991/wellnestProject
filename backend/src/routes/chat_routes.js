import express from 'express';
const router = express.Router();
import {
  createOrGetSession,
  getUserSessions,
  startNewSession,
  sendChatMessage,
 
  sendChatMessageStream,
 
  getChatHistory,
  getUserContext,
  getCacheStats,
  clearCacheForSession,
  getChatbotStatus,
  requestMealReplacement,
  confirmMealReplacement,
  modifyMeal,
  aiUpdateMeal,
  getContextualSuggestions,
  updateMealPreferences,
  getCurrentMealPlan,
  toggleRecipeMode,
  getDetailedRecipe,
  getRecipeSuggestions
} from '../controllers/chat.controllers.js';

// Auth middleware
import { verifyJWT } from '../middleware/auth.middleware.js';

// Create or get existing chat session
router.post('/session', verifyJWT, createOrGetSession);

// Get user's chat sessions
router.get('/sessions/:userId', verifyJWT, getUserSessions);

// Start new chat session
router.post('/session/new', verifyJWT, startNewSession);

// Send chat message (proxy to external API)
router.post('/message', verifyJWT, sendChatMessage);
 
// Streamed chat message (SSE-like text stream)
router.post('/message/stream', verifyJWT, sendChatMessageStream);
 

// Get chat history (proxy to external API)
router.get('/history/:sessionId', verifyJWT, getChatHistory);

// Get user context for system prompt
router.get('/user-context/:userId', verifyJWT, getUserContext);

// Cache monitoring and management endpoints
router.get('/cache/stats', verifyJWT, getCacheStats);
router.delete('/cache/:sessionId', verifyJWT, clearCacheForSession);

// Smart meal replacement and modification endpoints
router.post('/meal/replace', verifyJWT, requestMealReplacement);
router.post('/meal/confirm-replace', verifyJWT, confirmMealReplacement);
router.post('/meal/modify', verifyJWT, modifyMeal);
router.post('/meal/ai-update', verifyJWT, aiUpdateMeal);
router.get('/meal/suggestions/:userId', verifyJWT, getContextualSuggestions);
router.post('/meal/feedback', verifyJWT, updateMealPreferences);
router.get('/meal/current/:userId', verifyJWT, getCurrentMealPlan);

// Recipe endpoints - Enhanced cooking assistance
router.post('/recipe/toggle-mode', verifyJWT, toggleRecipeMode);
router.post('/recipe/detailed', verifyJWT, getDetailedRecipe);
router.post('/recipe/suggestions', verifyJWT, getRecipeSuggestions);

// System status endpoints
router.get('/status', getChatbotStatus); // Public endpoint for health checks

export default router;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  FireIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  HeartIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_URL } from '../utils/api';

const CompareApplyModal = ({ 
  isOpen, 
  onClose, 
  originalMeal, 
  dayOfWeek, 
  mealType, 
  onMealUpdated 
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [applying, setApplying] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mealPlanModeEnabled, setMealPlanModeEnabled] = useState(true);

  useEffect(() => {
    if (isOpen && originalMeal) {
      // Do NOT auto-fetch suggestions when modal opens. Wait for explicit user action (Refresh)
      // Reset previous suggestions so user must click Refresh to load AI suggestions
      setSuggestions([]);
      setSelectedSuggestion(null);
      setErrorMessage('');
      setShowSuccess(false);
      setUndoAvailable(false);
    }
    // read mealPlanMode from user preferences in localStorage (frontend toggle kept in AIChatbot)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const enabled = user?.preferences?.mealPlanMode === true || user?.preferences?.mealPlanMode === 'true';
      setMealPlanModeEnabled(enabled);
    } catch (e) {
      setMealPlanModeEnabled(true);
    }
  }, [isOpen, originalMeal]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // Use meal-specific replace endpoint so the planner and chat are decoupled
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.post(
        `${API_URL}/v1/api/chat/meal/replace`,
        {
          userId: user?._id,
          currentMeal: originalMeal,
          replacementReason: instruction || 'Suggest healthy alternatives based on my preferences'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.success) {
        // response.data.data should contain the replacements object from backend
        const reps = response.data.data?.replacements || response.data.data || [];
        setSuggestions(Array.isArray(reps) ? reps : (reps.replacements || []));
        setSelectedSuggestion((Array.isArray(reps) ? reps : (reps.replacements || []))[0] || null);
        setErrorMessage('');
      } else {
        const msg = response.data?.message || 'Failed to get suggestions from server';
        setErrorMessage(msg);
        setSuggestions([]);
        setSelectedSuggestion(null);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      const msg = error?.response?.data?.message || error.message || 'Failed to get suggestions';
      setErrorMessage(msg);
      setSuggestions([]);
      setSelectedSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  const applyReplacement = async () => {
    if (!selectedSuggestion) return;

    try {
      setApplying(true);
      setErrorMessage('');
      const token = localStorage.getItem('accessToken');
      const selectedIndex = suggestions.findIndex(s => s.name === selectedSuggestion.name);

      // Build a normalized replacement object with conservative defaults
      const safeNumber = (v, fallback = 0) => {
        if (v === undefined || v === null || Number.isNaN(Number(v))) return fallback;
        return Number(v);
      };

      const normalizedReplacement = {
        name: selectedSuggestion.name || selectedSuggestion.title || 'Replacement Meal',
        description: selectedSuggestion.description || selectedSuggestion.summary || '',
        calories: safeNumber(selectedSuggestion.calories, 300),
        macros: {
          protein: safeNumber((selectedSuggestion.macros && selectedSuggestion.macros.protein) || selectedSuggestion.protein, Math.round(300 * 0.2 / 4)),
          carbs: safeNumber((selectedSuggestion.macros && selectedSuggestion.macros.carbs) || selectedSuggestion.carbs, Math.round(300 * 0.5 / 4)),
          fat: safeNumber((selectedSuggestion.macros && selectedSuggestion.macros.fat) || selectedSuggestion.fats || selectedSuggestion.fat, Math.round(300 * 0.3 / 9))
        },
        prepTime: selectedSuggestion.prepTime || selectedSuggestion.cookTime || '30 min',
        difficulty: selectedSuggestion.difficulty || 'easy',
        ingredients: Array.isArray(selectedSuggestion.ingredients) ? selectedSuggestion.ingredients : (selectedSuggestion.ingredients ? [selectedSuggestion.ingredients] : []),
        instructions: selectedSuggestion.instructions || selectedSuggestion.recipe || selectedSuggestion.description || '',
        healthBenefits: selectedSuggestion.healthBenefits || selectedSuggestion.benefits || [],
        whyGoodReplacement: selectedSuggestion.whyGoodReplacement || selectedSuggestion.rationale || ''
      };

      const payloadReplacement = {
        name: normalizedReplacement.name,
        description: normalizedReplacement.description,
        calories: normalizedReplacement.calories,
        macros: {
          protein: normalizedReplacement.macros.protein,
          carbs: normalizedReplacement.macros.carbs,
          fat: normalizedReplacement.macros.fat
        },
        prepTime: normalizedReplacement.prepTime,
        difficulty: normalizedReplacement.difficulty,
        ingredients: normalizedReplacement.ingredients,
        instructions: normalizedReplacement.instructions,
        whyGoodReplacement: normalizedReplacement.whyGoodReplacement,
        healthBenefits: normalizedReplacement.healthBenefits
      };

      // Apply using the planner-specific confirm endpoint to keep chat and planner separate
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.post(
        `${API_URL}/v1/api/chat/meal/confirm-replace`,
        {
          userId: user?._id,
          dayOfWeek,
          mealType,
          selectedReplacement: payloadReplacement,
          selectedReplacementIndex: selectedIndex,
          replacementReason: instruction || 'Applied from Meal Planner UI'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setLastUpdate(response.data.data);
        setShowSuccess(true);
        setUndoAvailable(true);

        // Auto-hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);

        // Hide undo option after 10 seconds
        setTimeout(() => setUndoAvailable(false), 10000);

        // Notify parent component to refresh meal plan
        if (onMealUpdated) {
          onMealUpdated();
        }

        // Also fetch latest meal plan and broadcast so other components update immediately
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user?._id) {
            const latestResp = await axios.get(`${API_URL}/v1/api/mealplan/latest/${user._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            try {
              localStorage.setItem('latestMealPlan', JSON.stringify(latestResp.data));
            } catch (e) {
              console.warn('Could not store latestMealPlan in localStorage:', e);
            }
            window.dispatchEvent(new CustomEvent('mealplan:updated', { detail: latestResp.data }));
          }
        } catch (e) {
          console.warn('Could not fetch latest meal plan after apply:', e);
        }
      }
    } catch (error) {
      console.error('Error applying replacement:', error);
      // Show error to user when apply fails
      const message = error?.response?.data?.message || error?.message || 'Failed to apply replacement';
      setErrorMessage(message);
    } finally {
      setApplying(false);
    }
  };

  const undoReplacement = async () => {
    if (!lastUpdate) return;

    try {
      // This would require implementing an undo endpoint or restoring the original meal
      // For now, we'll just refresh the meal plan
      if (onMealUpdated) {
        onMealUpdated();
      }
      setUndoAvailable(false);
    } catch (error) {
      console.error('Error undoing replacement:', error);
    }
  };

  const requestVariation = () => {
    const variations = [
      'Make it spicier',
      'Make it healthier',
      'Make it vegan',
      'Make it with more protein',
      'Make it low-carb',
      'Make it with different spices'
    ];
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    setInstruction(randomVariation);
    fetchSuggestions();
  };

  const checkAllergyConflicts = (meal) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allergies = user.foodAllergies || [];
    
    if (allergies.length === 0) return { hasConflict: false, conflicts: [] };
    
    const conflicts = [];
    const mealText = `${meal.name} ${meal.description} ${meal.ingredients?.join(' ') || ''}`.toLowerCase();
    
    allergies.forEach(allergy => {
      if (mealText.includes(allergy.toLowerCase())) {
        conflicts.push(allergy);
      }
    });

    return { hasConflict: conflicts.length > 0, conflicts };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AI Meal Suggestions</h2>
                <p className="text-gray-300 mt-1">
                  {dayOfWeek} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-green-800 font-semibold">Meal Updated Successfully!</p>
                    <p className="text-green-600 text-sm">Your meal plan has been updated with the new meal.</p>
                  </div>
                </div>
                {undoAvailable && (
                  <button
                    onClick={undoReplacement}
                    className="text-green-700 hover:text-green-900 font-medium text-sm flex items-center gap-1"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Undo
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instruction Input */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instruction (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g., Make it vegan, Add more protein, Make it spicy..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchSuggestions}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Getting AI suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
                  <ArrowPathIcon className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No suggestions yet</h4>
                <p className="text-gray-600 mb-4">Click Refresh to get AI suggestions for this meal.</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={fetchSuggestions}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4" />
                        Get Suggestions
                      </>
                    )}
                  </button>
                  <button
                    onClick={requestVariation}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                  >
                    Request Variation
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Meal */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FireIcon className="h-5 w-5 text-gray-600" />
                    Current Meal
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{originalMeal?.dish || 'Unknown Meal'}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <FireIcon className="h-4 w-4" />
                        {originalMeal?.calories || 0} kcal
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        30 min
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {originalMeal?.recipe || 'Recipe details not available'}
                    </p>
                  </div>
                </div>

                {/* Selected Suggestion */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    AI Suggestion
                  </h3>
                  {selectedSuggestion ? (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{selectedSuggestion.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <FireIcon className="h-4 w-4" />
                          {selectedSuggestion.calories} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {selectedSuggestion.prepTime}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {selectedSuggestion.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        {selectedSuggestion.description}
                      </p>
                      
                      {/* Allergy Check */}
                      {(() => {
                        const allergyCheck = checkAllergyConflicts(selectedSuggestion);
                        return allergyCheck.hasConflict ? (
                          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg mb-3">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>⚠️ Contains: {allergyCheck.conflicts.join(', ')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg mb-3">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>✅ Allergies OK</span>
                          </div>
                        );
                      })()}

                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Why this works:</strong> {selectedSuggestion.whyGoodReplacement}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-500">
                      No suggestion selected
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Suggestion</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestion, index) => {
                    const allergyCheck = checkAllergyConflicts(suggestion);
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedSuggestion(suggestion)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSuggestion?.name === suggestion.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{suggestion.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>{suggestion.calories} kcal</span>
                          <span>•</span>
                          <span>{suggestion.prepTime}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {suggestion.description}
                        </p>
                        {allergyCheck.hasConflict && (
                          <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                            ⚠️ Contains allergens
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-wrap items-center justify-between gap-4">
            {errorMessage && (
              <div className="w-full mb-2 text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
            {/* informational note removed as requested */}
            <div className="flex gap-2">
              <button
                onClick={requestVariation}
                disabled={loading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Request Variation
              </button>
              <button
                onClick={() => {/* TODO: Save to favorites */}}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <HeartIcon className="h-4 w-4" />
                Save as Favorite
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={applyReplacement}
                disabled={!selectedSuggestion || applying || checkAllergyConflicts(selectedSuggestion || {}).hasConflict}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {applying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Applying...
                  </>
                ) : (
                  'Apply Changes'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareApplyModal;
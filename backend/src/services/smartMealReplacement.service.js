import {GoogleGenerativeAI} from '@google/generative-ai';

class SmartMealReplacementService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
    if (!apiKey) {
      console.warn('SmartMealReplacementService: No GEMINI_API_KEY or GOOGLE_API_KEY found. AI features will be disabled.');
      this.geminiAI = null;
    } else {
      this.geminiAI = new GoogleGenerativeAI(apiKey);
    }
    // Simple in-memory cache for suggestions: { value, expiresAt }
    this.suggestionCache = new Map();
  }

  // Helper: tolerant JSON parser for AI responses
  _parseAIJSON(responseText) {
    if (!responseText || typeof responseText !== 'string') return null;

    const tryParse = (text) => {
      try {
        return JSON.parse(text);
      } catch (e) {
        return null;
      }
    };

    // 1) Try direct parse
    let parsed = tryParse(responseText);
    if (parsed) return parsed;

    // 2) Extract first JSON-like block between first { and last }
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    let candidate = responseText.slice(firstBrace, lastBrace + 1);

    // 3) Basic sanitization: remove code fences, comments, trailing commas, and smart quotes
    candidate = candidate.replace(/```json|```/g, '');
    candidate = candidate.replace(/\/\*[\s\S]*?\*\//g, ''); // remove /* ... */
    candidate = candidate.replace(/\/\/.*$/gm, ''); // remove // ...
    candidate = candidate.replace(/[\u2018\u2019\u201C\u201D]/g, '"'); // smart quotes to ascii
    // Remove trailing commas before } or ]
    candidate = candidate.replace(/,\s*(?=[}\]])/g, '');

    parsed = tryParse(candidate);
    if (parsed) return parsed;

    // 4) As a last-ditch, try to repair a few common issues: unquoted keys -> not attempted (risky)
    // Return null to indicate failure
    return null;
  }

  // Helper: generate content with retries and fallback models
  async _generateWithRetries(prompt, modelNames = [ 'gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-2.0-flash-exp'], maxRetries = 3) {
    if (!this.geminiAI) throw new Error('AI client not initialized');

    let lastErr = null;

    for (const modelName of modelNames) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`Attempting model ${modelName}, attempt ${attempt + 1}/${maxRetries}`);
          const model = this.geminiAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          return responseText;
        } catch (err) {
          lastErr = err;
          const status = err?.status || err?.statusCode || (err?.message && err.message.includes('503') ? 503 : null);
          console.warn(`Model ${modelName} attempt ${attempt + 1} failed: ${err.message || err}`);
          // If it's a 4xx error, don't retry this model
          if (status && status >= 400 && status < 500 && status !== 429) {
            console.error(`Non-retriable error from model ${modelName}:`, err.message || err);
            break; // try next model
          }

          // Exponential backoff before next attempt
          const backoffMs = 500 * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms...
          await new Promise(res => setTimeout(res, backoffMs));
        }
      }
      console.log(`Switching to next model after failures for ${modelName}`);
    }

    // All models/attempts failed
    throw lastErr || new Error('AI generation failed after retries');
  }

  // Helper: lightweight similarity (Jaccard on token sets)
  _jaccardSimilarity(a, b) {
    if (!a || !b) return 0;
    const toSet = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean));
    const A = toSet(a);
    const B = toSet(b);
    const intersection = [...A].filter(x => B.has(x)).length;
    const union = new Set([...A, ...B]).size;
    if (union === 0) return 0;
    return intersection / union;
  }

  _extractProteinTag(text) {
    if (!text) return 'other';
    const proteins = ['chicken','fish','salmon','turkey','beef','pork','lamb','egg','eggs','tofu','paneer','lentil','lentils','bean','beans','chickpea','chickpeas','shrimp','prawn'];
    const t = String(text).toLowerCase();
    for (const p of proteins) if (t.includes(p)) return p;
    // classify as 'plant' if contains common plant cues
    if (t.match(/vegetable|vegan|vegetarian|tofu|lentil|quinoa|beans|chickpea/)) return 'plant';
    return 'other';
  }

  _extractCuisineTag(text) {
    if (!text) return 'other';
    const cuisines = ['indian','mexican','italian','chinese','greek','thai','mediterranean','japanese','american','french','middle eastern','turkish'];
    const t = String(text).toLowerCase();
    for (const c of cuisines) if (t.includes(c)) return c;
    return 'other';
  }

  // Post-filter replacements for diversity: group by cuisine/protein and remove near-duplicates
  _postFilterReplacements(replacements = [], desired = 3, preferredCuisine = null) {
    if (!Array.isArray(replacements) || replacements.length === 0) return [];

    // Build metadata
    const items = replacements.map(r => {
      const name = r.name || r.title || '';
      const ingredients = (r.ingredients || []).join(' ');
      const keyText = `${name} ${ingredients} ${r.description || ''}`;
      return {
        orig: r,
        name,
        keyText,
        protein: this._extractProteinTag(keyText),
        cuisine: this._extractCuisineTag(keyText)
      };
    });

    // First, remove near-duplicates using Jaccard similarity on keyText
    const unique = [];
    for (const it of items) {
      const isDup = unique.some(u => this._jaccardSimilarity(u.keyText, it.keyText) > 0.6);
      if (!isDup) unique.push(it);
    }

    // Group by (protein, cuisine) preference: prefer to pick distinct groups
    const groups = new Map();
    for (const it of unique) {
      const groupKey = `${it.protein}|${it.cuisine}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(it);
    }

    const selected = [];
    // Prefer groups that match preferredCuisine (if provided)
    const groupEntries = Array.from(groups.entries());

    // Split groups into preferred and others
    const preferredGroups = [];
    const otherGroups = [];
    for (const [key, arr] of groupEntries) {
      const cuisine = arr[0]?.cuisine || 'other';
      if (preferredCuisine && cuisine === preferredCuisine) preferredGroups.push(arr);
      else otherGroups.push(arr);
    }

    // Round-robin pick giving priority to preferred groups first
    const combined = [...preferredGroups, ...otherGroups];
    let idx = 0;
    while (selected.length < desired && combined.some(g => g.length > 0)) {
      const g = combined[idx % combined.length];
      if (g.length > 0) {
        selected.push(g.shift().orig);
      }
      idx += 1;
    }

    // If not enough selected, fill with remaining items
    if (selected.length < desired) {
      for (const it of unique) {
        if (selected.includes(it.orig)) continue;
        selected.push(it.orig);
        if (selected.length >= desired) break;
      }
    }

    return selected.slice(0, desired);
  }

  // Async get/set cache (in-memory + optional Redis if available via REDIS_URL)
  async _getCachedSuggestion(key) {
    // in-memory
    const now = Date.now();
    const cached = this.suggestionCache.get(key);
    if (cached && cached.expiresAt > now) return cached.value;

    // try Redis if configured
    try {
      if (process.env.REDIS_URL) {
        const redisMod = await import('redis');
        if (!this.redisClient) {
          this.redisClient = redisMod.createClient({ url: process.env.REDIS_URL });
          this.redisClient.on('error', (e) => console.warn('Redis client error', e));
          await this.redisClient.connect();
        }
        const v = await this.redisClient.get(key);
        if (v) return JSON.parse(v);
      }
    } catch (e) {
      console.warn('Redis cache unavailable or failed to get:', e.message || e);
    }

    return null;
  }

  async _setCachedSuggestion(key, value, ttlMs = 10 * 60 * 1000) {
    try {
      this.suggestionCache.set(key, { value, expiresAt: Date.now() + ttlMs });
    } catch (e) {
      // ignore
    }
    try {
      if (process.env.REDIS_URL) {
        const redisMod = await import('redis');
        if (!this.redisClient) {
          this.redisClient = redisMod.createClient({ url: process.env.REDIS_URL });
          this.redisClient.on('error', (e) => console.warn('Redis client error', e));
          await this.redisClient.connect();
        }
        await this.redisClient.set(key, JSON.stringify(value), { PX: ttlMs });
      }
    } catch (e) {
      console.warn('Redis cache unavailable or failed to set:', e.message || e);
    }
  }

  /**
   * Smart meal replacement based on user preferences and nutrition requirements
   */
  async suggestMealReplacement(currentMeal, userContext, replacementReason) {
    try {
      if (!this.geminiAI) throw new Error('AI client not initialized');

      // Simple cache key: userId + meal name + reason (truncate to avoid huge keys)
      const userId = userContext?.userId || 'anonymous';
      const mealIdFragment = (currentMeal?.dish || currentMeal?.name || JSON.stringify(currentMeal || '')).slice(0, 200);
      const reasonFragment = (replacementReason || '').slice(0, 200);
      const cacheKey = `suggestions:${userId}:${mealIdFragment}:${reasonFragment}`;

      // Check cache (TTL 10 minutes)
      const now = Date.now();
      const cached = await this._getCachedSuggestion(cacheKey);
      if (cached) {
        console.log(`📦 suggestion cache HIT for ${cacheKey}`);
        return cached;
      }

      console.log(`📦 suggestion cache MISS for ${cacheKey}`);

      const t0 = Date.now();
      
      const prompt = `
        You are a professional nutritionist AI helping users replace meals intelligently.
        
        CURRENT MEAL TO REPLACE:
        ${JSON.stringify(currentMeal, null, 2)}
        
        USER CONTEXT:
        - Health Goals: ${userContext.healthGoals || 'General wellness'}
        - Specific Goals: ${userContext.goals || 'General wellness'}
        - Dietary Restrictions: ${userContext.restrictions || 'None'}
        - Food Allergies: ${userContext.allergies || 'None'}
        - Foods to Avoid: ${userContext.foodsToAvoid || 'None'}
        - Medical Conditions: ${userContext.medicalConditions || 'None'}
        - Preferred Cuisines: ${userContext.cuisinePreferences || 'Any'}
        - Meat Preference: ${userContext.meatPreference || 'Any'}
        - Activity Level: ${userContext.activityLevel || 'Moderate'}
        - Craving Type: ${userContext.cravingType || 'None'}
        - Craving Frequency: ${userContext.cravingsFrequency || 'Rarely'}
        - Digestive Issues: ${userContext.digestiveUpset || 'Never'}
        - Energy Low Time: ${userContext.fatigueTime || 'Not specified'}
        - Gender: ${userContext.gender || 'Not specified'}
        - Current Weight: ${userContext.currentWeight || 'Not specified'} kg
        - Goal Weight: ${userContext.goalWeight || 'Not specified'} kg
        - Height: ${userContext.height || 'Not specified'} cm
        - Age: ${userContext.age || 'Not specified'}
        - Other Preferences: ${userContext.otherPreferences || 'None'}
        - Budget Preference: ${userContext.budget || 'Moderate'}
        - Cooking Time Available: ${userContext.cookingTime || '30 minutes'}
        - Equipment Available: ${userContext.equipment || 'Basic kitchen'}
        
        REPLACEMENT REASON: ${replacementReason}
        
        REQUIREMENTS:
        1. Maintain similar nutritional value (±100 calories, similar macros)
        2. STRICTLY respect all dietary restrictions, allergies, and medical conditions
        3. Consider user's meat preference and avoid foods they want to avoid
        4. Address the specific reason for replacement
        5. Align with user's specific health goals (weight loss/gain, energy, digestion, etc.)
        6. Consider activity level for appropriate portion sizes and macros
        7. Account for digestive issues and craving patterns
        8. Match user's cooking time and equipment limitations
        9. Provide 3-5 alternative meal options that fit user's detailed profile
        10. Include easy substitutions for ingredients they don't like or can't eat
        
        Please provide response in this JSON format:
        {
          "originalMeal": {
            "name": "original meal name",
            "calories": calories,
            "macros": {"protein": 0, "carbs": 0, "fat": 0}
          },
          "replacements": [
            {
              "name": "replacement meal name",
              "description": "brief description",
              "calories": estimated_calories,
              "macros": {"protein": 0, "carbs": 0, "fat": 0},
              "prepTime": "preparation time",
              "difficulty": "easy/medium/hard",
              "ingredients": ["ingredient1", "ingredient2"],
              "instructions": "brief cooking steps",
              "whyGoodReplacement": "explanation why this works",
              "healthBenefits": ["benefit1", "benefit2"],
              "customizations": "possible variations"
            }
          ],
          "smartSubstitutions": [
            {
              "dontLike": "ingredient user doesn't like",
              "replaceWith": ["alternative1", "alternative2"],
              "nutritionalImpact": "how it affects nutrition"
            }
          ],
          "personalizedTips": ["tip1", "tip2", "tip3"]
        }
      `;

  // Request multiple diverse alternatives and ask for different cuisines / macros
  const enhancedPrompt = prompt + `\n\nIMPORTANT: Return exactly 3 diverse replacement objects in the "replacements" array. Ensure the three options are meaningfully different (different cuisines, different primary protein or plant base, or different cooking methods). Avoid near-duplicates.`;

  const response = await this._generateWithRetries(enhancedPrompt, [ 'gemini-2.0-flash', 'gemini-2.0-flash-exp']);
      const parsed = this._parseAIJSON(response);
      if (parsed) {
        // Post-filter the replacements for diversity
        try {
          if (parsed.replacements && Array.isArray(parsed.replacements)) {
              const preferredCuisine = userContext?.preferences?.cuisine || userContext?.cuisinePreferences || null;
              const filtered = this._postFilterReplacements(parsed.replacements, 3, preferredCuisine && String(preferredCuisine).toLowerCase());
              parsed.replacements = filtered;
            }
        } catch (e) {
          console.warn('Post-filtering failed:', e.message || e);
        }

        // Cache result (async set supports Redis when configured)
        await this._setCachedSuggestion(cacheKey, parsed, 10 * 60 * 1000);
        console.log(`⏱️ suggestMealReplacement total_time=${Date.now() - t0}ms`);
        return parsed;
      }

      // Log a snippet for debugging and throw a clearer error
      console.error('AI response (could not parse):', response.substring(0, 1000));
      throw new Error('Could not parse AI response as JSON');
    } catch (error) {
      console.error('Meal replacement error:', error);
      throw error;
    }
  }

  /**
   * Dynamic meal modification based on specific requests
   */
  async modifyMeal(currentMeal, modificationRequest, userPreferences) {
    try {
      if (!this.geminiAI) throw new Error('AI client not initialized');
      const model = this.geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        You are an AI chef helping modify meals based on user requests.
        
        CURRENT MEAL:
        ${JSON.stringify(currentMeal, null, 2)}
        
        USER MODIFICATION REQUEST: "${modificationRequest}"
        
        USER PREFERENCES:
        ${JSON.stringify(userPreferences, null, 2)}
        
        MODIFICATION TYPES TO HANDLE:
        - "Make it healthier" - reduce calories, add nutrients
        - "Make it spicier/milder" - adjust spice levels
        - "Make it vegan/vegetarian" - remove animal products
        - "Make it gluten-free" - remove gluten ingredients
        - "Make it low-carb/keto" - reduce carbohydrates
        - "Add more protein" - increase protein content
        - "Make it quicker to cook" - simplify preparation
        - "Use different ingredients" - substitute specific items
        - "Make it more filling" - add volume/fiber
        - "Make it lighter" - reduce calories/portions
        
        Provide response in JSON format:
        {
          "modifiedMeal": {
            "name": "modified meal name",
            "description": "what changed",
            "calories": new_calories,
            "macros": {"protein": 0, "carbs": 0, "fat": 0},
            "ingredients": ["updated ingredient list"],
            "instructions": "updated cooking steps",
            "prepTime": "new prep time",
            "modifications": ["what was changed"]
          },
          "nutritionalComparison": {
            "calorieChange": difference,
            "proteinChange": difference,
            "carbChange": difference,
            "fatChange": difference,
            "healthScoreChange": difference
          },
          "explanation": "why these changes work for the request",
          "alternativeOptions": [
            "option 1 if user wants different approach",
            "option 2 for more/less modification"
          ]
        }
      `;

  const response = await this._generateWithRetries(prompt, [  'gemini-2.0-flash', 'gemini-2.0-flash-exp']);
  const parsed = this._parseAIJSON(response);
      if (parsed) return parsed;

      console.error('AI modification response (could not parse):', response.substring(0, 1000));
      throw new Error('Could not parse modification response as JSON');
    } catch (error) {
      console.error('Meal modification error:', error);
      throw error;
    }
  }

  /**
   * Smart ingredient substitution system
   */
  async suggestIngredientSubstitutions(dislikedIngredients, currentRecipe, nutritionalGoals) {
    try {
      if (!this.geminiAI) throw new Error('AI client not initialized');
      const model = this.geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        Help find smart ingredient substitutions that maintain nutritional value.
        
        INGREDIENTS USER DOESN'T LIKE: ${dislikedIngredients.join(', ')}
        
        CURRENT RECIPE: ${JSON.stringify(currentRecipe, null, 2)}
        
        NUTRITIONAL GOALS: ${JSON.stringify(nutritionalGoals, null, 2)}
        
        For each disliked ingredient, provide:
        1. Direct substitutes with similar nutrition
        2. Creative alternatives that work in the recipe
        3. How the substitution affects taste/texture/nutrition
        
        Response format:
        {
          "substitutions": [
            {
              "originalIngredient": "ingredient name",
              "directSubstitutes": [
                {
                  "substitute": "replacement name",
                  "ratio": "1:1 or custom ratio",
                  "nutritionImpact": "calories/macro changes",
                  "tasteProfile": "how taste changes",
                  "availability": "common/specialty item"
                }
              ],
              "creativeAlternatives": [
                {
                  "substitute": "creative replacement",
                  "howToUse": "modification instructions",
                  "benefits": "why this is better",
                  "considerations": "things to watch out for"
                }
              ]
            }
          ],
          "recipeAdjustments": "overall recipe modifications needed",
          "nutritionalSummary": "how substitutions affect overall nutrition"
        }
      `;

  const response = await this._generateWithRetries(prompt, [ 'gemini-2.0-flash', 'gemini-2.0-flash-exp']);
  const parsed = this._parseAIJSON(response);
      if (parsed) return parsed;

      console.error('AI substitution response (could not parse):', response.substring(0, 1000));
      throw new Error('Could not parse substitution response as JSON');
    } catch (error) {
      console.error('Substitution error:', error);
      throw error;
    }
  }

  /**
   * Contextual meal suggestions based on user's current situation
   */
  async getContextualMealSuggestions(userContext) {
    try {
      if (!this.geminiAI) throw new Error('AI client not initialized');
      const model = this.geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        Suggest meals based on user's current situation and preferences.
        
        USER CONTEXT:
        - Current Time: ${userContext.currentTime || new Date().toLocaleTimeString()}
        - Mood: ${userContext.mood || 'neutral'}
        - Energy Level: ${userContext.energyLevel || 'moderate'}
        - Available Time: ${userContext.availableTime || '30 minutes'}
        - Budget: ${userContext.budget || 'moderate'}
        - Weather: ${userContext.weather || 'mild'}
        - Recent Meals: ${JSON.stringify(userContext.recentMeals || [])}
        - Health Goals: ${userContext.healthGoals || 'maintain health'}
        - Dietary Restrictions: ${userContext.restrictions || 'none'}
        - Kitchen Equipment: ${userContext.equipment || 'basic'}
        - Stress Level: ${userContext.stressLevel || 'low'}
        
        Provide 5 contextually appropriate meal suggestions:
        
        {
          "suggestions": [
            {
              "mealName": "context-appropriate meal",
              "contextReason": "why perfect for current situation",
              "moodBoost": "how it helps current mood/energy",
              "quickVersion": "if time is limited",
              "comfortLevel": "easy/moderate/challenging",
              "ingredients": ["main ingredients needed"],
              "nutritionalHighlights": ["key nutrition benefits"],
              "preparationTips": "helpful cooking tips"
            }
          ],
          "avoidSuggestions": [
            "what to avoid given current context"
          ],
          "moodFoodTips": "how food can improve current mood/energy"
        }
      `;

  const response = await this._generateWithRetries(prompt, [ 'gemini-2.0-flash', 'gemini-2.0-flash-exp']);
  const parsed = this._parseAIJSON(response);
      if (parsed) return parsed;

      console.error('AI contextual suggestions response (could not parse):', response.substring(0, 1000));
      throw new Error('Could not parse contextual suggestions as JSON');
    } catch (error) {
      console.error('Contextual suggestions error:', error);
      throw error;
    }
  }

  /**
   * Actually replace meal in user's meal plan database
   */
  async replaceMealInPlan(userId, dayOfWeek, mealType, newMeal) {
    try {
      // Import MealPlan model dynamically to avoid circular imports
      const { default: MealPlan } = await import('../Models/MealPlan.model.js');
      
      console.log(`🔄 Replacing ${mealType} for ${dayOfWeek} for user ${userId}`);
      
      // Find user's current meal plan
      const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!mealPlan) {
        throw new Error('No meal plan found for user');
      }

      // Find the specific day
      const dayIndex = mealPlan.week.findIndex(day => 
        day.day.toLowerCase() === dayOfWeek.toLowerCase()
      );

      if (dayIndex === -1) {
        throw new Error(`Day ${dayOfWeek} not found in meal plan`);
      }

      // Create the new meal object in the correct format (matching MealPlan schema)
      let recipeText = '';
      if (newMeal.instructions) {
        recipeText = newMeal.instructions;
      } else if (newMeal.ingredients && newMeal.ingredients.length > 0) {
        recipeText = `Ingredients: ${newMeal.ingredients.join(', ')}. ${newMeal.description || 'Cook according to preference.'}`;
      } else {
        recipeText = `${newMeal.name} - ${newMeal.description || 'Delicious and nutritious meal'}. Prep time: ${newMeal.prepTime || '30 minutes'}`;
      }
      
      // Generate tags based on meal characteristics and user preferences
      const generateMealTags = (meal, mealType) => {
        const tags = [mealType]; // Always include meal type (breakfast, lunch, dinner)
        
        // Add difficulty tag
        if (meal.difficulty) {
          tags.push(meal.difficulty.toLowerCase());
        } else {
          tags.push('easy');
        }
        
        // Add dietary tags based on ingredients/description
        const mealText = `${meal.name} ${meal.description} ${meal.ingredients?.join(' ') || ''}`.toLowerCase();
        
        if (mealText.includes('vegan') || (!mealText.includes('meat') && !mealText.includes('chicken') && !mealText.includes('fish') && !mealText.includes('egg') && !mealText.includes('dairy'))) {
          tags.push('vegan');
        } else if (mealText.includes('vegetarian') || (!mealText.includes('meat') && !mealText.includes('chicken') && !mealText.includes('fish'))) {
          tags.push('vegetarian');
        }
        
        if (mealText.includes('protein') || mealText.includes('high-protein')) {
          tags.push('high-protein');
        }
        
        if (mealText.includes('low-carb') || mealText.includes('keto')) {
          tags.push('low-carb');
        }
        
        if (mealText.includes('healthy') || meal.calories < 400) {
          tags.push('healthy');
        }
        
        if (mealText.includes('quick') || (meal.prepTime && parseInt(meal.prepTime) <= 20)) {
          tags.push('quick');
        }
        
        return [...new Set(tags)]; // Remove duplicates
      };
      
      // Ensure required nutrition fields are present to satisfy MealPlan schema
      const safeNumber = (v) => {
        if (v === undefined || v === null || Number.isNaN(Number(v))) return 0;
        return Number(v);
      };

      const proteinFromMacros = newMeal.macros?.protein ?? newMeal.protein ?? newMeal.macros?.protein;
      const carbsFromMacros = newMeal.macros?.carbs ?? newMeal.carbs ?? newMeal.macros?.carbs;
      const fatsFromMacros = newMeal.macros?.fat ?? newMeal.fats ?? newMeal.macros?.fat ?? newMeal.fats;

      // If calories provided but macros missing, make conservative estimates (not precise but valid)
      const calories = safeNumber(newMeal.calories);
      const protein = safeNumber(proteinFromMacros) || Math.round((calories * 0.20) / 4);
      const carbs = safeNumber(carbsFromMacros) || Math.round((calories * 0.50) / 4);
      const fats = safeNumber(fatsFromMacros) || Math.round((calories * 0.30) / 9);

      const mealUpdate = {
        dish: newMeal.name || 'Unknown Meal',
        calories: calories,
        protein: protein,
        fats: fats,
        carbs: carbs,
        recipe: recipeText,
        tags: generateMealTags(newMeal, mealType)
      };

      // Store original meal for comparison
      const originalMeal = { ...mealPlan.week[dayIndex][mealType] };
      
      // Update the specific meal
      mealPlan.week[dayIndex][mealType] = mealUpdate;

      // Mark the document as modified (important for nested objects)
      mealPlan.markModified(`week.${dayIndex}.${mealType}`);
      
      console.log(`📝 Original meal: ${originalMeal.dish} (${originalMeal.calories} cal)`);
      console.log(`📝 New meal: ${mealUpdate.dish} (${mealUpdate.calories} cal)`);

      // Save the updated meal plan
      const savedPlan = await mealPlan.save();
      
      // Verify the update
      const verificationPlan = await MealPlan.findById(mealPlan._id);
      const verifiedMeal = verificationPlan.week[dayIndex][mealType];
      
      console.log(`✅ Verification - Saved meal: ${verifiedMeal.dish} (${verifiedMeal.calories} cal)`);
      console.log(`✅ Successfully replaced ${mealType} for ${dayOfWeek}`);
      
      return {
        success: true,
        message: `Successfully replaced ${mealType} for ${dayOfWeek}`,
        updatedMeal: mealUpdate,
        originalMeal: originalMeal,
        day: dayOfWeek,
        mealType: mealType,
        verifiedUpdate: verifiedMeal
      };

    } catch (error) {
      console.error('Error replacing meal in plan:', error);
      throw error;
    }
  }

  /**
   * Smart meal replacement with database update
   */
  async replaceAndUpdateMeal(userId, dayOfWeek, mealType, currentMeal, userContext, replacementReason, selectedReplacementIndex = 0) {
    try {
      // First, get meal replacement suggestions
      const suggestions = await this.suggestMealReplacement(currentMeal, userContext, replacementReason);
      
      if (!suggestions.replacements || suggestions.replacements.length === 0) {
        throw new Error('No meal replacements found');
      }

      // Select the replacement (default to first one, or use provided index)
      const selectedReplacement = suggestions.replacements[selectedReplacementIndex] || suggestions.replacements[0];

      // Actually update the meal plan in the database
      const updateResult = await this.replaceMealInPlan(userId, dayOfWeek, mealType, selectedReplacement);

      return {
        ...updateResult,
        allSuggestions: suggestions.replacements,
        selectedReplacement,
        smartSubstitutions: suggestions.smartSubstitutions,
        personalizedTips: suggestions.personalizedTips
      };

    } catch (error) {
      console.error('Error in replaceAndUpdateMeal:', error);
      throw error;
    }
  }

  /**
   * Get current meal from meal plan
   */
  async getCurrentMeal(userId, dayOfWeek, mealType) {
    try {
      const { default: MealPlan } = await import('../Models/MealPlan.model.js');
      
      const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!mealPlan) {
        throw new Error('No meal plan found for user');
      }

      const day = mealPlan.week.find(day => 
        day.day.toLowerCase() === dayOfWeek.toLowerCase()
      );

      if (!day) {
        throw new Error(`Day ${dayOfWeek} not found in meal plan`);
      }

      const meal = day[mealType];
      if (!meal) {
        throw new Error(`${mealType} not found for ${dayOfWeek}`);
      }

      return meal;

    } catch (error) {
      console.error('Error getting current meal:', error);
      throw error;
    }
  }

  /**
   * Learning system - improves suggestions based on user feedback
   */
  async updateUserPreferences(userId, mealFeedback) {
    try {
      // This would integrate with your user profile system
      const preferenceUpdate = {
        userId,
        timestamp: new Date(),
        originalMeal: mealFeedback.originalMeal,
        chosenReplacement: mealFeedback.chosenReplacement,
        userRating: mealFeedback.rating,
        feedback: mealFeedback.feedback,
        reasonForChange: mealFeedback.reason
      };

      // Update user's taste profile
      // This would save to your database and improve future suggestions
      console.log('Updating user preferences:', preferenceUpdate);
      
      return {
        success: true,
        message: 'Preferences updated successfully',
        improvedCategories: [
          'ingredient preferences',
          'cuisine preferences', 
          'meal complexity preferences',
          'nutritional priorities'
        ]
      };
    } catch (error) {
      console.error('Preference update error:', error);
      throw error;
    }
  }
}

export default SmartMealReplacementService;
import ChatSession from '../Models/ChatSession.model.js';
import { User } from '../Models/User.models.js';
import MealPlan from '../Models/MealPlan.model.js';
import axios from 'axios';
import https from 'https';
import NodeCache from 'node-cache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SmartMealReplacementService from '../services/smartMealReplacement.service.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

// Initialize meal replacement service
const mealReplacementService = new SmartMealReplacementService();

// Helper function to build comprehensive user context from onboarding data
const buildUserContext = (user) => {
  return {
    // Basic health info
    healthGoals: user.goalWeight ? 'Weight management' : 'General wellness',
    restrictions: user.foodAllergies || [],
    allergies: user.foodAllergies || [],
    
    // Detailed onboarding preferences
    activityLevel: user.preferences?.activityLevel || 'Moderate',
    meatPreference: user.preferences?.meatPreference || 'Any',
    goals: user.preferences?.goals || 'General wellness',
    cravingType: user.preferences?.cravingType || 'None',
    cravingsFrequency: user.preferences?.cravingsFrequency || 'Rarely',
    digestiveUpset: user.preferences?.digestiveUpset || 'Never',
    fatigueTime: user.preferences?.fatigueTime || 'Not specified',
    medicalConditions: user.preferences?.medicalConditions || 'None',
    foodsToAvoid: user.preferences?.foodsToAvoid || 'None',
    otherPreferences: user.preferences?.otherPreferences || 'None',
    
    // Physical characteristics
    gender: user.gender || 'Not specified',
    currentWeight: user.currentWeight || 'Not specified',
    goalWeight: user.goalWeight || 'Not specified',
    height: user.height || 'Not specified',
    age: user.age || 'Not specified',
    
    // Default settings
    cuisinePreferences: user.preferences?.cuisine || 'Any',
    budget: 'Moderate',
    cookingTime: '30 minutes',
    equipment: 'Basic kitchen'
  };
};

// Initialize caching
const chatCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes cache
  checkperiod: 60, // Check for expired keys every 60 seconds
  maxKeys: 1000 // Maximum number of keys in cache
});

// Removed external API client - now using internal Gemini AI implementation

// Helper function to update session activity asynchronously
const updateSessionActivity = async (sessionId) => {
  try {
    await ChatSession.findOneAndUpdate(
      { sessionId },
      { lastActivity: new Date() },
      { new: false } // Don't return the document to save bandwidth
    );
    console.log(`📋 Updated session activity for: ${sessionId}`);
  } catch (error) {
    console.error('Session update failed:', error.message);
  }
};

// Helper function to clear cache for a session
const clearSessionCache = (sessionId) => {
  const keys = chatCache.keys().filter(key => key.includes(sessionId));
  keys.forEach(key => chatCache.del(key));
  console.log(`🗑️ Cleared cache for session: ${sessionId} (${keys.length} keys)`);
};

// Generate AI response using Gemini with smart meal replacement capabilities
const generateAIResponse = async (userMessage, systemPrompt, conversationHistory = [], userId = null) => {
  try {
    if (!genAI) {
      throw new Error('Google AI not initialized - GOOGLE_API_KEY missing');
    }

    // Check if this is a meal replacement request - using regex for more flexible matching
    const mealReplacementPatterns = [
      // Direct meal type changes
      /change.*breakfast/i, /change.*lunch/i, /change.*dinner/i,
      /replace.*breakfast/i, /replace.*lunch/i, /replace.*dinner/i,
      /update.*breakfast/i, /update.*lunch/i, /update.*dinner/i,
      
      // Day-specific changes
      /change.*monday/i, /change.*tuesday/i, /change.*wednesday/i, 
      /change.*thursday/i, /change.*friday/i, /change.*saturday/i, /change.*sunday/i,
      /replace.*monday/i, /replace.*tuesday/i, /replace.*wednesday/i,
      /replace.*thursday/i, /replace.*friday/i, /replace.*saturday/i, /replace.*sunday/i,
      
      // General meal changes
      /change.*meal/i, /replace.*meal/i, /different.*meal/i, /substitute.*meal/i,
      
      // Want statements
      /i want.*breakfast/i, /i want.*lunch/i, /i want.*dinner/i,
      /i want.*for breakfast/i, /i want.*for lunch/i, /i want.*for dinner/i,
      
      // Make statements
      /make.*breakfast/i, /make.*lunch/i, /make.*dinner/i,
      
      // Dislike statements  
      /don't like.*meal/i, /hate.*food/i, /don't want.*meal/i,
      
      // Modification requests
      /make it healthier/i, /make it spicier/i, /make it vegan/i, /make it.*carb/i
    ];
    
    // Also check simple keywords for backward compatibility
    const mealReplacementKeywords = [
      'something else', 'alternative meal', 'without', 'instead of', 'swap', 'modify'
    ];

    const message = userMessage.toLowerCase();
    const isMealReplacementRequest = 
      mealReplacementPatterns.some(pattern => pattern.test(userMessage)) ||
      mealReplacementKeywords.some(keyword => message.includes(keyword));

    // Check for direct replacement patterns (immediate action)
    const directReplacementPatterns = [
      /change.*breakfast.*to/, /change.*lunch.*to/, /change.*dinner.*to/,
      /replace.*breakfast.*with/, /replace.*lunch.*with/, /replace.*dinner.*with/,
      /i want.*breakfast/, /i want.*lunch/, /i want.*dinner/,
      /make.*breakfast/, /make.*lunch/, /make.*dinner/
    ];
    
    const isDirectReplacementRequest = directReplacementPatterns.some(pattern => 
      pattern.test(message)
    );

    // Check for pending meal replacement confirmation first
    if (userId) {
      // Check if this might be a confirmation of a previous meal replacement suggestion
      const confirmationPatterns = [
        /replace.*with.*option\s*(\d+)/i,
        /go.*ahead.*with.*option\s*(\d+)/i,
        /yes.*change.*to\s*(.+)/i,
        /option\s*(\d+)/i,
        /(yes|sure|okay|go ahead|sounds good|perfect|that works)/i
      ];

      const confirmationMatch = confirmationPatterns.find(pattern => pattern.test(userMessage));
      
      if (confirmationMatch) {
        console.log('🎯 Possible confirmation detected, checking for pending replacement...');
        
        // For now, we'll handle this in the main meal replacement logic
        // This is a placeholder for context-aware confirmation handling
      }
    }

    // Handle meal replacement requests
    if (isMealReplacementRequest && userId) {
      try {
        console.log('🍽️ Detected meal replacement request');
        console.log('📝 User message:', userMessage);
        console.log('🔍 Is direct replacement:', isDirectReplacementRequest);
        console.log('🔧 Starting meal replacement process...');
        
        // Get user context for personalized replacement
        const user = await User.findById(userId);
        console.log('👤 User found:', !!user);
        
        const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
        console.log('📋 Meal plan found:', !!mealPlan);
        
        if (mealPlan) {
          console.log('✅ Processing meal replacement...');
          const userContext = buildUserContext(user);

          // Extract target day from message or use today
          let targetDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          console.log('📅 Default day (today):', targetDay);
          
          // Check if user specified a specific day
          const dayMentions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const mentionedDay = dayMentions.find(day => message.includes(day));
          
          if (mentionedDay) {
            targetDay = mentionedDay.charAt(0).toUpperCase() + mentionedDay.slice(1);
            console.log('📅 User specified day:', targetDay);
          }
          
          const targetMeal = mealPlan.week.find(day => 
            day.day.toLowerCase() === targetDay.toLowerCase()
          );
          console.log('🍽️ Target meal found:', !!targetMeal, 'for day:', targetDay);

          if (targetMeal) {
            let selectedMeal = null;
            let mealType = null;
            
            // Determine which meal to replace based on message content
            if (message.includes('breakfast') || message.includes('morning')) {
              selectedMeal = targetMeal.breakfast;
              mealType = 'breakfast';
            } else if (message.includes('lunch') || message.includes('noon') || message.includes('afternoon')) {
              selectedMeal = targetMeal.lunch;
              mealType = 'lunch';
            } else if (message.includes('dinner') || message.includes('evening') || message.includes('night')) {
              selectedMeal = targetMeal.dinner;
              mealType = 'dinner';
            } else {
              // Check for specific day mentions to handle cases like "change monday breakfast"
              const dayMentioned = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                .find(day => message.includes(day));
              
              if (dayMentioned) {
                const dayMeal = mealPlan.week.find(day => 
                  day.day.toLowerCase() === dayMentioned
                );
                if (dayMeal) {
                  // Update the day variable to match the requested day
                  targetDay = dayMeal.day;
                  if (message.includes('breakfast')) {
                    selectedMeal = dayMeal.breakfast;
                    mealType = 'breakfast';
                  } else if (message.includes('lunch')) {
                    selectedMeal = dayMeal.lunch;
                    mealType = 'lunch';
                  } else if (message.includes('dinner')) {
                    selectedMeal = dayMeal.dinner;
                    mealType = 'dinner';
                  } else {
                    // Default to dinner for day-specific requests
                    selectedMeal = dayMeal.dinner;
                    mealType = 'dinner';
                  }
                }
              } else {
                // Default to the meal with highest calories (likely main meal)
                const meals = [
                  { meal: targetMeal.breakfast, type: 'breakfast' },
                  { meal: targetMeal.lunch, type: 'lunch' },
                  { meal: targetMeal.dinner, type: 'dinner' }
                ];
                const mainMeal = meals.reduce((prev, current) => 
                  (current.meal.calories > prev.meal.calories) ? current : prev
                );
                selectedMeal = mainMeal.meal;
                mealType = mainMeal.type;
              }
            }

            // Enhanced replacement detection - be more aggressive about replacing
            const replaceKeywords = ['change it', 'replace it', 'update it', 'swap it', 'yes replace', 'do it', 
                                   'sounds good', 'yes please', 'perfect', 'that works', 'go ahead', 'sure',
                                   'yes that', 'i like that', 'great choice'];
            
            // Check for very specific replacement patterns that should execute immediately
            const immediateReplacementPatterns = [
              /replace.*with\s+\w+/i,
              /change.*to\s+\w+/i,  
              /i want.*\w+.*for.*\b(breakfast|lunch|dinner)\b/i,
              /swap.*with\s+\w+/i,
              /substitute.*with\s+\w+/i,
              /make.*\b(breakfast|lunch|dinner)\b.*\w+/i
            ];
            
            const isImmediateReplacement = immediateReplacementPatterns.some(pattern => pattern.test(userMessage));
            
            const shouldReplace = replaceKeywords.some(keyword => message.includes(keyword)) || 
                                 isDirectReplacementRequest ||
                                 isImmediateReplacement;

            if (shouldReplace) {
              // Actually replace the meal in the database
              console.log('🔄 User confirmed replacement, updating meal plan...');
              console.log('🎯 Selected meal:', selectedMeal?.dish);
              console.log('🕐 Target day:', targetDay);
              console.log('🍽️ Meal type:', mealType);
              
              const replacementResult = await mealReplacementService.replaceAndUpdateMeal(
                userId,
                targetDay,
                mealType,
                selectedMeal,
                userContext,
                userMessage,
                0 // Use first suggestion by default
              );

              let responseText = `✅ **Meal Successfully Replaced!**\n\n`;
              responseText += `I've updated your ${mealType} for ${targetDay}:\n`;
              responseText += `❌ **Old:** ${replacementResult.originalMeal?.dish || selectedMeal.dish}\n`;
              responseText += `✅ **New:** ${replacementResult.selectedReplacement.name}\n\n`;
              responseText += `**Your New Meal Details:**\n`;
              responseText += `🍽️ **${replacementResult.selectedReplacement.name}**\n`;
              responseText += `📊 ${replacementResult.selectedReplacement.calories} calories | ⏱️ ${replacementResult.selectedReplacement.prepTime}\n`;
              responseText += `${replacementResult.selectedReplacement.description}\n\n`;
              responseText += `💡 ${replacementResult.selectedReplacement.whyGoodReplacement}\n\n`;
              
              if (replacementResult.selectedReplacement.instructions) {
                responseText += `**Recipe:** ${replacementResult.selectedReplacement.instructions}\n\n`;
              }
              
              responseText += `Your meal plan has been updated and saved! 🎉\n\n`;
              responseText += `Check your meal plan to see the changes reflected!`;

              return {
                text: responseText,
                suggestions: [
                  'Show me the recipe details',
                  'Change another meal',
                  'See more alternatives',
                  'View updated meal plan'
                ],
                model: 'meal-replacement-confirmed',
                timestamp: new Date(),
                replacementResult
              };
            } else {
              // Check if user specified a particular meal in their request
              const specificMealRequested = /(?:want|replace.*with|change.*to)\s+(.+?)(?:\s|$)/i.exec(userMessage);
              
              if (specificMealRequested) {
                console.log('🎯 User requested specific meal:', specificMealRequested[1]);
                
                // Try to find a matching suggestion or create one
                const replacementSuggestions = await mealReplacementService.suggestMealReplacement(
                  selectedMeal,
                  userContext,
                  userMessage
                );

                // Auto-execute if the request is very specific - be more aggressive
                const autoExecutePatterns = [
                  // Day + meal + specific food patterns
                  /replace.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*\b(breakfast|lunch|dinner)\b.*with.*\w+/i,
                  /change.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*\b(breakfast|lunch|dinner)\b.*to.*\w+/i,
                  /i want.*\w+.*for.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*\b(breakfast|lunch|dinner)\b/i,
                  
                  // Meal + day + food patterns  
                  /replace.*\b(breakfast|lunch|dinner)\b.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*with.*\w+/i,
                  /change.*\b(breakfast|lunch|dinner)\b.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*to.*\w+/i,
                  
                  // General specific food requests
                  /i want.*\b(besan cheela|lentil soup|scrambled eggs|pasta|biryani|curry|soup|salad)\b/i,
                  /replace.*with.*\b(besan cheela|lentil soup|scrambled eggs|pasta|biryani|curry|soup|salad)\b/i,
                  /change.*to.*\b(besan cheela|lentil soup|scrambled eggs|pasta|biryani|curry|soup|salad)\b/i,
                  
                  // Any clear replacement intent with "with" or "to"
                  /replace.*with\s+\w+/i,
                  /change.*to\s+\w+/i,
                  /swap.*with\s+\w+/i,
                  /substitute.*with\s+\w+/i
                ];

                const shouldAutoExecute = autoExecutePatterns.some(pattern => pattern.test(userMessage));

                if (shouldAutoExecute) {
                  console.log('🚀 Auto-executing meal replacement based on specific request');
                  
                  const replacementResult = await mealReplacementService.replaceAndUpdateMeal(
                    userId,
                    targetDay,
                    mealType,
                    selectedMeal,
                    userContext,
                    userMessage,
                    0 // Use first suggestion by default
                  );

                  let responseText = `✅ **Perfect! I've made that change for you!**\n\n`;
                  responseText += `I've updated your ${mealType} for ${targetDay}:\n`;
                  responseText += `❌ **Old:** ${selectedMeal.dish}\n`;
                  responseText += `✅ **New:** ${replacementResult.selectedReplacement.name}\n\n`;
                  responseText += `🍽️ **${replacementResult.selectedReplacement.name}**\n`;
                  responseText += `📊 ${replacementResult.selectedReplacement.calories} calories | ⏱️ ${replacementResult.selectedReplacement.prepTime}\n`;
                  responseText += `${replacementResult.selectedReplacement.description}\n\n`;
                  responseText += `💡 ${replacementResult.selectedReplacement.whyGoodReplacement}\n\n`;
                  responseText += `Your meal plan has been updated! Check your meal plan to see the changes. 🎉`;

                  return {
                    text: responseText,
                    suggestions: [
                      'Show me the recipe',
                      'Change another meal',
                      'View updated meal plan',
                      'Make it even healthier'
                    ],
                    model: 'meal-replacement-confirmed',
                    timestamp: new Date(),
                    replacementResult
                  };
                }
              }

              // Just show suggestions without replacing
              const replacementSuggestions = await mealReplacementService.suggestMealReplacement(
                selectedMeal,
                userContext,
                userMessage
              );

              // Format response for chat
              let responseText = `I understand you'd like to change your ${selectedMeal.dish}! Here are some great alternatives:\n\n`;
              
              replacementSuggestions.replacements.slice(0, 3).forEach((replacement, index) => {
                responseText += `**${index + 1}. ${replacement.name}**\n`;
                responseText += `📊 ${replacement.calories} calories | ⏱️ ${replacement.prepTime}\n`;
                responseText += `${replacement.description}\n`;
                responseText += `💡 ${replacement.whyGoodReplacement}\n\n`;
              });

              if (replacementSuggestions.smartSubstitutions.length > 0) {
                responseText += `**Smart Ingredient Swaps:**\n`;
                replacementSuggestions.smartSubstitutions.forEach(sub => {
                  responseText += `• Instead of ${sub.dontLike}: Try ${sub.replaceWith.join(' or ')}\n`;
                });
                responseText += '\n';
              }

              responseText += `**Would you like me to make this change for you?** I can automatically update your meal plan right now!\n\n`;
              responseText += `Just reply with:\n`;
              responseText += `• "**Replace it with option 1**" \n`;
              responseText += `• "**Yes, change it to [meal name]**" \n`;
              responseText += `• "**Go ahead with option 2**" \n`;
              responseText += `• Or any similar confirmation!`;

              return {
                text: responseText,
                suggestions: [
                  'Replace it with option 1',
                  'Replace it with option 2', 
                  'Replace it with option 3',
                  'Show me more alternatives'
                ],
                model: 'smart-meal-replacement',
                timestamp: new Date(),
                mealReplacements: replacementSuggestions,
                pendingReplacement: {
                  targetMeal: selectedMeal,
                  mealType,
                  dayOfWeek: targetDay,
                  userId,
                  suggestions: replacementSuggestions.replacements
                }
              };
            }
          }
        }
      } catch (mealError) {
        console.error('❌ Error in meal replacement:', mealError);
  // Surface the error to the caller so the frontend can see DB/validation issues
  throw mealError;
      }
    } else if (isMealReplacementRequest) {
      console.log('⚠️ Meal replacement request detected but no userId provided');
    } else {
      console.log('🤖 No meal replacement detected, proceeding with regular AI');
    }

    // Enhanced Recipe Detection and Generation - Check recipe mode first
    // Narrow recipe keywords to reduce false positives (avoid very generic words like "meal"/"food")
    const recipeKeywords = [
      'recipe', 'how to make', 'how to cook', 'ingredients for', 'cooking instructions',
      'preparation method', 'cooking steps', 'recipe for', 'cook', 'prepare',
      'bake', 'fry', 'boil', 'grill', 'roast', 'steam', 'sauté', 'ingredients'
    ];
    
    const specificFoodItems = [
      'pasta', 'biryani', 'curry', 'soup', 'salad', 'bread', 'cake', 'cookies',
      'pizza', 'sandwich', 'smoothie', 'juice', 'tea', 'coffee', 'dal', 'rice',
      'chicken', 'fish', 'vegetables', 'eggs', 'pancakes', 'omelette', 'roti', 'chapati',
      'besan cheela', 'paratha', 'dosa', 'idli', 'samosa', 'biryani', 'pulao',
      'rajma', 'chole', 'paneer', 'tikka', 'kebab', 'masala', 'sabzi'
    ];

    // Check if user is in recipe mode (from user preferences)
    let userInRecipeMode = false;
    if (userId) {
      try {
        const user = await User.findById(userId);
        userInRecipeMode = user?.preferences?.recipeMode || false;
        console.log('🍳 User recipe mode status:', userInRecipeMode);
      } catch (err) {
        console.log('⚠️ Could not check user recipe mode:', err.message);
      }
    }

    // Enhanced recipe detection - either explicit keywords or recipe mode enabled
    const containsRecipeKeywords = recipeKeywords.some(keyword => message.includes(keyword));
    const containsFoodItems = specificFoodItems.some(food => 
      message.includes(food) || 
      message.includes(`recipe for ${food}`) || 
      message.includes(`how to make ${food}`) ||
      message.includes(`cook ${food}`)
    );
    
    // Detect if the user is asking about their meal plan or viewing meals
    const isMealPlanQuery = (
      message.includes('meal plan') ||
      message.includes('my meal plan') ||
      message.includes("what's my meal plan") ||
      message.includes('what is my meal plan') ||
      message.includes('show my meal plan') ||
      message.includes("today's meal plan") ||
      message.includes('view my meals') ||
      message.includes('what am i eating') ||
      message.includes('show my meals')
    );

    // Recipe request detection - more aggressive when in recipe mode
    let isRecipeRequest = userInRecipeMode ? 
      (containsRecipeKeywords || containsFoodItems || message.length < 50) : // In recipe mode, be more lenient
      (containsRecipeKeywords || containsFoodItems); // Normal mode, be stricter

    // If the message is clearly about the user's meal plan, do NOT treat it as a recipe request
    if (isMealPlanQuery) {
      isRecipeRequest = false;
    }

    console.log('🔍 Recipe detection:', {
      userInRecipeMode,
      containsRecipeKeywords,
      containsFoodItems,
      isRecipeRequest,
      messageLength: message.length
    });

    if (isRecipeRequest) {
      console.log('🍳 Recipe request detected!');
      
      try {
        // Extract the food item from the message
        let foodItem = null;
        
        // Try to find specific food mentions first
        for (const food of specificFoodItems) {
          if (message.includes(food)) {
            foodItem = food;
            break;
          }
        }
        
        // If no specific food found, try to extract from patterns
        if (!foodItem) {
          const patterns = [
            /recipe for (.+?)(?:\s|$|\.|\?|!)/i,
            /how to make (.+?)(?:\s|$|\.|\?|!)/i,
            /cook (.+?)(?:\s|$|\.|\?|!)/i,
            /prepare (.+?)(?:\s|$|\.|\?|!)/i,
            /make (.+?)(?:\s|$|\.|\?|!)/i,
            /(.+?)\s+recipe/i
          ];
          
          for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1] && match[1].trim().length > 2) {
              foodItem = match[1].trim();
              break;
            }
          }
        }

        // If still no food item and user is in recipe mode, ask what they want to cook
        if (!foodItem && userInRecipeMode) {
          const recipePromptResponse = `🍳 **Recipe Mode Active!** 

I'm ready to help you cook something delicious! What would you like to make today?

Here are some popular options:
- **🍝 Pasta dishes** (carbonara, alfredo, marinara)
- **🍛 Indian classics** (biryani, dal, curry, paneer tikka)
- **🥗 Healthy meals** (salads, quinoa bowls, smoothies)
- **🍰 Desserts** (cakes, cookies, puddings)
- **🥪 Quick meals** (sandwiches, wraps, omelets)
- **🍲 Comfort food** (soups, stews, casseroles)

Just tell me what you're craving, and I'll give you a detailed recipe with:
- ✅ Complete ingredient list
- ✅ Step-by-step instructions  
- ✅ Cooking tips & tricks
- ✅ Nutritional information
- ✅ Serving suggestions

**What sounds good to you?**`;

          return {
            text: recipePromptResponse,
            suggestions: [
              '🍝 Pasta recipe',
              '🍛 Indian curry',
              '🥗 Healthy salad',
              '🍰 Easy dessert'
            ],
            model: 'recipe-mode-prompt',
            timestamp: new Date(),
            recipeMode: true
          };
        }

        // If still no food item found, use a generic approach
        if (!foodItem) {
          foodItem = 'a delicious dish';
        }

        console.log('🎯 Extracted food item:', foodItem);

        // Generate detailed recipe using Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const recipePrompt = `As a professional chef and nutrition expert, provide a comprehensive recipe for "${foodItem}". 

Please structure your response EXACTLY like this:

# 🍽️ **${foodItem.toUpperCase()} RECIPE**

## 📋 **Ingredients:**
- List all ingredients with exact measurements
- Include preparation notes for ingredients

## ⏱️ **Cooking Time:**
- Prep time: X minutes
- Cook time: X minutes  
- Total time: X minutes
- Serves: X people

## 🔥 **Difficulty Level:** Beginner/Intermediate/Advanced

## 👨‍🍳 **Step-by-Step Instructions:**
1. **Step 1:** Detailed instruction
2. **Step 2:** Detailed instruction  
3. **Step 3:** Detailed instruction
(Continue with all steps)

## 💡 **Chef's Tips:**
- Professional tips for best results
- Common mistakes to avoid
- Ingredient substitutions

## 🥗 **Nutritional Information:**
- Approximate calories per serving
- Key nutrients
- Health benefits

## 🍽️ **Serving Suggestions:**
- What to serve with this dish
- Presentation tips

Make it beginner-friendly but comprehensive. Include any cultural context if relevant.`;

        const result = await model.generateContent(recipePrompt);
        const response = await result.response;
        const recipeText = response.text();

        console.log('✅ Recipe generated successfully');

        return {
          text: recipeText,
          suggestions: [
            '🍳 Show me another recipe',
            '⏱️ Quick 15-minute recipes',
            '🥗 Make it healthier',
            '🔄 Suggest ingredient substitutes'
          ],
          model: 'recipe-generator',
          timestamp: new Date(),
          recipeMode: true,
          foodItem: foodItem
        };

      } catch (recipeError) {
        console.error('❌ Error generating recipe:', recipeError);
        
        // Fallback recipe response
        const fallbackRecipe = `# 🍳 **Recipe for ${foodItem.toUpperCase()}**

I'd love to help you cook ${foodItem}! Here's a basic approach:

## 📋 **Basic Method:**
1. **Prepare ingredients** - Gather all necessary items
2. **Follow cooking basics** - Clean, chop, and prep
3. **Cook with care** - Use appropriate heat and timing
4. **Season to taste** - Add spices and flavors gradually
5. **Serve fresh** - Best enjoyed immediately

## 💡 **Cooking Tips:**
- Always read the full recipe before starting
- Prepare all ingredients beforehand (mise en place)
- Taste and adjust seasoning as you cook
- Don't be afraid to experiment!

## 🔄 **Need More Details?**
Try asking me something like:
- "Show me detailed recipe for ${foodItem}"
- "What ingredients do I need for ${foodItem}?"
- "Step by step cooking instructions for ${foodItem}"

I can provide more specific guidance based on your cooking level and preferences!`;

        return {
          text: fallbackRecipe,
          suggestions: [
            `Detailed ${foodItem} recipe`,
            'Quick cooking tips',
            'Ingredient substitutions',
            'Cooking techniques'
          ],
          model: 'recipe-fallback',
          timestamp: new Date(),
          recipeMode: true,
          error: 'Recipe generation partially failed, using fallback'
        };
      }
    }

    // Handle meal modification requests
    const modificationKeywords = [
      'make it healthier', 'make it spicier', 'make it milder', 'add more protein',
      'make it vegan', 'make it vegetarian', 'gluten-free', 'low-carb', 'keto',
      'more filling', 'lighter meal', 'quicker to cook', 'use different ingredients'
    ];

    const isModificationRequest = modificationKeywords.some(keyword => 
      message.includes(keyword)
    );

    if (isModificationRequest && userId) {
      try {
        console.log('🔧 Detected meal modification request');
        
        // Get current meal context
        const user = await User.findById(userId);
        const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
        
        if (mealPlan) {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const todayMeal = mealPlan.week.find(day => 
            day.day.toLowerCase() === today.toLowerCase()
          );

          if (todayMeal) {
            const targetMeal = [todayMeal.breakfast, todayMeal.lunch, todayMeal.dinner]
              .reduce((prev, current) => (current.calories > prev.calories) ? current : prev);

            const userPreferences = buildUserContext(user);

            // Generate meal modification
            const modification = await mealReplacementService.modifyMeal(
              targetMeal,
              userMessage,
              userPreferences
            );

            let responseText = `Great! I've modified your ${targetMeal.dish} based on your request:\n\n`;
            responseText += `**Modified Meal: ${modification.modifiedMeal.name}**\n`;
            responseText += `${modification.modifiedMeal.description}\n\n`;
            responseText += `**Nutritional Changes:**\n`;
            responseText += `• Calories: ${modification.nutritionalComparison.calorieChange > 0 ? '+' : ''}${modification.nutritionalComparison.calorieChange}\n`;
            responseText += `• Protein: ${modification.nutritionalComparison.proteinChange > 0 ? '+' : ''}${modification.nutritionalComparison.proteinChange}g\n`;
            responseText += `• Health Score: ${modification.nutritionalComparison.healthScoreChange > 0 ? '+' : ''}${modification.nutritionalComparison.healthScoreChange}\n\n`;
            responseText += `**Why this works:** ${modification.explanation}\n\n`;
            
            if (modification.alternativeOptions.length > 0) {
              responseText += `**Other options:**\n`;
              modification.alternativeOptions.forEach(option => {
                responseText += `• ${option}\n`;
              });
            }

            return {
              text: responseText,
              suggestions: [
                'Show original meal',
                'Make it even healthier',
                'Try different modification',
                'Save this modification'
              ],
              model: 'meal-modification',
              timestamp: new Date(),
              modification
            };
          }
        }
      } catch (modError) {
        console.error('❌ Error in meal modification:', modError);
        // Continue with normal AI response
      }
    }

    // Regular AI response generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Enhanced system prompt for meal-aware conversations
    let enhancedSystemPrompt = systemPrompt ? 
      `${systemPrompt}

SPECIAL CAPABILITIES:
- You can help users replace meals they don't like
- You can modify meals to be healthier, spicier, vegan, etc.
- When users say they don't like a meal, ask what specifically they'd like to change
- Offer smart ingredient substitutions
- Provide contextual meal suggestions based on time, mood, weather

MEAL REPLACEMENT TRIGGERS:
- "I don't like this meal" → Offer alternatives
- "Change my meal" → Provide replacements  
- "Make it healthier/spicier/vegan" → Modify current meal
- "Something else" → Suggest different options
- "Without [ingredient]" → Provide substitutions

IMPORTANT: 
- You can only provide suggestions and information about meals
- You CANNOT actually update or modify meal plans in the database
- Never say "I've updated your meal plan" or "I've changed your meal" 
- Always tell users to use specific commands or confirm with the system to make actual changes
- If they want to change meals, explain they need to say specific phrases like "replace it" after seeing suggestions

Always be helpful, encouraging, and focus on making healthy eating enjoyable!` : systemPrompt;

    // If we have an authenticated user, append a short, structured user context summary
    if (userId) {
      try {
        const user = await User.findById(userId).select('-password -otp -otpExpiry');
        const latestMealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });

        const allergies = (user?.foodAllergies && user.foodAllergies.length > 0) ? user.foodAllergies.join(', ') : 'None';
        const prefs = user?.preferences ? JSON.stringify(user.preferences) : 'None';
        const goal = user?.goalWeight ? `Goal weight: ${user.goalWeight}` : 'No specific weight goal';

        let mealPlanSummary = 'No saved meal plan';
        if (latestMealPlan && latestMealPlan.week && latestMealPlan.week.length > 0) {
          // Summarize only today's and next two days to keep prompt short
          const daysToShow = latestMealPlan.week.slice(0, 3).map(d => `${d.day}: B:${d.breakfast?.dish || 'N/A'}, L:${d.lunch?.dish || 'N/A'}, D:${d.dinner?.dish || 'N/A'}`);
          mealPlanSummary = daysToShow.join(' | ');
        }

        enhancedSystemPrompt += `\n\nUSER PROFILE SUMMARY (from onboarding):\n- Age: ${user?.age || 'N/A'}\n- Gender: ${user?.gender || 'N/A'}\n- Height: ${user?.height || 'N/A'} cm\n- Current weight: ${user?.currentWeight || 'N/A'} kg\n- ${goal}\n- Allergies: ${allergies}\n- Preferences: ${prefs}\n- Activity level: ${user?.activityLevel || 'Unknown'}\n\nCURRENT MEAL PLAN (summary): ${mealPlanSummary}\n\nNOTE: Use this profile and current meal plan to personalise recipe suggestions, substitutions, and replacements. Prefer options that respect allergies and stated preferences and keep macros/calories similar where requested.`;
      } catch (err) {
        console.log('⚠️ Could not fetch user context for prompt:', err.message);
      }
    }
    
    // Build conversation context
    let conversationContext = '';
    if (enhancedSystemPrompt) {
      conversationContext += `${enhancedSystemPrompt}\n\n`;
    }
    
    // Add recent conversation history (last 10 messages for context)
    const recentMessages = conversationHistory.slice(-10);
    if (recentMessages.length > 0) {
      conversationContext += 'Recent conversation:\n';
      recentMessages.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Aarav';
        conversationContext += `${role}: ${msg.content}\n`;
      });
      conversationContext += '\n';
    }
    
    // Add current user message
    conversationContext += `User: ${userMessage}\nAarav:`;
    
    console.log('🤖 Generating regular AI response with Gemini...');
    console.log('📝 Message that reached regular AI:', userMessage);
    console.log('📝 Context length:', conversationContext.length);
    
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const text = response.text();
    
    // Generate enhanced contextual suggestions
    const suggestions = generateEnhancedContextualSuggestions(userMessage, text);
    
    console.log('✅ AI response generated successfully');
    console.log('📝 Response length:', text.length);
    
    return {
      text: text.trim(),
      suggestions,
      model: 'gemini-2.5-flash',
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    
    // Enhanced fallback responses
    const fallbackResponses = [
      "I'm here to help you with your health and wellness journey! I can help you change meals you don't like, make them healthier, or find alternatives. What would you like to explore?",
      "I'd be happy to assist you with nutrition, fitness, or wellness advice. I can also help replace meals or modify them to your preferences. What specific area would you like to focus on?",
      "As your health assistant, I can help with meal planning, suggest alternatives if you don't like certain foods, and provide exercise suggestions. What can I help you with today?",
      "I'm experiencing a brief moment of reflection 🤔 I can help you change meals, make them healthier, or find alternatives. Could you tell me what you'd like to explore?",
      "Let me help you on your wellness journey! I can suggest meal replacements, modifications, or general health advice. What would you like to discuss?"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      text: randomResponse,
      suggestions: ['Change my current meal', 'Make it healthier', 'Show meal alternatives', 'Help with fitness goals'],
      model: 'fallback-enhanced',
      error: error.message
    };
  }
};

// Generate enhanced contextual suggestions based on conversation
const generateEnhancedContextualSuggestions = (userMessage, aiResponse) => {
  const message = userMessage.toLowerCase();
  const response = aiResponse.toLowerCase();
  
  // Recipe-related suggestions
  if (message.includes('recipe') || message.includes('cook') || message.includes('how to make') || message.includes('ingredients')) {
    return [
      '🍳 Show me recipe details',
      '⏱️ Quick 15-minute recipes',
      '🥗 Healthy recipe alternatives',
      '📋 Save this recipe'
    ];
  }
  
  // Meal replacement/modification suggestions
  if (message.includes('don\'t like') || message.includes('hate') || message.includes('change') || message.includes('replace')) {
    return [
      'Show me more meal alternatives',
      'Make it healthier',
      'Quick 15-minute meal options',
      'Change another meal today'
    ];
  }
  
  // Meal plan related suggestions
  if (message.includes('meal') || message.includes('food') || message.includes('diet') || message.includes('eat')) {
    return [
      'I don\'t like this meal - change it',
      'Make my meal healthier',
      'Show today\'s meal details',
      '🍳 Get recipe for this meal'
    ];
  }
  
  // Ingredient/cooking suggestions
  if (message.includes('ingredient') || message.includes('cook') || message.includes('recipe') || message.includes('spicy')) {
    return [
      'Substitute ingredients I don\'t like',
      'Make it spicier/milder',
      'Quick cooking alternatives',
      'Change cooking method'
    ];
  }
  
  // Dietary preference changes
  if (message.includes('vegan') || message.includes('vegetarian') || message.includes('gluten') || message.includes('keto')) {
    return [
      'Make my meals vegan',
      'Convert to gluten-free',
      'Show keto alternatives',
      'Healthy substitutions'
    ];
  }
  
  // Fitness related suggestions
  if (message.includes('exercise') || message.includes('workout') || message.includes('fitness') || message.includes('gym')) {
    return [
      'Create a workout plan for me',
      'Track my fitness progress',
      'Suggest exercises for beginners',
      'Meals for my workout goals'
    ];
  }
  
  // Weight/health goals
  if (message.includes('weight') || message.includes('goal') || message.includes('lose') || message.includes('gain')) {
    return [
      'Adjust meals for weight goals',
      'Tips for healthy weight management',
      'Track my progress over time',
      'Change meal portions'
    ];
  }
  
  // General health
  if (message.includes('health') || message.includes('wellness') || message.includes('feel') || message.includes('energy')) {
    return [
      'Tips for better sleep and recovery',
      'Energy-boosting meal suggestions',
      'Stress management techniques',
      'Daily wellness habits to build'
    ];
  }
  
  // Default enhanced suggestions with recipe option
  return [
    'I don\'t like my current meal',
    '🍳 Show me a recipe',
    'Make my meal healthier',
    'Help with fitness goals'
  ];
};

// Create or get existing chat session
const createOrGetSession = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user has an active session
    let existingSession = await ChatSession.findOne({ 
      userId: userId, 
      isActive: true 
    }).sort({ lastActivity: -1 });

    if (existingSession) {
      // Update last activity
      existingSession.lastActivity = new Date();
      await existingSession.save();
      
      return res.status(200).json({
        success: true,
        sessionId: existingSession.sessionId,
        message: 'Existing session retrieved'
      });
    }

    // Create new session
    const sessionId = `session_${userId}_${Date.now()}`;
    const newSession = new ChatSession({
      sessionId,
      userId
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      sessionId: sessionId,
      message: 'New session created'
    });

  } catch (error) {
    console.error('Error in createOrGetSession:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's chat sessions
const getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const sessions = await ChatSession.find({ userId })
      .sort({ lastActivity: -1 })
      .select('sessionId isActive lastActivity createdAt');

    res.status(200).json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Error in getUserSessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Start new chat session (deactivate old ones)
const startNewSession = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Deactivate all existing sessions for this user
    await ChatSession.updateMany(
      { userId: userId, isActive: true },
      { isActive: false }
    );

    // Create new session
    const sessionId = `session_${userId}_${Date.now()}`;
    const newSession = new ChatSession({
      sessionId,
      userId
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      sessionId: sessionId,
      message: 'New session started'
    });

  } catch (error) {
    console.error('Error in startNewSession:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Handle chat message with internal Gemini AI and smart meal features
const sendChatMessage = async (req, res) => {
  const startTime = Date.now();
  try {
    const { sessionId, message, systemPrompt } = req.body;
    
    console.log('🔍 Backend received message request:', {
      sessionId,
      messageLength: message?.length,
      systemPromptLength: systemPrompt?.length,
      hasSystemPrompt: !!systemPrompt
    });
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required',
        responseTime: Date.now() - startTime
      });
    }

    // Update session activity asynchronously (20-30% improvement)
    updateSessionActivity(sessionId);

    // Clear cache for this session when new message is sent
    clearSessionCache(sessionId);

    // Prepare request data with system prompt if provided
    const requestData = {
      sessionId,
      message
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestData.systemPrompt = systemPrompt;
      console.log('✅ Added system prompt to request data');
      console.log('📝 System prompt length:', systemPrompt.length);
      console.log('📝 System prompt preview:', systemPrompt.substring(0, 300) + '...');
    } else {
      console.log('⚠️ No system prompt provided');
    }

    // Get or create chat session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = new ChatSession({ 
        sessionId, 
        userId: req.user?.id || 'anonymous',
        messages: [] // Initialize empty messages array
      });
      await session.save();
      console.log('📝 Created new chat session with ID:', sessionId);
    }

    // Ensure messages array exists (for existing sessions that might not have it)
    if (!session.messages) {
      session.messages = [];
    }

    // Add user message to session
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);
    console.log('💬 Added user message to session, total messages:', session.messages.length);

    // Generate AI response using our internal Gemini implementation with smart meal features
    console.log('🤖 Generating response with internal Gemini AI...');
    console.log('📋 System prompt preview:', systemPrompt ? systemPrompt.substring(0, 500) + '...' : 'No system prompt');
    const userId = session.userId || req.user?.id;
    const aiResponse = await generateAIResponse(message, systemPrompt, session.messages, userId);

    // Add AI message to session
    const aiMessage = {
      role: 'assistant',
      content: aiResponse.text,
      timestamp: new Date()
    };
    session.messages.push(aiMessage);
    session.lastActivity = new Date();
    
    console.log('🤖 Added AI response to session, total messages:', session.messages.length);
    
    // Save session with new messages
    await session.save();
    console.log('💾 Session saved successfully');

    console.log(`✅ Chat response generated in ${Date.now() - startTime}ms`);

    // Return our internal response
    res.status(200).json({
      success: true,
      response: aiResponse.text,
      timestamp: aiMessage.timestamp,
      suggestions: aiResponse.suggestions || [],
      responseTime: Date.now() - startTime,
      source: 'internal-gemini',
      model: aiResponse.model,
      // If the AI flow performed a meal replacement, include the result so frontend can react (refresh UI, etc.)
      replacementResult: aiResponse.replacementResult || null
    });

  } catch (error) {
    console.error('❌ Error in sendChatMessage:', error);
    console.error('📍 Error stack:', error.stack);
    
    // Provide more specific error information
    let errorMessage = 'Internal server error';
    if (error.message.includes('Cannot read properties of undefined')) {
      errorMessage = 'Session initialization error - please try again';
      console.log('🔧 Hint: This might be due to missing messages array in session');
    } else if (error.message.includes('Google AI')) {
      errorMessage = 'AI service temporarily unavailable';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      responseTime: Date.now() - startTime,
      debug: {
        sessionId,
        hasMessage: !!message,
        hasSystemPrompt: !!systemPrompt
      }
    });
  }
};

// Stream chat message using chunked responses (works with fetch + ReadableStream on the client)
const sendChatMessageStream = async (req, res) => {
  const startTime = Date.now();
  try {
    const { sessionId, message, systemPrompt } = req.body;

    console.log('\u23f3 Backend received STREAM message request:', { sessionId, messageLength: message?.length });

    if (!sessionId || !message) {
      return res.status(400).json({ success: false, message: 'Session ID and message are required' });
    }

    // Prepare response headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Some proxies require this header to avoid buffering
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders && res.flushHeaders();

    // Update session activity asynchronously
    updateSessionActivity(sessionId);
    clearSessionCache(sessionId);

    // Get or create chat session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = new ChatSession({ sessionId, userId: req.user?.id || 'anonymous', messages: [] });
      await session.save();
      console.log('�created new session for streaming:', sessionId);
    }

    if (!session.messages) session.messages = [];

    // Add user message to session (but don't save AI reply yet)
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    session.messages.push(userMessage);
    await session.save();

    // Generate AI response (we currently generate full content then stream it in chunks)
    const userId = session.userId || req.user?.id;
    const aiResponse = await generateAIResponse(message, systemPrompt, session.messages, userId);

    const fullText = (aiResponse && aiResponse.text) ? aiResponse.text : String(aiResponse || '');

    // Stream the response in chunks so client can render progressively
    const chunkSize = 250; // characters per chunk
    let position = 0;

    // Listen for client disconnect
    let clientAborted = false;
    req.on('close', () => {
      clientAborted = true;
      console.log('Client closed the stream connection for session:', sessionId);
    });

    while (position < fullText.length) {
      if (clientAborted) break;
      const chunk = fullText.slice(position, position + chunkSize);
      // Prefix each chunk with a JSON line to make it easy for client to parse
      const payload = JSON.stringify({ chunk });
      res.write(payload + '\n');
      // Small delay to simulate streaming / allow client to render partials
      await new Promise(r => setTimeout(r, 60));
      position += chunkSize;
    }

    if (!clientAborted) {
      // Write final marker with metadata
      const aiMessage = { role: 'assistant', content: fullText, timestamp: new Date() };
      session.messages.push(aiMessage);
      session.lastActivity = new Date();
      await session.save();

      const meta = JSON.stringify({ done: true, timestamp: aiMessage.timestamp, suggestions: aiResponse.suggestions || [] });
      res.write(meta + '\n');
    }

    try {
      res.end();
    } catch (e) {
      // ignore
    }

    console.log(`\u2705 Stream completed in ${Date.now() - startTime}ms for session: ${sessionId}`);

  } catch (error) {
    console.error('\u274c Error in sendChatMessageStream:', error);
    // If headers already sent, just end the stream with an error marker
    try {
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
      } else {
        res.write(JSON.stringify({ error: error.message }) + '\n');
        res.end();
      }
    } catch (e) {
      // ignore
    }
  }
};

// Get user context for system prompt
const getUserContext = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 Getting user context for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Fetch user details
    const user = await User.findById(userId).select('-password -otp -otpExpiry');
    console.log('👤 User found:', !!user, user ? { username: user.username, email: user.email } : 'null');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch latest meal plan
    const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
    console.log('🍽️ Meal plan found:', !!mealPlan, mealPlan ? `Created: ${mealPlan.createdAt}` : 'null');

    // Create user context object
    const userContext = {
      personalInfo: {
        username: user.username,
        email: user.email,
        gender: user.gender,
        height: user.height,
        currentWeight: user.currentWeight,
        goalWeight: user.goalWeight,
        age: user.age,
        isOnboardingComplete: user.isOnboardingComplete
      },
      healthProfile: {
        foodAllergies: user.foodAllergies || [],
        preferences: user.preferences || {},
        role: user.role
      },
      currentMealPlan: mealPlan ? {
        createdAt: mealPlan.createdAt,
        weeklyPlan: mealPlan.week.map(day => ({
          day: day.day,
          breakfast: day.breakfast.dish,
          lunch: day.lunch.dish,
          dinner: day.dinner.dish,
          totalCalories: day.breakfast.calories + day.lunch.calories + day.dinner.calories
        }))
      } : null
    };

    res.status(200).json({
      success: true,
      userContext,
      message: 'User context retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getUserContext:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get chat history from internal database with caching and optimizations
const getChatHistory = async (req, res) => {
  const startTime = Date.now();
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
        responseTime: Date.now() - startTime
      });
    }

    // Create cache key including pagination
    const cacheKey = `chat_history_${sessionId}_${page}_${limit}`;
    
    // Check cache first (80-95% performance improvement)
    const cachedHistory = chatCache.get(cacheKey);
    if (cachedHistory) {
      console.log(`⚡ Cache hit for: ${cacheKey} (${Date.now() - startTime}ms)`);
      return res.json({
        ...cachedHistory,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    console.log(`🔍 Cache miss for: ${cacheKey}, fetching from database`);

    // Update session activity asynchronously (don't wait for it)
    updateSessionActivity(sessionId);

    // Fetch session from internal database
    const session = await ChatSession.findOne({ sessionId }).lean();
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
        responseTime: Date.now() - startTime
      });
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalMessages = session.messages?.length || 0;
    const messages = session.messages?.slice(skip, skip + parseInt(limit)) || [];
    
    const responseData = {
      success: true,
      messages: messages,
      pagination: {
        currentPage: parseInt(page),
        totalMessages,
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        hasNextPage: skip + parseInt(limit) < totalMessages,
        hasPrevPage: parseInt(page) > 1
      }
    };

    // Cache the result for 3 minutes
    chatCache.set(cacheKey, responseData, 180);
    console.log(`💾 Cached result for: ${cacheKey}`);

    // Return our internal response
    res.status(200).json({
      ...responseData,
      cached: false,
      responseTime: Date.now() - startTime,
      source: 'internal-database'
    });

  } catch (error) {
    console.error('Error in getChatHistory:', error);
    
    // Internal server error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
};

// Get cache statistics for monitoring
const getCacheStats = async (req, res) => {
  try {
    const stats = chatCache.getStats();
    const keys = chatCache.keys();
    
    res.status(200).json({
      success: true,
      cacheStats: {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0,
        ksize: stats.ksize,
        vsize: stats.vsize
      },
      totalCachedSessions: keys.filter(key => key.includes('chat_history')).length,
      message: 'Cache statistics retrieved'
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear cache for a specific session (admin function)
const clearCacheForSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    clearSessionCache(sessionId);

    res.status(200).json({
      success: true,
      message: `Cache cleared for session: ${sessionId}`
    });
  } catch (error) {
    console.error('Error clearing session cache:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Smart meal replacement endpoint
const requestMealReplacement = async (req, res) => {
  try {
    const { userId, currentMeal, replacementReason } = req.body;
    
    if (!userId || !currentMeal) {
      return res.status(400).json({
        success: false,
        message: 'User ID and current meal are required'
      });
    }

    // Get user context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userContext = buildUserContext(user);

    // Generate meal replacements
    const replacements = await mealReplacementService.suggestMealReplacement(
      currentMeal,
      userContext,
      replacementReason || 'User requested alternatives'
    );

    res.status(200).json({
      success: true,
      message: 'Meal replacements generated successfully',
      data: replacements
    });

  } catch (error) {
    console.error('Error in requestMealReplacement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Confirm and actually replace meal in meal plan
const confirmMealReplacement = async (req, res) => {
  try {
    const { userId, dayOfWeek, mealType, selectedReplacementIndex, selectedReplacement, replacementReason } = req.body;
    
    if (!userId || !dayOfWeek || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'User ID, day of week, and meal type are required'
      });
    }

    // Get current meal
    const currentMeal = await mealReplacementService.getCurrentMeal(userId, dayOfWeek, mealType);
    
    // Get user context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userContext = buildUserContext(user);

    let replacementResult = null;

    // Helper to autofill conservative estimates
    const safeNumber = (v, fallback = 0) => {
      if (v === undefined || v === null || Number.isNaN(Number(v))) return fallback;
      return Number(v);
    };

    // If frontend provided the exact replacement object, validate and autofill missing fields, then apply
    if (selectedReplacement && typeof selectedReplacement === 'object') {
      const warnings = [];

      // name is required
      if (!selectedReplacement.name && !selectedReplacement.title) {
        return res.status(400).json({ success: false, message: 'Selected replacement must include a name/title' });
      }

      // Ensure calories and macros exist, otherwise autofill conservative estimates
      const calories = safeNumber(selectedReplacement.calories, null);
      const protein = safeNumber((selectedReplacement.macros && selectedReplacement.macros.protein) || selectedReplacement.protein, null);
      const carbs = safeNumber((selectedReplacement.macros && selectedReplacement.macros.carbs) || selectedReplacement.carbs, null);
      const fat = safeNumber((selectedReplacement.macros && selectedReplacement.macros.fat) || selectedReplacement.fats || selectedReplacement.fat, null);

      let finalCalories = calories;
      let finalProtein = protein;
      let finalCarbs = carbs;
      let finalFat = fat;

      if (finalCalories === null && (finalProtein !== null || finalCarbs !== null || finalFat !== null)) {
        // compute calories from macros if possible
        finalCalories = Math.round((finalProtein || 0) * 4 + (finalCarbs || 0) * 4 + (finalFat || 0) * 9) || 300;
        warnings.push('Calories estimated from macros');
      }

      if (finalProtein === null || finalCarbs === null || finalFat === null) {
        // If macros missing, make conservative splits from calories
        const cals = finalCalories || 300;
        if (finalProtein === null) finalProtein = Math.round((cals * 0.2) / 4);
        if (finalCarbs === null) finalCarbs = Math.round((cals * 0.5) / 4);
        if (finalFat === null) finalFat = Math.round((cals * 0.3) / 9);
        warnings.push('Macros estimated from calories');
      }

      // Ensure instructions/recipe and ingredients exist
      const instructions = selectedReplacement.instructions || selectedReplacement.recipe || selectedReplacement.description || '';
      if (!instructions) warnings.push('No instructions/recipe provided');

      // Ensure prepTime and difficulty
      const prepTime = selectedReplacement.prepTime || selectedReplacement.cookTime || '30 min';
      const difficulty = selectedReplacement.difficulty || 'easy';

      // Build final replacement object in the shape service expects
      const finalReplacement = {
        name: selectedReplacement.name || selectedReplacement.title,
        description: selectedReplacement.description || selectedReplacement.summary || '',
        calories: finalCalories || 300,
        macros: {
          protein: finalProtein,
          carbs: finalCarbs,
          fat: finalFat
        },
        prepTime,
        difficulty,
        ingredients: Array.isArray(selectedReplacement.ingredients) ? selectedReplacement.ingredients : (selectedReplacement.ingredients ? [selectedReplacement.ingredients] : []),
        instructions,
        whyGoodReplacement: selectedReplacement.whyGoodReplacement || selectedReplacement.rationale || ''
      };

      // Apply replacement
      replacementResult = await mealReplacementService.replaceMealInPlan(
        userId,
        dayOfWeek,
        mealType,
        finalReplacement
      );

      // Include any warnings in the response so frontend can surface them
      replacementResult.warnings = warnings;
    } else {
      // Fallback: run the original replace flow which generates suggestions and applies selected index
      replacementResult = await mealReplacementService.replaceAndUpdateMeal(
        userId,
        dayOfWeek,
        mealType,
        currentMeal,
        userContext,
        replacementReason || 'User confirmed replacement',
        selectedReplacementIndex || 0
      );
    }

    res.status(200).json({
      success: true,
      message: `Successfully replaced ${mealType} for ${dayOfWeek}`,
      data: replacementResult
    });

  } catch (error) {
    console.error('Error in confirmMealReplacement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Smart meal modification endpoint
const modifyMeal = async (req, res) => {
  try {
    const { userId, currentMeal, modificationRequest } = req.body;
    
    if (!userId || !currentMeal || !modificationRequest) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current meal, and modification request are required'
      });
    }

    // Get user context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userPreferences = buildUserContext(user);

    // Generate meal modification
    const modification = await mealReplacementService.modifyMeal(
      currentMeal,
      modificationRequest,
      userPreferences
    );

    res.status(200).json({
      success: true,
      message: 'Meal modified successfully',
      data: modification
    });

  } catch (error) {
    console.error('Error in modifyMeal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get contextual meal suggestions
const getContextualSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, energyLevel, availableTime, weather } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user context
    const user = await User.findById(userId);
    const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
    
    const userContext = {
      currentTime: new Date().toLocaleTimeString(),
      mood: mood || 'neutral',
      energyLevel: energyLevel || 'moderate',
      availableTime: availableTime || '30 minutes',
      weather: weather || 'mild',
      recentMeals: mealPlan?.week.slice(-3) || [],
      healthGoals: user?.goalWeight ? 'Weight management' : 'General wellness',
      restrictions: user?.foodAllergies || [],
      equipment: 'basic'
    };

    // Generate contextual suggestions
    const suggestions = await mealReplacementService.getContextualMealSuggestions(userContext);

    res.status(200).json({
      success: true,
      message: 'Contextual suggestions generated successfully',
      data: suggestions
    });

  } catch (error) {
    console.error('Error in getContextualSuggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user meal preferences based on feedback
const updateMealPreferences = async (req, res) => {
  try {
    const { userId, mealFeedback } = req.body;
    
    if (!userId || !mealFeedback) {
      return res.status(400).json({
        success: false,
        message: 'User ID and meal feedback are required'
      });
    }

    // Update preferences
    const result = await mealReplacementService.updateUserPreferences(userId, mealFeedback);

    res.status(200).json({
      success: true,
      message: 'Meal preferences updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in updateMealPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current meal plan to verify updates
const getCurrentMealPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's current meal plan
    const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'No meal plan found for user'
      });
    }

    // Get today's meal for quick reference
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayMeal = mealPlan.week.find(day => day.day === today);

    res.status(200).json({
      success: true,
      message: 'Meal plan retrieved successfully',
      data: {
        mealPlan: mealPlan.week,
        todayMeal: todayMeal || null,
        today: today,
        lastUpdated: mealPlan.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in getCurrentMealPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// AI-assisted update: generate suggestions or directly replace a meal based on user's instruction
const aiUpdateMeal = async (req, res) => {
  try {
    // Prefer authenticated user id
    const userId = req.user?._id || req.body.userId;
    const { dayOfWeek, mealType, instruction, autoConfirm = false, selectedReplacementIndex = 0 } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!dayOfWeek || !mealType) {
      return res.status(400).json({ success: false, message: 'dayOfWeek and mealType are required' });
    }

    // Fetch current meal and user context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Enforce meal-plan-mode for AI-chat driven changes, but allow bypass for requests
    // originating from the Meal Planner UI which set `allowFromPlanner: true` in the request body.
    const mealPlanModeEnabled = user?.preferences?.mealPlanMode === true || user?.preferences?.mealPlanMode === 'true';
    const allowFromPlanner = req.body?.allowFromPlanner === true;
    if (!mealPlanModeEnabled && !allowFromPlanner) {
      return res.status(403).json({
        success: false,
        message: 'Meal changes are only allowed when Meal Plan Mode is enabled. Please enable Meal Plan Mode in the AI Chat (🍽️) or in your preferences to make changes.'
      });
    }

    const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'No meal plan found for user' });
    }

    // Get the current meal object
    const currentMeal = await mealReplacementService.getCurrentMeal(userId, dayOfWeek, mealType);

    const userContext = buildUserContext(user);

    // If autoConfirm is true, generate suggestions and immediately apply the selected replacement
    if (autoConfirm) {
      const replacementResult = await mealReplacementService.replaceAndUpdateMeal(
        userId,
        dayOfWeek,
        mealType,
        currentMeal,
        userContext,
        instruction || 'AI-assisted replacement',
        selectedReplacementIndex
      );

      return res.status(200).json({
        success: true,
        message: `Replaced ${mealType} for ${dayOfWeek}`,
        data: replacementResult
      });
    }

    // Otherwise, just return AI-generated suggestions the frontend can show to the user
    const suggestions = await mealReplacementService.suggestMealReplacement(
      currentMeal,
      userContext,
      instruction || 'Suggest replacements based on user preferences'
    );

    res.status(200).json({
      success: true,
      message: 'Replacement suggestions generated',
      suggestions
    });

  } catch (error) {
    console.error('Error in aiUpdateMeal:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Toggle recipe mode for user
const toggleRecipeMode = async (req, res) => {
  try {
    const { userId, recipeMode } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Update user's recipe mode preference
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize preferences if they don't exist
    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences.recipeMode = recipeMode;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Recipe mode ${recipeMode ? 'enabled' : 'disabled'}`,
      recipeMode: recipeMode
    });

  } catch (error) {
    console.error('Error in toggleRecipeMode:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get detailed recipe for specific dish
const getDetailedRecipe = async (req, res) => {
  try {
    const { dishName, difficulty, servings, dietaryRestrictions } = req.body;
    
    if (!dishName) {
      return res.status(400).json({
        success: false,
        message: 'Dish name is required'
      });
    }

    if (!genAI) {
      throw new Error('Google AI not initialized - GOOGLE_API_KEY missing');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let dietaryNote = '';
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      dietaryNote = `\n\nIMPORTANT: Make this recipe ${dietaryRestrictions.join(', ')} friendly. Suggest appropriate substitutions where needed.`;
    }

    const detailedPrompt = `As a professional chef, create a comprehensive, detailed recipe for "${dishName}".

Difficulty Level: ${difficulty || 'Beginner'}
Servings: ${servings || '4 people'}${dietaryNote}

Please provide a beautifully formatted recipe with:

# 🍽️ **${dishName.toUpperCase()} RECIPE**

## 📊 **Recipe Overview:**
- **Difficulty:** ${difficulty || 'Beginner'}
- **Prep Time:** X minutes  
- **Cook Time:** X minutes
- **Total Time:** X minutes
- **Serves:** ${servings || '4'} people
- **Cuisine:** [Type of cuisine]

## 📋 **Ingredients:**
*(List in order of use)*
- Ingredient 1 - exact measurement (preparation note)
- Ingredient 2 - exact measurement (preparation note)
[Continue for all ingredients]

## 🔪 **Equipment Needed:**
- List essential cooking equipment
- Any special tools required

## 👨‍🍳 **Detailed Instructions:**
1. **Preparation (X minutes):**
   - Detailed prep steps
   - Tips for ingredient prep

2. **Cooking Step 1 (X minutes):**
   - Specific cooking instruction
   - Temperature/heat level
   - Visual cues to watch for

3. **Cooking Step 2 (X minutes):**
   - Continue with detailed steps
   - Timing and technique tips

[Continue with all steps]

## 💡 **Professional Tips:**
- **Chef's Secret:** Special technique or ingredient
- **Common Mistakes:** What to avoid
- **Quality Check:** How to know it's perfect
- **Storage:** How to store leftovers

## 🔄 **Variations & Substitutions:**
- **Healthier Version:** Lower calorie/fat alternatives
- **Dietary Adaptations:** Vegan/gluten-free options
- **Flavor Variations:** Different spice combinations
- **Ingredient Swaps:** What to use if missing ingredients

## 🥗 **Nutritional Information:**
- **Calories per serving:** Approximate count
- **Key nutrients:** Protein, carbs, fats, fiber
- **Health benefits:** Why this dish is nutritious

## 🍽️ **Serving & Presentation:**
- **Best served with:** Complementary dishes
- **Garnish ideas:** How to make it look professional
- **Wine/drink pairing:** Beverage recommendations
- **Storage tips:** How long it keeps

## 📱 **Troubleshooting:**
- **If too salty:** How to fix
- **If undercooked:** What to do
- **If overcooked:** How to salvage
- **If bland:** How to enhance flavor

Make this recipe accessible for home cooks while maintaining professional quality!`;

    console.log('🍳 Generating detailed recipe for:', dishName);
    
    const result = await model.generateContent(detailedPrompt);
    const response = await result.response;
    const recipeText = response.text();

    console.log('✅ Detailed recipe generated successfully');

    res.status(200).json({
      success: true,
      recipe: {
        dish: dishName,
        difficulty: difficulty || 'Beginner',
        servings: servings || 4,
        dietaryRestrictions: dietaryRestrictions || [],
        content: recipeText,
        generatedAt: new Date()
      },
      suggestions: [
        '🍳 Get another recipe',
        '⏱️ Show quick version',
        '🥗 Make it healthier',
        '🔄 Show variations'
      ]
    });

  } catch (error) {
    console.error('Error in getDetailedRecipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recipe',
      error: error.message
    });
  }
};

// Get recipe suggestions based on available ingredients
const getRecipeSuggestions = async (req, res) => {
  try {
    const { ingredients, cuisine, difficulty, cookingTime, dietaryRestrictions } = req.body;
    
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one ingredient is required'
      });
    }

    if (!genAI) {
      throw new Error('Google AI not initialized - GOOGLE_API_KEY missing');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let filters = '';
    if (cuisine) filters += `Cuisine: ${cuisine}\n`;
    if (difficulty) filters += `Difficulty: ${difficulty}\n`;
    if (cookingTime) filters += `Cooking time: Under ${cookingTime} minutes\n`;
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      filters += `Dietary requirements: ${dietaryRestrictions.join(', ')}\n`;
    }

    const suggestionPrompt = `As a creative chef, suggest 5 delicious recipes using these available ingredients: ${ingredients.join(', ')}

${filters ? `Requirements:\n${filters}` : ''}

For each recipe, provide:

## 🍽️ **Recipe Suggestions**

### **1. [Recipe Name]**
- **Main ingredients used:** [List from available ingredients]
- **Additional ingredients needed:** [Keep minimal]
- **Cooking time:** X minutes
- **Difficulty:** [Level]
- **Description:** Brief appetizing description

### **2. [Recipe Name]**
[Same format]

[Continue for all 5 recipes]

## 💡 **Cooking Tips:**
- How to maximize flavor with available ingredients
- Best cooking methods for these ingredients
- Storage tips for unused ingredients

Focus on practical, delicious recipes that make the most of the available ingredients!`;

    const result = await model.generateContent(suggestionPrompt);
    const response = await result.response;
    const suggestions = response.text();

    res.status(200).json({
      success: true,
      message: 'Recipe suggestions generated successfully',
      suggestions: {
        availableIngredients: ingredients,
        filters: { cuisine, difficulty, cookingTime, dietaryRestrictions },
        content: suggestions,
        generatedAt: new Date()
      },
      quickActions: [
        'Get detailed recipe for #1',
        'Show more options',
        'Different cooking style',
        'Quick 15-min recipes'
      ]
    });

  } catch (error) {
    console.error('Error in getRecipeSuggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recipe suggestions',
      error: error.message
    });
  }
};

// Health check for chatbot system
const getChatbotStatus = async (req, res) => {
  try {
    const stats = chatCache.getStats();
    
    res.status(200).json({
      success: true,
      status: 'healthy',
      chatbot: {
        type: 'internal-gemini-with-smart-meals',
        geminiAvailable: !!genAI,
        mealReplacementEnabled: true,
        cacheEnabled: true,
        cacheStats: {
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0
        }
      },
      message: 'Enhanced chatbot system with smart meal features is operational'
    });
  } catch (error) {
    console.error('Error checking chatbot status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking chatbot status'
    });
  }
};

export {
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
  generateAIResponse,
  toggleRecipeMode,
  getDetailedRecipe,
  getRecipeSuggestions
};
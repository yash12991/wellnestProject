import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaCopy,
  FaUtensils,
  FaCalendarAlt,
} from "react-icons/fa";
import AssistantIcon from "@mui/icons-material/Assistant";
import {
  IoRefresh,
  IoAdd,
  IoSend,
} from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import DashNav from "../../components/DashNav";
import axios from "axios";
import { API_URL } from "../../utils/api";
import "./AIChatbot.css";

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [recipeMode, setRecipeMode] = useState(false);
  const [mealPlanMode, setMealPlanMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get or create session ID for user
  useEffect(() => {
    const initializeSession = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;

      if (!userId) {
        // Handle anonymous users
        const anonSessionId = `session_anonymous_${Date.now()}`;
        setSessionId(anonSessionId);
        loadChatHistory(anonSessionId);
        return;
      }

      // Check if user already has a session ID stored
      const existingSessionId = localStorage.getItem(`chatSessionId_${userId}`);

      if (existingSessionId) {
        setSessionId(existingSessionId);
        loadChatHistory(existingSessionId);
      } else {
        // Create new session via backend API
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.post(
            `${API_URL}/v1/api/chat/session`,
            {
              userId: userId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            const newSessionId = response.data.sessionId;
            localStorage.setItem(`chatSessionId_${userId}`, newSessionId);
            setSessionId(newSessionId);
            loadChatHistory(newSessionId);
          }
        } catch (error) {
          console.error("Error creating session:", error);
          // Fallback to local session ID
          const fallbackSessionId = `session_${userId}_${Date.now()}`;
          localStorage.setItem(`chatSessionId_${userId}`, fallbackSessionId);
          setSessionId(fallbackSessionId);
          loadChatHistory(fallbackSessionId);
        }
      }
    };

    initializeSession();
  }, []);

  // Load chat history from backend API
  const loadChatHistory = async (sessionId) => {
    const loadStart = Date.now();
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_URL}/v1/api/chat/history/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const loadTime = Date.now() - loadStart;
      console.log(`📊 Chat history loaded in ${loadTime}ms${response.data.cached ? ' (cached)' : ''}`);

      if (response.data.success && response.data.messages) {
        const formattedMessages = response.data.messages.map((msg) => ({
          id: msg._id,
          text: msg.content,
          sender: msg.role === "user" ? "user" : "ai",
          timestamp: new Date(msg.timestamp),
          typing: false,
        }));
        setMessages(formattedMessages);

        // Show performance notification for fast loading
        if (response.data.cached && loadTime < 200) {
          console.log(`⚡ Blazingly fast load from cache: ${loadTime}ms`);
        }
      } else {
        // If no history, send initial message to AI to establish context
        await sendInitialWelcomeMessage(sessionId);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Send initial welcome message even on error
      await sendInitialWelcomeMessage(sessionId);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial welcome message to AI with user context
  const sendInitialWelcomeMessage = async (sessionId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userName = user?.username || "there";

      console.log(
        "🎬 Sending initial welcome message to AI for user:",
        userName
      );

      const token = localStorage.getItem("accessToken");
      const systemPrompt = await createSystemPrompt();

      // Send an initial message to the AI to establish user context
      const response = await axios.post(
        `${API_URL}/v1/api/chat/message`,
        {
          sessionId: sessionId,
          message: `Hello, I'm ${userName}. Please introduce yourself and let me know how you can help me with my health and wellness goals based on my profile.`,
          systemPrompt: systemPrompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const aiWelcomeMessage = {
          id: "welcome",
          text: response.data.response,
          sender: "ai",
          timestamp: new Date(response.data.timestamp),
          typing: false,
          isWelcome: true,
        };

        console.log("✅ Received personalized welcome message from AI");
        setMessages([aiWelcomeMessage]);
      } else {
        // Fallback to local welcome message if API fails
        console.log("⚠️ API failed, using fallback welcome message");
        setMessages([
          {
            id: "welcome",
            text: `Hello ${userName}! 👋 I'm Aarav, your personal WellNest AI health assistant. I'm here to help you with health advice, meal planning, and wellness guidance. How can I assist you today?`,
            sender: "ai",
            timestamp: new Date(),
            typing: false,
            isWelcome: true,
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Error sending initial welcome message:", error);
      // Fallback welcome message
      const user = JSON.parse(localStorage.getItem("user"));
      const userName = user?.username || "there";

      setMessages([
        {
          id: "welcome",
          text: `Hello ${userName}! 👋 I'm Aarav, your personal WellNest AI health assistant. I'm here to help you with health advice, meal planning, and wellness guidance. How can I assist you today?`,
          sender: "ai",
          timestamp: new Date(),
          typing: false,
          isWelcome: true,
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isTyping) return;

    const messageText = inputMessage;
    const sendStart = Date.now();
    setInputMessage("");
    setIsTyping(true);

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send message to backend API with system prompt
      const token = localStorage.getItem("accessToken");
      const systemPrompt = await createSystemPrompt();

      console.log("🚀 Sending message with system prompt:", {
        sessionId,
        messageLength: messageText.length,
        systemPromptLength: systemPrompt.length,
        hasSystemPrompt: !!systemPrompt,
      });

      const response = await axios.post(
        `${API_URL}/v1/api/chat/message`,
        {
          sessionId: sessionId,
          message: messageText,
          systemPrompt: systemPrompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const responseTime = Date.now() - sendStart;
        console.log(`📊 Message sent and received in ${responseTime}ms (server: ${response.data.responseTime}ms)`);
        console.log(`🤖 Response source: ${response.data.source || 'internal'} using ${response.data.model || 'internal AI'}`);
        
        // Show success indicator for internal chatbot
        if (response.data.source === 'internal-gemini') {
          console.log(`✅ Internal Gemini chatbot responded successfully!`);
        }
        
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: "ai",
          timestamp: new Date(response.data.timestamp),
          typing: true,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Set suggestions if provided
        if (response.data.suggestions && response.data.suggestions.length > 0) {
          setCurrentSuggestions(response.data.suggestions);
          console.log(`💡 Received ${response.data.suggestions.length} contextual suggestions`);
        }

          // Note: Meal planner updates are handled by the Meal Planner UI and use dedicated
          // endpoints; we intentionally do not auto-fetch or react here to replacementResult
          // so the AI Chat and Meal Planner remain decoupled.

        // Show performance notification for fast responses
        if (responseTime < 1000) {
          console.log(`⚡ Lightning fast response: ${responseTime}ms total`);
        }

        // Simulate typing effect
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, typing: false } : msg
            )
          );
        }, 1500);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
        typing: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setCurrentSuggestions([]);
    inputRef.current?.focus();
  };

  const handleRecipeRequest = async () => {
    const newRecipeMode = !recipeMode;
    setRecipeMode(newRecipeMode);
    
    // Toggle recipe mode on backend
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
      const token = localStorage.getItem("accessToken");
      
      if (userId && token) {
        await axios.post(
          `${API_URL}/v1/api/chat/recipe/toggle-mode`,
          { userId, recipeMode: newRecipeMode },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Error toggling recipe mode:", error);
    }

    if (newRecipeMode) {
      // Recipe mode ON - Just show recipe suggestions, no auto-message
      console.log("🍳 Recipe mode activated");
      
      // Show recipe-specific suggestions
      setCurrentSuggestions([
        "🍳 Pasta recipes",
        "🥗 Healthy breakfast ideas", 
        "🍰 Easy dessert recipes",
        "🥤 Smoothie recipes"
      ]);
      
      // Optional: Clear input and focus for user to type their recipe request
      setInputMessage("");
    } else {
      // Recipe mode OFF - Just switch back to general suggestions
      console.log("🔄 Recipe mode deactivated");
      
      // Show general suggestions
      setCurrentSuggestions([
        "Help with my meal plan",
        "Fitness advice",
        "Nutrition guidance", 
        "Health tips"
      ]);
      
      // Clear input
      setInputMessage("");
    }
    
    inputRef.current?.focus();
  };

  const handleMealPlanMode = async () => {
    const newMealPlanMode = !mealPlanMode;
    setMealPlanMode(newMealPlanMode);
    
    // Toggle meal plan mode on backend (similar to recipe mode)
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
      const token = localStorage.getItem("accessToken");
      
      if (userId && token) {
        // You can create a specific endpoint for meal plan mode or use preferences
        const response = await axios.put(
          `${API_URL}/v1/api/users/preferences`,
          { mealPlanMode: newMealPlanMode },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Error toggling meal plan mode:", error);
    }

    if (newMealPlanMode) {
      // Meal Plan mode ON - Show meal management suggestions
      console.log("🍽️ Meal plan mode activated");
      
      // Show meal plan specific suggestions
      setCurrentSuggestions([
        "🍽️ Show my today's meals",
        "🔄 Change my breakfast", 
        "🥗 Make lunch healthier",
        "📅 Update dinner for Monday",
        "🍳 Replace meal I don't like",
        "📊 Show weekly meal calories"
      ]);
      
      // Clear input and focus for user to type their meal change request
      setInputMessage("");
    } else {
      // Meal Plan mode OFF - Switch back to general suggestions  
      console.log("🔄 Meal plan mode deactivated");
      
      // Show general suggestions
      setCurrentSuggestions([
        "Help with my meal plan",
        "Fitness advice",
        "Nutrition guidance", 
        "Health tips"
      ]);
      
      // Clear input
      setInputMessage("");
    }
    
    inputRef.current?.focus();
  };

  const refreshChat = () => {
    if (sessionId) {
      loadChatHistory(sessionId);
    }
  };

  const startNewSession = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!userId) {
      // Handle anonymous users
      const anonSessionId = `session_anonymous_${Date.now()}`;
      setSessionId(anonSessionId);
      setMessages([
        {
          id: "welcome",
          text: "Hello! I'm Aarav, your WellNest AI assistant. I'm here to help you with health advice, meal planning, fitness tips, and answer any wellness questions you might have. How can I assist you today?",
          sender: "ai",
          timestamp: new Date(),
          typing: false,
        },
      ]);
      setCurrentSuggestions([]);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${API_URL}/v1/api/chat/session/new`,
        {
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const newSessionId = response.data.sessionId;
        localStorage.setItem(`chatSessionId_${userId}`, newSessionId);
        setSessionId(newSessionId);

        // Send initial welcome message to AI with user context
        await sendInitialWelcomeMessage(newSessionId);
        setCurrentSuggestions([]);
      }
    } catch (error) {
      console.error("Error starting new session:", error);
      // Fallback to local session creation
      const fallbackSessionId = `session_${userId}_${Date.now()}`;
      localStorage.setItem(`chatSessionId_${userId}`, fallbackSessionId);
      setSessionId(fallbackSessionId);

      // Try to send welcome message even with fallback session
      await sendInitialWelcomeMessage(fallbackSessionId);
      setCurrentSuggestions([]);
    }
  };

  const defaultSuggestions = [
    "Show me my current meal plan details",
    "What meals am I having today?", 
    "Change my breakfast to something healthier",
    "I don't like my dinner today - replace it",
    "Make my lunch more protein-rich",
    "Replace my Monday breakfast with eggs",
    "Suggest healthy recipes based on my preferences",
    "What are the best exercises for my fitness level?",
    "Help me track my daily nutrition intake",
    "Tips for better sleep and recovery",
  ];

  // Create system prompt with user details
  const createSystemPrompt = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");

      console.log("🔍 CreateSystemPrompt - User from localStorage:", user);
      console.log("🔍 CreateSystemPrompt - Token exists:", !!token);

      if (!user?._id || !token) {
        console.log("⚠️ No user ID or token, using fallback prompt");
        return fallbackSystemPrompt(user);
      }

      // Fetch user context from backend and latest meal plan
      console.log("📡 Fetching user context for ID:", user._id);
      
      // Try to get both user context and latest meal plan
      const [userContextResponse, mealPlanResponse] = await Promise.allSettled([
  axios.get(`${API_URL}/v1/api/chat/user-context/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
  axios.get(`${API_URL}/v1/api/mealplan/latest/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      let userContext = null;
      let latestMealPlan = null;

      // Handle user context response
      if (userContextResponse.status === 'fulfilled' && userContextResponse.value.data.success) {
        userContext = userContextResponse.value.data.userContext;
        console.log("✅ User context received:", userContext);
      } else {
        console.log("⚠️ Failed to fetch user context:", userContextResponse.reason?.message);
      }

      // Handle meal plan response
      if (mealPlanResponse.status === 'fulfilled' && mealPlanResponse.value.data) {
        latestMealPlan = mealPlanResponse.value.data;
        console.log("✅ Latest meal plan received:", latestMealPlan);
      } else {
        console.log("⚠️ Failed to fetch meal plan:", mealPlanResponse.reason?.message);
      }

      // Use available data or fallback
      if (!userContext && !latestMealPlan) {
        console.log("⚠️ No user data available, using fallback prompt");
        return fallbackSystemPrompt(user);
      }

      // Create comprehensive system prompt with available user data
      let systemPrompt = `You are Aarav, a friendly and knowledgeable AI health assistant for WellNest. You are speaking with ${
        user?.username || "the user"
      }.

IMPORTANT: Always maintain a warm, encouraging, and supportive tone. You are not just providing information - you are a trusted health companion.

== USER PROFILE ==`;

      // Add user profile information if available
      if (userContext?.personalInfo) {
        systemPrompt += `
Name: ${userContext.personalInfo.username || user?.username || "Not specified"}
Email: ${userContext.personalInfo.email || user?.email || "Not specified"}
Gender: ${userContext.personalInfo.gender || "Not specified"}
Age: ${userContext.personalInfo.age || "Not specified"}
Height: ${userContext.personalInfo.height ? `${userContext.personalInfo.height} cm` : "Not specified"}
Current Weight: ${userContext.personalInfo.currentWeight ? `${userContext.personalInfo.currentWeight} kg` : "Not specified"}
Goal Weight: ${userContext.personalInfo.goalWeight ? `${userContext.personalInfo.goalWeight} kg` : "Not specified"}
Onboarding Status: ${userContext.personalInfo.isOnboardingComplete ? "Complete" : "Incomplete"}`;
      } else {
        systemPrompt += `
Name: ${user?.username || "Not specified"}
Email: ${user?.email || "Not specified"}
Profile information is being retrieved...`;
      }

      // Add health profile if available
      if (userContext?.healthProfile) {
        systemPrompt += `\n\n== HEALTH PROFILE ==
Food Allergies: ${userContext.healthProfile.foodAllergies?.length > 0 ? userContext.healthProfile.foodAllergies.join(", ") : "None specified"}
Dietary Preferences: ${Object.keys(userContext.healthProfile.preferences || {}).length > 0 ? JSON.stringify(userContext.healthProfile.preferences) : "None specified"}
User Role: ${userContext.healthProfile.role || "User"}`;
      }

      // Prioritize the latest meal plan from API, fallback to userContext meal plan
      const activeMealPlan = latestMealPlan || userContext?.currentMealPlan;
      
      if (activeMealPlan) {
        systemPrompt += `\n\n== CURRENT MEAL PLAN ==
Created: ${new Date(activeMealPlan.createdAt || Date.now()).toLocaleDateString()}
Weekly Plan:`;

        // Handle different meal plan formats
        const weeklyData = activeMealPlan.week || activeMealPlan.weeklyPlan || [];
        
        if (weeklyData.length > 0) {
          weeklyData.forEach((day) => {
            const dayName = day.day?.charAt(0).toUpperCase() + day.day?.slice(1) || "Unknown";
            
            // Handle different meal plan data structures
            let breakfast, lunch, dinner, calories = 0;
            
            if (day.breakfast?.dish) {
              // Format: { breakfast: { dish: "name", calories: 300 } }
              breakfast = day.breakfast.dish;
              lunch = day.lunch?.dish || "Not specified";
              dinner = day.dinner?.dish || "Not specified";
              calories = (day.breakfast.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0);
            } else {
              // Format: { breakfast: "dish name" }
              breakfast = day.breakfast || "Not specified";
              lunch = day.lunch || "Not specified";
              dinner = day.dinner || "Not specified";
              calories = day.totalCalories || "Not calculated";
            }

            systemPrompt += `\n${dayName}:
  • Breakfast: ${breakfast}
  • Lunch: ${lunch}
  • Dinner: ${dinner}
  • Total Calories: ${calories}`;
          });
        } else {
          systemPrompt += "\nMeal plan structure is being processed...";
        }
      } else {
        systemPrompt += `\n\n== CURRENT MEAL PLAN ==
No active meal plan found. User may need help creating or viewing their meal plan. Encourage them to generate a new meal plan if they ask about their meals.`;
      }

      systemPrompt += `\n\n== YOUR CAPABILITIES ==
- Personalized meal planning and nutrition advice based on user's profile
- Fitness routines and workout suggestions tailored to their goals
- Mental wellness and stress management tips
- Health tracking and goal setting guidance
- Healthy recipe recommendations considering their allergies and preferences
- General health and wellness support
- Help users view, understand, and modify their current meal plans

== GUIDELINES ==
- Use the user's personal information to provide highly personalized advice
- ALWAYS reference their current meal plan when they ask about their meals
- When discussing meal plans, be specific about each day's meals and calories
- Consider their allergies and preferences in all food recommendations
- Help them work towards their goal weight if specified
- Be conversational and personable, not clinical
- Provide practical, actionable advice based on their profile
- Ask follow-up questions to better understand their evolving needs
- Encourage healthy habits while being realistic about challenges
- If asked about serious medical conditions, recommend consulting healthcare professionals
- Keep responses helpful but concise
- Use emojis appropriately to make conversations engaging

Remember: You have detailed knowledge of this user's health profile and current meal plan. Use this information to provide the most relevant and personalized guidance possible.`;

      console.log("📝 Generated system prompt length:", systemPrompt.length);
      console.log("📝 System prompt preview:", systemPrompt.substring(0, 200) + "...");
      console.log("📊 Meal plan data available:", !!activeMealPlan);
      
      return systemPrompt;
    } catch (error) {
      console.error("❌ Error fetching user context:", error);
    }

    // Fallback to basic system prompt if context fetch fails
    return fallbackSystemPrompt(JSON.parse(localStorage.getItem("user")));
  };

  const fallbackSystemPrompt = (user) => {
    const userData = user
      ? {
          name: user.username || "User",
          email: user.email || "",
        }
      : {};

    return `You are Aarav, a friendly and knowledgeable AI health assistant for WellNest. 

User Information:
${userData.name ? `- Name: ${userData.name}` : "- Name: Not provided"}
${userData.email ? `- Email: ${userData.email}` : "- Email: Not provided"}

Your personality:
- Friendly, encouraging, and supportive
- Knowledgeable about nutrition, fitness, and wellness
- Always provide personalized advice when possible
- Use emojis appropriately to make conversations engaging
- Remember to ask follow-up questions to provide better assistance

Guidelines:
- Provide evidence-based health and nutrition advice
- Suggest meal plans, recipes, and fitness routines
- Help with wellness goals and habit tracking
- Be encouraging and motivational
- If you don't know something, be honest and suggest consulting professionals
- Always consider user's preferences and dietary restrictions

Remember: You're here to support ${
      userData.name || "the user"
    }'s wellness journey!`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="ai-chatbot-container pt-16">
      <DashNav />

      {/* Main Chat Container */}
      <div className="chat-wrapper">
        {/* Header */}
        <motion.div
          className={`chat-header ${recipeMode ? 'recipe-mode' : ''} ${mealPlanMode ? 'meal-plan-mode' : ''}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="chat-header-info">
            <div className="ai-avatar">
              <AssistantIcon />
            </div>
            <div className="ai-info">
              <h2>
                Hey{" "}
                {JSON.parse(localStorage.getItem("user"))?.username || "there"}!
              </h2>
              <p className="ai-status">
                <span className="online-indicator"></span>
                {recipeMode ? "🍳 Recipe Mode Active - Ask me for any recipe!" : 
                 mealPlanMode ? "🍽️ Meal Plan Mode Active - Modify your meals!" : 
                 "Aarav is online - Your personal health assistant"}
              </p>
            </div>
          </div>
          <div className="chat-actions">
            <button
              className="action-btn"
              onClick={refreshChat}
              title="Refresh Chat History"
            >
              <IoRefresh />
            </button>
            <button
              className="action-btn"
              onClick={startNewSession}
              title="Start New Chat"
            >
              <IoAdd />
            </button>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="messages-container">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading chat history...</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message-wrapper ${message.sender}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-content">
                    {message.sender === "ai" && (
                      <div className="message-avatar ai-avatar">
                        <AssistantIcon />
                      </div>
                    )}

                    <div
                      className={`message-bubble ${message.sender} ${
                        message.isTip ? "tip" : ""
                      } ${message.isWelcome ? "welcome" : ""}`}
                    >
                      {message.typing ? (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <>
                          {message.sender === "ai" ? (
                            <div className="markdown-content">
                              <ReactMarkdown>{message.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <p style={{ whiteSpace: "pre-line" }}>
                              {message.text}
                            </p>
                          )}
                          <div className="message-meta">
                            <span className="message-time">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sender === "ai" && !message.isTip && (
                              <div className="message-actions">
                                <button 
                                  className="meta-btn"
                                  onClick={() => copyToClipboard(message.text)}
                                  title="Copy message"
                                >
                                  <FaCopy />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {message.sender === "user" && (
                      <div className="message-avatar user-avatar">
                        <FaUser />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              className="message-wrapper ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="message-content">
                <div className="message-avatar ai-avatar">
                  <AssistantIcon />
                </div>
                <div className="message-bubble ai typing-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

                  {/* Quick Meal Actions */}
          {mealPlanMode && (
            <motion.div
              className="quick-meal-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="meal-action-buttons">
                <button 
                  className="meal-action-btn breakfast"
                  onClick={() => handleSuggestionClick("Show me my breakfast today")}
                >
                  🌅 Breakfast
                </button>
                <button 
                  className="meal-action-btn lunch"
                  onClick={() => handleSuggestionClick("Show me my lunch today")}
                >
                  ☀️ Lunch
                </button>
                <button 
                  className="meal-action-btn dinner"
                  onClick={() => handleSuggestionClick("Show me my dinner today")}
                >
                  🌙 Dinner
                </button>
                <button 
                  className="meal-action-btn change"
                  onClick={() => handleSuggestionClick("I want to change a meal")}
                >
                  🔄 Change
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Suggestions */}
        {(messages.length === 1 || currentSuggestions.length > 0) && (
          <motion.div
            className="quick-suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p>
              {messages.length === 1 ? "Quick suggestions:" : "Related topics:"}
            </p>
            <div className="suggestions-grid">
              {(currentSuggestions.length > 0
                ? currentSuggestions
                : defaultSuggestions
              ).map((suggestion, index) => (
                <motion.button
                  key={`${suggestion}-${index}`}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Container */}
        <motion.div
          className="input-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your health and wellness..."
              className="message-input"
              rows="1"
            />
            <div className="input-actions">
              <button
                className={`recipe-btn-input ${recipeMode ? 'recipe-active' : ''}`}
                onClick={handleRecipeRequest}
                title={recipeMode ? "Recipe Mode ON - Click to turn OFF" : "Recipe Mode OFF - Click to turn ON"}
              >
                <FaUtensils />
                {recipeMode && <span className="recipe-mode-indicator">🍳</span>}
              </button>
              <button
                className={`meal-plan-btn-input ${mealPlanMode ? 'meal-plan-active' : ''}`}
                onClick={handleMealPlanMode}
                title={mealPlanMode ? "Meal Plan Mode ON - Click to turn OFF" : "Meal Plan Mode OFF - Click to turn ON"}
              >
                <FaCalendarAlt />
                {mealPlanMode && <span className="meal-plan-mode-indicator">🍽️</span>}
              </button>
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
              >
                <IoSend />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIChatbot;
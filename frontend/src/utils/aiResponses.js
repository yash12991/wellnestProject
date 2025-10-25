// AI Response Utility for WellNest Health Assistant
export const getHealthAIResponse = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Health-specific responses based on keywords
  if (lowercaseMessage.includes('meal plan') || lowercaseMessage.includes('diet') || lowercaseMessage.includes('nutrition')) {
    return {
      text: "I'd be happy to help you create a personalized meal plan! 🍎 Based on your health goals, I can suggest balanced meals with proper macronutrients. Would you like me to focus on weight loss, muscle gain, or general wellness?",
      suggestions: [
        "Create a weight loss meal plan",
        "Suggest high-protein meals",
        "Plan meals for diabetics",
        "Vegetarian meal options"
      ]
    };
  }
  
  if (lowercaseMessage.includes('workout') || lowercaseMessage.includes('exercise') || lowercaseMessage.includes('fitness')) {
    return {
      text: "Great question about fitness! 💪 I can help you design a workout routine that fits your schedule and fitness level. Are you looking for cardio, strength training, or a balanced routine?",
      suggestions: [
        "Beginner workout routine",
        "30-minute HIIT workout",
        "Strength training plan",
        "Morning exercise routine"
      ]
    };
  }
  
  if (lowercaseMessage.includes('water') || lowercaseMessage.includes('hydration')) {
    return {
      text: "Staying hydrated is crucial for optimal health! 💧 The general recommendation is 8 glasses (64 oz) per day, but this can vary based on your activity level, climate, and body weight. I can help you track your water intake and set reminders.",
      suggestions: [
        "Set up water reminders",
        "Calculate my daily water needs",
        "Tips for drinking more water",
        "Signs of dehydration"
      ]
    };
  }
  
  if (lowercaseMessage.includes('sleep') || lowercaseMessage.includes('insomnia') || lowercaseMessage.includes('tired')) {
    return {
      text: "Quality sleep is fundamental to good health! 😴 Most adults need 7-9 hours of sleep per night. I can share tips for better sleep hygiene and help you establish a bedtime routine.",
      suggestions: [
        "Sleep hygiene tips",
        "Create a bedtime routine",
        "Natural sleep remedies",
        "Dealing with insomnia"
      ]
    };
  }
  
  if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('anxiety') || lowercaseMessage.includes('mental health')) {
    return {
      text: "Managing stress is vital for overall wellness! 🧘‍♀️ There are many effective techniques like meditation, deep breathing, and regular exercise. I can guide you through some stress-reduction strategies.",
      suggestions: [
        "Quick stress relief techniques",
        "Meditation for beginners",
        "Breathing exercises",
        "Work-life balance tips"
      ]
    };
  }
  
  if (lowercaseMessage.includes('weight') || lowercaseMessage.includes('lose') || lowercaseMessage.includes('gain')) {
    return {
      text: "Weight management is about creating sustainable healthy habits! ⚖️ Whether you want to lose, gain, or maintain weight, it's all about balancing calories in versus calories out, combined with proper nutrition and exercise.",
      suggestions: [
        "Healthy weight loss tips",
        "Calculate my BMI",
        "Portion control guide",
        "Sustainable eating habits"
      ]
    };
  }
  
  if (lowercaseMessage.includes('vitamin') || lowercaseMessage.includes('supplement') || lowercaseMessage.includes('nutrient')) {
    return {
      text: "Vitamins and nutrients are essential for optimal health! 💊 A balanced diet usually provides most nutrients, but sometimes supplements can help fill gaps. I can provide information about different vitamins and their benefits.",
      suggestions: [
        "Essential vitamins guide",
        "Do I need supplements?",
        "Vitamin D benefits",
        "Best food sources for nutrients"
      ]
    };
  }
  
  if (lowercaseMessage.includes('heart') || lowercaseMessage.includes('cardio') || lowercaseMessage.includes('blood pressure')) {
    return {
      text: "Heart health is crucial for longevity! ❤️ Regular cardiovascular exercise, a heart-healthy diet rich in omega-3s, and managing stress are key components of maintaining good heart health.",
      suggestions: [
        "Heart-healthy foods",
        "Cardio exercise benefits",
        "Lower blood pressure naturally",
        "Check heart rate zones"
      ]
    };
  }
  
  // General wellness responses
  const generalResponses = [
    {
      text: "That's a great question about your health! 🌟 I'm here to provide personalized wellness guidance. What specific aspect of your health would you like to focus on today?",
      suggestions: [
        "Improve my energy levels",
        "Better digestive health",
        "Boost immune system",
        "Healthy aging tips"
      ]
    },
    {
      text: "I love helping people on their wellness journey! 🚀 Whether it's nutrition, fitness, mental health, or lifestyle changes, I'm here to support you. What's your main health goal right now?",
      suggestions: [
        "Set health goals",
        "Track my progress",
        "Healthy recipe ideas",
        "Motivation tips"
      ]
    },
    {
      text: "Your health is your greatest wealth! 💚 I can help you with evidence-based advice on nutrition, exercise, sleep, stress management, and more. What would you like to explore?",
      suggestions: [
        "Daily health checklist",
        "Seasonal wellness tips",
        "Healthy habits to start",
        "Prevention strategies"
      ]
    }
  ];
  
  // Return a random general response if no specific keywords matched
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

export const healthTips = [
  "💡 Tip: Start your day with a glass of water to kickstart your metabolism!",
  "💡 Tip: Take a 2-minute breathing break every hour to reduce stress.",
  "💡 Tip: Add colorful vegetables to every meal for maximum nutrients.",
  "💡 Tip: Walk for 10 minutes after meals to aid digestion.",
  "💡 Tip: Get 15 minutes of sunlight daily for natural vitamin D.",
  "💡 Tip: Practice gratitude - it's scientifically proven to improve mental health!",
  "💡 Tip: Aim for 10,000 steps daily for cardiovascular health.",
  "💡 Tip: Include protein in every meal to maintain steady energy levels."
];

export const getRandomHealthTip = () => {
  return healthTips[Math.floor(Math.random() * healthTips.length)];
};
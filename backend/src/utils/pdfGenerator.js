import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Generate personalized tips based on meal plan analysis
const generatePersonalizedTips = (mealPlan, totalCalories) => {
  const avgDailyCalories = Math.round(totalCalories / 7);
  const meals = [];
  const ingredients = new Set();
  let proteinMeals = 0;
  let vegetarianMeals = 0;
  let highCalorieMeals = 0;
  
  // Analyze meal plan
  mealPlan.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = day[mealType];
      if (meal?.dish) {
        meals.push(meal);
        const dishLower = meal.dish.toLowerCase();
        
        // Extract ingredients and characteristics
        if (dishLower.includes('chicken') || dishLower.includes('fish') || dishLower.includes('salmon') || 
            dishLower.includes('turkey') || dishLower.includes('beef') || dishLower.includes('protein')) {
          proteinMeals++;
          ingredients.add('protein');
        }
        if (dishLower.includes('salad') || dishLower.includes('vegetable') || dishLower.includes('quinoa') ||
            dishLower.includes('avocado') || dishLower.includes('yogurt')) {
          vegetarianMeals++;
          ingredients.add('vegetables');
        }
        if (meal.calories > 500) {
          highCalorieMeals++;
        }
      }
    });
  });

  const tips = [];
  
  // Calorie-based tips
  if (avgDailyCalories < 1800) {
    tips.push({
      icon: "🎯",
      category: "Calorie Management",
      title: "Low Calorie Plan Detected",
      content: "Your plan averages " + avgDailyCalories + " calories/day. Consider adding healthy snacks like nuts, fruits, or protein bars between meals if you feel hungry."
    });
  } else if (avgDailyCalories > 2200) {
    tips.push({
      icon: "⚖️",
      category: "Portion Control",
      title: "Higher Calorie Plan",
      content: "With " + avgDailyCalories + " calories/day, focus on portion sizes and eating slowly to aid digestion. Consider spreading meals throughout the day."
    });
  }

  // Protein-based tips
  if (proteinMeals >= 10) {
    tips.push({
      icon: "💪",
      category: "Protein Rich Diet",
      title: "High Protein Focus",
      content: "Your plan includes plenty of protein sources. Stay hydrated (extra 2-3 glasses of water) and consider adding fiber-rich vegetables to aid protein digestion."
    });
  } else if (proteinMeals < 5) {
    tips.push({
      icon: "🥩",
      category: "Protein Balance",
      title: "Add More Protein",
      content: "Consider adding protein sources like eggs, legumes, or lean meats to your snacks for better muscle maintenance and satiety."
    });
  }

  // Vegetarian/healthy foods tips
  if (vegetarianMeals >= 8) {
    tips.push({
      icon: "🥗",
      category: "Plant-Based Nutrition",
      title: "Veggie-Rich Plan",
      content: "Great vegetable intake! Ensure you're getting vitamin B12, iron, and omega-3s. Consider a multivitamin if following a mostly plant-based diet."
    });
  }

  // High calorie meal tips
  if (highCalorieMeals >= 5) {
    tips.push({
      icon: "🍽️",
      category: "Meal Timing",
      title: "High-Calorie Meals",
      content: "You have several calorie-dense meals. Eat these earlier in the day when possible, and take a 10-minute walk after larger meals to aid digestion."
    });
  }

  // Meal prep tips based on complexity
  const complexMeals = meals.filter(meal => meal.recipe && meal.recipe.length > 50).length;
  if (complexMeals >= 5) {
    tips.push({
      icon: "👨‍🍳",
      category: "Meal Preparation",
      title: "Complex Recipes",
      content: "You have several detailed recipes. Consider meal prepping on weekends - cook proteins and grains in batches to save time during busy weekdays."
    });
  }

  // General wellness tips
  tips.push({
    icon: "💧",
    category: "Hydration",
    title: "Daily Water Intake",
    content: "Aim for 8-10 glasses of water daily. Start each meal with a glass of water and keep a water bottle nearby throughout the day."
  });

  tips.push({
    icon: "⏰",
    category: "Meal Timing",
    title: "Consistent Schedule",
    content: "Try to eat at the same times each day. This helps regulate your metabolism and reduces cravings between meals."
  });

  tips.push({
    icon: "🍎",
    category: "Healthy Snacking",
    title: "Smart Snack Choices",
    content: "If you need snacks, choose nuts, fruits, Greek yogurt, or vegetables with hummus. Avoid processed snacks that can derail your nutrition goals."
  });
  
  tips.push({
    icon: "🏃",
    category: "Physical Activity",
    title: "Move More Daily",
    content: "Pair your nutrition plan with at least 30 minutes of physical activity daily. Even a brisk walk can significantly improve your results and overall health."
  });
  
  tips.push({
    icon: "😴",
    category: "Sleep Quality",
    title: "Rest & Recovery",
    content: "Aim for 7-9 hours of quality sleep each night. Good sleep supports metabolism, reduces cravings, and helps your body recover from workouts."
  });
  
  tips.push({
    icon: "📊",
    category: "Progress Tracking",
    title: "Monitor Your Journey",
    content: "Take weekly measurements and photos to track progress. Focus on how you feel, not just the scale. Celebrate small wins along the way!"
  });

  return tips;
};

// Generate PDF content as HTML that can be converted to PDF
export const generateMealPlanHTML = (username, mealPlan) => {
  // Calculate total calories
  const totalCalories = mealPlan.reduce(
    (sum, day) =>
      sum +
      (day.breakfast?.calories || 0) +
      (day.lunch?.calories || 0) +
      (day.dinner?.calories || 0),
    0
  );

  // Generate personalized tips
  const personalizedTips = generatePersonalizedTips(mealPlan, totalCalories);

  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  const mealPlanRows = dayNames.map(dayName => {
    const dayData = mealPlan.find(d => d.day === dayName) || {};
    return `
      <tr>
        <td class="day-header">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</td>
        <td class="meal-cell">
          <div class="meal-card">
            <div class="meal-name">${dayData.breakfast?.dish || 'No meal planned'}</div>
            ${dayData.breakfast?.calories ? `<span class="calories">${dayData.breakfast.calories} kcal</span>` : ''}
            ${dayData.breakfast?.recipe ? `<div class="recipe">${dayData.breakfast.recipe}</div>` : ''}
          </div>
        </td>
        <td class="meal-cell">
          <div class="meal-card">
            <div class="meal-name">${dayData.lunch?.dish || 'No meal planned'}</div>
            ${dayData.lunch?.calories ? `<span class="calories">${dayData.lunch.calories} kcal</span>` : ''}
            ${dayData.lunch?.recipe ? `<div class="recipe">${dayData.lunch.recipe}</div>` : ''}
          </div>
        </td>
        <td class="meal-cell">
          <div class="meal-card">
            <div class="meal-name">${dayData.dinner?.dish || 'No meal planned'}</div>
            ${dayData.dinner?.calories ? `<span class="calories">${dayData.dinner.calories} kcal</span>` : ''}
            ${dayData.dinner?.recipe ? `<div class="recipe">${dayData.dinner.recipe}</div>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Weekly Meal Plan - ${username}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 0.5in;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          margin: 0;
          padding: 0;
          color: #1e293b;
          line-height: 1.6;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header Section */
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 30px 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        
        .logo {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin-bottom: 10px;
          text-shadow: 0 4px 12px rgba(0,0,0,0.15);
          letter-spacing: -1px;
          position: relative;
          z-index: 1;
        }
        
        .logo-icon {
          display: inline-block;
          font-size: 56px;
          margin-right: 8px;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .title { 
          font-size: 28px;
          color: white;
          margin: 10px 0;
          font-weight: 600;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .subtitle {
          color: rgba(255,255,255,0.95);
          font-size: 16px;
          margin-top: 8px;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        /* User Info Card */
        .user-info-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin: 20px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .info-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        
        .info-content {
          flex: 1;
        }
        
        .info-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        
        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border-color: #10b981;
        }
        
        .stat-icon {
          font-size: 40px;
          margin-bottom: 8px;
          display: block;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        /* Meal Plan Table */
        .meal-plan-section {
          margin: 32px 0;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .section-title::before {
          content: '';
          width: 4px;
          height: 32px;
          background: linear-gradient(180deg, #10b981 0%, #059669 100%);
          border-radius: 2px;
        }
        
        table { 
          width: 100%; 
          border-collapse: separate;
          border-spacing: 0;
          margin: 16px 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        th, td { 
          padding: 16px 14px;
          text-align: left; 
          vertical-align: top;
          border-bottom: 1px solid #e2e8f0;
        }
        
        th { 
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-weight: 700;
          color: #1e293b;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        tr:hover {
          background-color: #f8fafc;
        }
        
        .day-header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.5px;
          width: 15%;
          position: relative;
        }
        
        .day-header::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 60%;
          background: rgba(255,255,255,0.3);
        }
        
        .meal-cell {
          width: 28.33%;
          padding: 16px;
          background: white;
        }
        
        .meal-card {
          padding: 12px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border-radius: 8px;
          border: 1px solid #d1fae5;
          transition: all 0.2s ease;
        }
        
        .meal-card:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }
        
        .meal-name {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .calories { 
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 8px;
        }
        
        .recipe {
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }
        
        /* Tips Section */
        .tips-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin: 24px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border-left: 4px solid #3b82f6;
        }
        
        .tips-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          color: #1e293b;
          font-size: 20px;
          font-weight: 700;
        }
        
        .tips-section ul {
          margin: 0;
          padding-left: 24px;
          color: #475569;
        }
        
        .tips-section li {
          margin-bottom: 10px;
          font-size: 13px;
          line-height: 1.6;
        }
        
        .tips-section li::marker {
          color: #10b981;
          font-weight: bold;
        }
        
        /* Personalized Tips */
        .personalized-tips {
          margin-top: 24px;
        }
        
        .tip-item {
          background: white;
          border-left: 4px solid #10b981;
          margin-bottom: 16px;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }
        
        .tip-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
        }
        
        .tip-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .tip-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        
        .tip-category {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 700;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 12px;
        }
        
        .tip-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 8px 0;
        }
        
        .tip-content {
          font-size: 13px;
          color: #475569;
          line-height: 1.7;
        }
        
        /* Footer */
        .footer {
          margin-top: 40px;
          text-align: center;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 12px;
        }
        
        .footer-text {
          color: #64748b;
          font-size: 12px;
          line-height: 1.8;
        }
        
        .footer-copyright {
          margin-top: 12px;
          font-weight: 600;
          color: #475569;
          font-size: 11px;
        }
        
        /* Print Styles */
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            background: white;
          }
          .container {
            padding: 10px;
          }
          .header { 
            page-break-after: avoid;
            margin-bottom: 20px;
          }
          .meal-plan-section {
            page-break-inside: avoid;
          }
          table { 
            page-break-inside: avoid;
          }
          .tip-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🌱</span>WellNest
          </div>
          <div class="title">Your Personalized Weekly Meal Plan</div>
          <div class="subtitle">Scientifically crafted nutrition for optimal wellness</div>
        </div>
        
        <!-- User Info -->
        <div class="user-info-card">
          <div class="info-item">
            <span class="info-icon">👤</span>
            <div class="info-content">
              <div class="info-label">Prepared For</div>
              <div class="info-value">${username}</div>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📅</span>
            <div class="info-content">
              <div class="info-label">Generated On</div>
              <div class="info-value">${new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🔥</span>
            <div class="stat-value">${totalCalories.toLocaleString()}</div>
            <div class="stat-label">Weekly Calories</div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📊</span>
            <div class="stat-value">${Math.round(totalCalories / 7).toLocaleString()}</div>
            <div class="stat-label">Daily Average</div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🍽️</span>
            <div class="stat-value">21</div>
            <div class="stat-label">Total Meals</div>
          </div>
        </div>

        <!-- Meal Plan Section -->
        <div class="meal-plan-section">
          <h2 class="section-title">📅 Your Weekly Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>🌅 Breakfast</th>
                <th>☀️ Lunch</th>
                <th>🌙 Dinner</th>
              </tr>
            </thead>
            <tbody>
              ${mealPlanRows}
            </tbody>
          </table>
        </div>

        <!-- General Tips -->
        <div class="tips-section">
          <h3>💡 Essential Guidelines</h3>
          <ul>
            <li>💧 <strong>Stay Hydrated:</strong> Drink 8-10 glasses of water throughout the day for optimal metabolism</li>
            <li>⏰ <strong>Consistent Timing:</strong> Eat meals at regular intervals to regulate your body's metabolism</li>
            <li>🔄 <strong>Flexibility:</strong> Feel free to swap similar meals within the same category based on your preferences</li>
            <li>👂 <strong>Listen to Your Body:</strong> Adjust portion sizes based on your hunger levels and activity</li>
            <li>🥗 <strong>Meal Prep:</strong> Prepare ingredients in advance on weekends to save time during busy weekdays</li>
          </ul>
        </div>

        <!-- Personalized Tips -->
        ${personalizedTips.length > 0 ? `
        <div class="personalized-tips">
          <h2 class="section-title">🎯 Personalized Recommendations</h2>
          ${personalizedTips.map(tip => `
            <div class="tip-item">
              <div class="tip-header">
                <span class="tip-icon">${tip.icon}</span>
                <span class="tip-category">${tip.category}</span>
              </div>
              <div class="tip-title">${tip.title}</div>
              <div class="tip-content">${tip.content}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">🌱 WellNest</div>
          <div class="footer-text">
            This meal plan was generated by WellNest's AI-powered nutrition system<br>
            For support or questions, visit <strong>wellnest.sbs</strong><br>
            Consult with a healthcare professional before making significant dietary changes
          </div>
          <div class="footer-copyright">© 2025 WellNest. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create a temporary HTML file and return the path
export const createTempHTMLFile = (htmlContent, filename = 'mealplan') => {
  const tempDir = path.join(process.cwd(), 'temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, `${filename}_${Date.now()}.html`);
  fs.writeFileSync(filePath, htmlContent);
  
  return filePath;
};

// Generate simple text-based PDF as fallback
const generateSimplePDFContent = (username, mealPlan) => {
  const totalCalories = mealPlan.reduce(
    (sum, day) => sum + (day.breakfast?.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0), 0
  );
  
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  let content = `
WELLNEST - Weekly Meal Plan
===========================
Prepared for: ${username}
Generated on: ${new Date().toLocaleDateString()}
Total Weekly Calories: ${totalCalories} kcal

MEAL PLAN
=========

`;

  dayNames.forEach(dayName => {
    const dayData = mealPlan.find(d => d.day === dayName) || {};
    content += `${dayName.toUpperCase()}\n`;
    content += `${'='.repeat(dayName.length)}\n`;
    content += `Breakfast: ${dayData.breakfast?.dish || 'No meal planned'} (${dayData.breakfast?.calories || 0} kcal)\n`;
    content += `Lunch: ${dayData.lunch?.dish || 'No meal planned'} (${dayData.lunch?.calories || 0} kcal)\n`;
    content += `Dinner: ${dayData.dinner?.dish || 'No meal planned'} (${dayData.dinner?.calories || 0} kcal)\n\n`;
  });

  content += `
TIPS FOR SUCCESS
================
- Stay hydrated by drinking plenty of water throughout the day
- Try to eat meals at consistent times to regulate your metabolism  
- Feel free to swap similar meals within the same category if needed
- Listen to your body and adjust portions based on your hunger levels
- Prepare ingredients in advance to save time during busy weekdays

© 2025 WellNest. All rights reserved.
Generated by WellNest's AI nutrition system
  `;

  return content;
};

// Generate well-formatted document content 
const generateFormattedDocument = (username, mealPlan) => {
  const totalCalories = mealPlan.reduce(
    (sum, day) => sum + (day.breakfast?.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0), 0
  );
  
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  let content = `
╔══════════════════════════════════════════════════════════════════════════════════╗
║                           🌱 WELLNEST MEAL PLANNER 🌱                           ║
║                              Weekly Nutrition Guide                              ║
╚══════════════════════════════════════════════════════════════════════════════════╝

📋 MEAL PLAN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👤 Prepared for: ${username}
  📅 Generated on: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })}
  🔥 Total Weekly Calories: ${totalCalories.toLocaleString()} kcal
  ⚖️  Average Daily Calories: ${Math.round(totalCalories / 7).toLocaleString()} kcal

📅 YOUR WEEKLY MEAL SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  dayNames.forEach((dayName, index) => {
    const dayData = mealPlan.find(d => d.day === dayName) || {};
    const dayCalories = (dayData.breakfast?.calories || 0) + (dayData.lunch?.calories || 0) + (dayData.dinner?.calories || 0);
    
    content += `┌─ ${dayName.toUpperCase()} ─────────────────────────────── Daily Total: ${dayCalories} kcal ┐\n`;
    content += `│                                                                               │\n`;
    
    // Breakfast
    content += `│ 🌅 BREAKFAST                                                                 │\n`;
    content += `│   • ${(dayData.breakfast?.dish || 'No meal planned').padEnd(55)} │\n`;
    if (dayData.breakfast?.calories) {
      content += `│   • Calories: ${dayData.breakfast.calories} kcal                                        │\n`;
    }
    if (dayData.breakfast?.recipe && dayData.breakfast.recipe.length > 0) {
      const recipe = dayData.breakfast.recipe.substring(0, 60) + (dayData.breakfast.recipe.length > 60 ? '...' : '');
      content += `│   • Recipe: ${recipe.padEnd(62)} │\n`;
    }
    content += `│                                                                               │\n`;
    
    // Lunch
    content += `│ 🔥 LUNCH                                                                     │\n`;
    content += `│   • ${(dayData.lunch?.dish || 'No meal planned').padEnd(55)} │\n`;
    if (dayData.lunch?.calories) {
      content += `│   • Calories: ${dayData.lunch.calories} kcal                                           │\n`;
    }
    if (dayData.lunch?.recipe && dayData.lunch.recipe.length > 0) {
      const recipe = dayData.lunch.recipe.substring(0, 60) + (dayData.lunch.recipe.length > 60 ? '...' : '');
      content += `│   • Recipe: ${recipe.padEnd(62)} │\n`;
    }
    content += `│                                                                               │\n`;
    
    // Dinner
    content += `│ 🌙 DINNER                                                                    │\n`;
    content += `│   • ${(dayData.dinner?.dish || 'No meal planned').padEnd(55)} │\n`;
    if (dayData.dinner?.calories) {
      content += `│   • Calories: ${dayData.dinner.calories} kcal                                          │\n`;
    }
    if (dayData.dinner?.recipe && dayData.dinner.recipe.length > 0) {
      const recipe = dayData.dinner.recipe.substring(0, 60) + (dayData.dinner.recipe.length > 60 ? '...' : '');
      content += `│   • Recipe: ${recipe.padEnd(62)} │\n`;
    }
    
    if (index === dayNames.length - 1) {
      content += `└───────────────────────────────────────────────────────────────────────────────┘\n\n`;
    } else {
      content += `├───────────────────────────────────────────────────────────────────────────────┤\n`;
    }
  });

  content += `
💡 NUTRITION SUCCESS TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥤 HYDRATION
   • Drink 8-10 glasses of water daily (2-2.5 liters)
   • Start your day with a glass of water
   • Drink water 30 minutes before meals

⏰ TIMING
   • Eat meals at consistent times to regulate metabolism
   • Allow 3-4 hours between main meals
   • Have your last meal 2-3 hours before bedtime

🔄 FLEXIBILITY
   • Feel free to swap similar meals within the same category
   • Adjust portions based on your hunger and activity level
   • Listen to your body's signals

📝 MEAL PREP
   • Prepare ingredients in advance on weekends
   • Cook grains and proteins in batches
   • Pre-cut vegetables for quick meal assembly

🍎 SNACKING
   • Include healthy snacks between meals if needed
   • Choose fruits, nuts, or yogurt for energy boosts
   • Avoid processed snacks high in sugar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 SUPPORT & CONTACT
   🌐 Website: wellnest.com
   📧 Email: support@wellnest.com  
   💬 In-app chat available 24/7

   This meal plan was generated by WellNest's AI nutrition system,
   tailored specifically for your dietary needs and preferences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 WellNest Technologies. All rights reserved.
Generated on ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return content;
};

// Generate actual PDF using puppeteer
export const generateMealPlanPDF = async (username, mealPlan) => {
  let browser;
  try {
    console.log('Starting PDF generation for:', username);
    
    // Generate HTML content for PDF
    const htmlContent = generateMealPlanHTML(username, mealPlan);
    console.log('HTML content generated, length:', htmlContent.length);
    
    // Launch puppeteer browser with more options
    console.log('Launching puppeteer browser...');
    
    const puppeteerOptions = {
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-extensions',
        '--single-process',
        '--no-zygote'
      ],
      timeout: 30000
    };
    
    // Try multiple Chrome paths for Render deployment
    const possibleChromePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      '/opt/render/.cache/puppeteer/chrome/linux-141.0.7390.122/chrome-linux64/chrome',
      '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome'
    ];
    
    for (const chromePath of possibleChromePaths) {
      if (chromePath) {
        try {
          if (fs.existsSync(chromePath)) {
            puppeteerOptions.executablePath = chromePath;
            console.log('✅ Found Chrome at:', chromePath);
            break;
          }
        } catch (err) {
          // Path check failed, try next
        }
      }
    }
    
    if (puppeteerOptions.executablePath) {
      console.log('Using Chrome executable:', puppeteerOptions.executablePath);
    } else {
      console.log('⚠️  No Chrome path specified, using Puppeteer default');
    }
    
    browser = await puppeteer.launch(puppeteerOptions);
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Set HTML content with timeout
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    console.log('HTML content set');
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000
    });
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error generating PDF with puppeteer:', error.message);
    
    // Fallback: Generate formatted text document
    console.log('Using fallback document generation...');
    try {
      const documentContent = generateFormattedDocument(username, mealPlan);
      console.log('Fallback document generated, size:', documentContent.length);
      return Buffer.from(documentContent, 'utf8');
    } catch (fallbackError) {
      console.error('Error generating fallback document:', fallbackError);
      const simpleFallback = generateSimplePDFContent(username, mealPlan);
      return Buffer.from(simpleFallback, 'utf8');
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
};

// Clean up temporary files
export const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};
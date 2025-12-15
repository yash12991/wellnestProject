import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

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
      <style>
        @page {
          size: A4;
          margin: 0.75in;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #2d3748;
          line-height: 1.5;
          background: white;
        }
        
        .header {
          text-align: center;
          padding: 20px;
          border-bottom: 3px solid #10b981;
          margin-bottom: 20px;
        }
        
        .header h1 {
          font-size: 32px;
          color: #10b981;
          margin-bottom: 8px;
        }
        
        .header p {
          color: #64748b;
          font-size: 14px;
          margin: 4px 0;
        }
        
        .info-bar {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .info-item {
          text-align: center;
          flex: 1;
        }
        
        .info-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 20px;
          color: #10b981;
          font-weight: 700;
          margin-top: 4px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th {
          background: #10b981;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
        }
        
        td {
          padding: 12px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        .day-cell {
          background: #f0fdf4;
          font-weight: 600;
          color: #10b981;
          width: 12%;
        }
        
        .meal-name {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }
        
        .calories {
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .tips-page {
          margin-top: 40px;
        }
        
        .tips-header {
          text-align: center;
          padding: 20px;
          border-bottom: 3px solid #3b82f6;
          margin-bottom: 30px;
        }
        
        .tips-header h2 {
          font-size: 28px;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        
        .tips-section {
          margin-bottom: 30px;
        }
        
        .tips-section h3 {
          color: #2d3748;
          font-size: 20px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .tips-section ul {
          list-style: none;
          padding: 0;
        }
        
        .tips-section li {
          padding: 10px;
          margin-bottom: 10px;
          background: #f8fafc;
          border-left: 4px solid #10b981;
          border-radius: 4px;
        }
        
        .tip-item {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        
        .tip-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 16px;
        }
        
        .tip-category {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        
        .tip-content {
          color: #475569;
          line-height: 1.6;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        
        @media print {
          body { margin: 0; padding: 10px; }
          .page-break { page-break-before: always; }
          table { page-break-inside: avoid; }
          .tip-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <!-- Page 1: Meal Plan -->
      <div class="header">
        <h1>🌱 WellNest</h1>
        <p>Your Personalized Weekly Meal Plan</p>
      </div>

      <div class="info-bar">
        <div class="info-item">
          <div class="info-label">Prepared For</div>
          <div class="info-value" style="font-size: 16px; color: #2d3748;">${username}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date</div>
          <div class="info-value" style="font-size: 16px; color: #2d3748;">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Weekly Calories</div>
          <div class="info-value">${totalCalories.toLocaleString()}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Daily Average</div>
          <div class="info-value">${Math.round(totalCalories / 7).toLocaleString()}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>🌅 Breakfast</th>
            <th>🍽️ Lunch</th>
            <th>🌙 Dinner</th>
          </tr>
        </thead>
        <tbody>
          ${mealPlanRows}
        </tbody>
      </table>

      <div class="footer">
        Generated by WellNest AI Nutrition System | © 2025 WellNest | wellnest.sbs
      </div>

      <!-- Page 2: Tips & Recommendations -->
      <div class="page-break"></div>
      
      <div class="tips-page">
        <div class="tips-header">
          <h2>💡 Your Nutrition Guide</h2>
          <p>Tips & Recommendations</p>
        </div>

        <div class="tips-section">
          <h3>Essential Guidelines</h3>
          <ul>
            <li><strong>Stay Hydrated:</strong> Drink 8-10 glasses of water throughout the day for optimal metabolism and digestion.</li>
            <li><strong>Consistent Timing:</strong> Eat meals at regular intervals to regulate your body's metabolism and energy levels.</li>
            <li><strong>Portion Control:</strong> Listen to your body and adjust portion sizes based on your hunger levels and daily activity.</li>
            <li><strong>Meal Prep:</strong> Prepare ingredients in advance on weekends to save time during busy weekdays.</li>
            <li><strong>Flexibility:</strong> Feel free to swap similar meals within the same category based on your preferences.</li>
          </ul>
        </div>

        ${personalizedTips.length > 0 ? `
        <div class="tips-section">
          <h3>Personalized Recommendations</h3>
          ${personalizedTips.map(tip => `
            <div class="tip-item">
              <div class="tip-category">${tip.category}</div>
              <div class="tip-title">${tip.icon} ${tip.title}</div>
              <div class="tip-content">${tip.content}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="tips-section">
          <h3>Quick Tips</h3>
          <ul>
            <li><strong>Pre-workout:</strong> Eat a light snack with carbs and protein 30-60 minutes before exercise.</li>
            <li><strong>Post-workout:</strong> Consume protein within 30 minutes after exercise for muscle recovery.</li>
            <li><strong>Snacking:</strong> Choose fruits, nuts, or yogurt for healthy snacks between meals.</li>
            <li><strong>Sleep:</strong> Avoid heavy meals 2-3 hours before bedtime for better sleep quality.</li>
            <li><strong>Variety:</strong> Try to include different colors of fruits and vegetables for diverse nutrients.</li>
          </ul>
        </div>

        <div class="footer">
          For support, visit wellnest.sbs | Consult a healthcare professional before making significant dietary changes
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

// Generate actual PDF using PDFKit
export const generateMealPlanPDF = async (username, mealPlan) => {
  try {
    console.log('🎨 Starting PDF generation with PDFKit for:', username);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true
      });
      
      const chunks = [];
      
      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('✅ PDF generated successfully with PDFKit, size:', pdfBuffer.length);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Calculate total calories
      const totalCalories = mealPlan.reduce(
        (sum, day) =>
          sum +
          (day.breakfast?.calories || 0) +
          (day.lunch?.calories || 0) +
          (day.dinner?.calories || 0),
        0
      );
      
      const avgDailyCalories = Math.round(totalCalories / 7);
      
      // Helper function to add styled text
      const addTitle = (text, fontSize = 24, color = '#05d8a7') => {
        doc.fillColor(color).fontSize(fontSize).font('Helvetica-Bold').text(text, { align: 'center' });
      };
      
      const addSubtitle = (text, fontSize = 14, color = '#666666') => {
        doc.fillColor(color).fontSize(fontSize).font('Helvetica').text(text, { align: 'center' });
      };
      
      const addSectionTitle = (text, fontSize = 18, color = '#018940') => {
        doc.fillColor(color).fontSize(fontSize).font('Helvetica-Bold').text(text);
        doc.moveDown(0.5);
      };
      
      const addText = (text, fontSize = 11, color = '#333333') => {
        doc.fillColor(color).fontSize(fontSize).font('Helvetica').text(text);
      };
      
      // ============================================
      // PAGE 1: GUIDELINES & INTRODUCTION
      // ============================================
      
      // Header with solid green background
      doc.rect(0, 0, 612, 120).fill('#018940');
      
      // Main Title
      doc.fillColor('#ffffff').fontSize(42).font('Helvetica-Bold')
         .text('WellNest', 50, 30, { align: 'center' });
      
      doc.fontSize(16).fillColor('#e8f9f1').font('Helvetica')
         .text('Your Personalized Nutrition Journey', 50, 80, { align: 'center' });
      
      // User info box with clean design
      doc.roundedRect(70, 150, 455, 90, 8).fillAndStroke('#f8fffe', '#018940');
      
      doc.fillColor('#018940').fontSize(18).font('Helvetica-Bold')
         .text(`Welcome, ${username}!`, 90, 170);
      
      doc.fillColor('#666666').fontSize(11).font('Helvetica')
         .text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 90, 195);
      
      doc.fillColor('#018940').fontSize(11).font('Helvetica-Bold')
         .text(`Weekly Goal: ${totalCalories.toLocaleString()} kcal`, 90, 212);
      doc.fillColor('#666666').fontSize(10).font('Helvetica')
         .text(`Daily Average: ${avgDailyCalories.toLocaleString()} kcal/day`, 90, 227);
      
      // Guidelines Section Title
      doc.fillColor('#018940').fontSize(24).font('Helvetica-Bold')
         .text('How to Use Your Meal Plan', 70, 270);
      
      // Decorative line
      doc.strokeColor('#05d8a7').lineWidth(2)
         .moveTo(70, 300).lineTo(525, 300).stroke();
      
      // Guidelines with clean numbered design
      const guidelines = [
        {
          number: '1',
          title: 'Customize with AI Chat',
          text: 'Use our intelligent AI assistant to modify any meal instantly. Ask for substitutions, dietary adjustments, or recipe variations.'
        },
        {
          number: '2',
          title: 'Track & Monitor Progress',
          text: 'Log your meals in the app to track calories, macros, and nutrition. Get real-time insights and personalized recommendations.'
        },
        {
          number: '3',
          title: 'Flexible Meal Swaps',
          text: 'Don\'t like a meal? Swap it! Our AI suggests healthy alternatives that match your calorie targets seamlessly.'
        },
        {
          number: '4',
          title: 'Stay Hydrated',
          text: 'Drink 8-10 glasses of water daily. Set up hydration reminders on your WellNest dashboard to stay on track.'
        },
        {
          number: '5',
          title: 'Consistent Meal Timing',
          text: 'Eat at consistent times daily. Space meals 3-4 hours apart for better digestion and sustained energy levels.'
        },
        {
          number: '6',
          title: 'Review & Adapt Weekly',
          text: 'Check your progress dashboard weekly. Our AI learns from your patterns to continuously improve your meal plans.'
        }
      ];
      
      let yPos = 320;
      guidelines.forEach((guide, idx) => {
        // Alternating background colors
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fffe';
        
        doc.roundedRect(70, yPos, 455, 50, 5).fill(bgColor);
        
        // Number circle
        doc.circle(95, yPos + 25, 15).fillAndStroke('#018940', '#05d8a7');
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
           .text(guide.number, 90, yPos + 17);
        
        // Title
        doc.fillColor('#018940').fontSize(13).font('Helvetica-Bold')
           .text(guide.title, 125, yPos + 10, { width: 385 });
        
        // Description text
        doc.fillColor('#333333').fontSize(9).font('Helvetica')
           .text(guide.text, 125, yPos + 27, { width: 385, lineGap: 1 });
        
        yPos += 58;
      });
      
      // Dashboard CTA box
      doc.roundedRect(70, 685, 455, 70, 8).fillAndStroke('#e8f9f1', '#018940');
      
      doc.fillColor('#018940').fontSize(12).font('Helvetica-Bold')
         .text('Access Your Dashboard', 90, 700);
      
      doc.fillColor('#05d8a7').fontSize(14).font('Helvetica-Bold')
         .text('wellnest.sbs/dashboard', 90, 720, { 
           underline: true,
           link: 'https://wellnest.sbs/dashboard'
         });
      
      doc.fillColor('#666666').fontSize(9).font('Helvetica')
         .text('Customize meals, track nutrition, and chat with AI', 90, 738);
      
      // ============================================
      // PAGE 2: MEAL PLAN DETAILS
      // ============================================
      doc.addPage();
      
      // Page 2 Header
      doc.rect(0, 0, 612, 80).fill('#018940');
      doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
         .text('YOUR 7-DAY MEAL SCHEDULE', 50, 25, { align: 'center' });
      doc.fontSize(12).fillColor('#e8f9f1').font('Helvetica')
         .text(`${username} | Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 50, 55, { align: 'center' });
      
      doc.moveDown(4);
      
      // Summary box
      doc.roundedRect(70, 105, 455, 45, 5).fillAndStroke('#f8fffe', '#018940');
      doc.fillColor('#018940').fontSize(11).font('Helvetica-Bold')
         .text(`Total Weekly Calories: ${totalCalories.toLocaleString()} kcal`, 90, 118);
      doc.fillColor('#666666').fontSize(10).font('Helvetica')
         .text(`Average Daily: ${avgDailyCalories.toLocaleString()} kcal/day`, 90, 135);
      
      doc.moveDown(3);
      
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      dayNames.forEach((dayName, index) => {
        // Check if we need a new page
        if (doc.y > 680) {
          doc.addPage();
          doc.moveDown(2);
        }
        
        const dayData = mealPlan.find(d => d.day === dayName) || {};
        
        // Day Header with clean design
        doc.roundedRect(70, doc.y, 455, 25, 3).fill('#018940');
        doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold')
           .text(dayLabels[index].toUpperCase(), 85, doc.y - 18);
        doc.moveDown(1.3);
        
        // Meal formatting function
        const formatMeal = (meal, mealType, mealLabel) => {
          const mealY = doc.y;
          
          // Meal type label
          doc.fillColor('#018940').fontSize(10).font('Helvetica-Bold')
             .text(mealLabel, 85, mealY);
          
          if (!meal || (!meal.dish && !meal.calories)) {
            doc.fillColor('#999999').fontSize(9).font('Helvetica-Oblique')
               .text('No meal planned', 85, mealY + 14);
          } else {
            doc.fillColor('#333333').fontSize(10).font('Helvetica')
               .text(meal.dish || 'Meal planned', 85, mealY + 14, { width: 350 });
            if (meal.calories > 0) {
              doc.fillColor('#05d8a7').fontSize(9).font('Helvetica-Bold')
                 .text(`${meal.calories} kcal`, 450, mealY + 14);
            }
          }
          doc.moveDown(1.4);
        };
        
        formatMeal(dayData.breakfast, 'breakfast', 'BREAKFAST');
        formatMeal(dayData.lunch, 'lunch', 'LUNCH');
        formatMeal(dayData.dinner, 'dinner', 'DINNER');
        
        // Day Total
        const dayTotal = (dayData.breakfast?.calories || 0) + (dayData.lunch?.calories || 0) + (dayData.dinner?.calories || 0);
        if (dayTotal > 0) {
          doc.fillColor('#018940').fontSize(10).font('Helvetica-Bold')
             .text(`Daily Total: ${dayTotal} kcal`, 85, doc.y);
        }
        
        doc.moveDown(0.8);
        // Separator line
        doc.strokeColor('#e5e7eb').lineWidth(1)
           .moveTo(70, doc.y).lineTo(525, doc.y).stroke();
        doc.moveDown(0.8);
      });
      
      // New page for tips
      doc.addPage();
      
      // Personalized Tips Section Header
      doc.rect(0, 0, 612, 60).fill('#018940');
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
         .text('PERSONALIZED NUTRITION TIPS', 50, 20, { align: 'center' });
      
      doc.moveDown(3);
      
      const tips = generatePersonalizedTips(mealPlan, totalCalories);
      tips.forEach((tip, index) => {
        if (doc.y > 680) {
          doc.addPage();
          doc.moveDown(2);
        }
        
        // Tip box
        doc.roundedRect(70, doc.y, 455, 70, 5).fillAndStroke('#f8fffe', '#018940');
        
        // Category tag
        doc.fillColor('#05d8a7').fontSize(9).font('Helvetica-Bold')
           .text(tip.category, 85, doc.y - 60);
        
        // Title
        doc.fillColor('#018940').fontSize(12).font('Helvetica-Bold')
           .text(tip.title, 85, doc.y - 45);
        
        // Content
        doc.fillColor('#333333').fontSize(10).font('Helvetica')
           .text(tip.content, 85, doc.y - 28, { width: 425, align: 'left' });
        
        doc.moveDown(3.8);
      });
      
      // Guidelines already on Page 1 - removed duplicate
      
      // Footer with Dashboard Link
      doc.moveDown(2);
      doc.strokeColor('#e5e7eb').lineWidth(1)
         .moveTo(70, doc.y).lineTo(525, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Dashboard link
      doc.fillColor('#018940').fontSize(10).font('Helvetica-Bold')
         .text('Access Your Dashboard: ', 70, doc.y, { continued: true })
         .fillColor('#05d8a7').text('wellnest.sbs/dashboard', { 
           underline: true,
           link: 'https://wellnest.sbs/dashboard'
         });
      
      doc.moveDown(0.5);
      doc.fillColor('#999999').fontSize(9).font('Helvetica')
         .text('Customize meals, track nutrition, and chat with AI | support@wellnest.sbs', 70);
      doc.text('Generated by WellNest AI Nutrition System', 70);
      doc.text(`© ${new Date().getFullYear()} WellNest Technologies. All rights reserved.`, 70);
      
      // Finalize PDF
      doc.end();
    });
    
  } catch (error) {
    console.error('❌ Error generating PDF with PDFKit:', error.message);
    console.error('📋 Error details:', error);
    
    // Fallback: Generate formatted text document
    console.log('⚠️  Using fallback text document generation...');
    const documentContent = generateFormattedDocument(username, mealPlan);
    return Buffer.from(documentContent, 'utf8');
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
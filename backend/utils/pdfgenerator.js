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
          <div class="meal-name">${dayData.breakfast?.dish || 'No meal planned'}</div>
          ${dayData.breakfast?.calories ? `<div class="calories">${dayData.breakfast.calories} kcal</div>` : ''}
          ${dayData.breakfast?.recipe ? `<div class="recipe">${dayData.breakfast.recipe.substring(0, 100)}...</div>` : ''}
        </td>
        <td class="meal-cell">
          <div class="meal-name">${dayData.lunch?.dish || 'No meal planned'}</div>
          ${dayData.lunch?.calories ? `<div class="calories">${dayData.lunch.calories} kcal</div>` : ''}
          ${dayData.lunch?.recipe ? `<div class="recipe">${dayData.lunch.recipe.substring(0, 100)}...</div>` : ''}
        </td>
        <td class="meal-cell">
          <div class="meal-name">${dayData.dinner?.dish || 'No meal planned'}</div>
          ${dayData.dinner?.calories ? `<div class="calories">${dayData.dinner.calories} kcal</div>` : ''}
          ${dayData.dinner?.recipe ? `<div class="recipe">${dayData.dinner.recipe.substring(0, 100)}...</div>` : ''}
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
          margin: 0.4in;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0;
          padding: 15px;
          color: #333;
          line-height: 1.3;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 12px;
          border-bottom: 2px solid #10B981;
        }
        
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #10B981;
          margin-bottom: 6px;
        }
        
        .title { 
          font-size: 20px;
          color: #1f2937;
          margin: 6px 0 4px 0;
          font-weight: bold;
        }
        
        .subtitle {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 0;
        }
        
        .user-info {
          background-color: #f0fdf4;
          padding: 12px;
          border-radius: 6px;
          margin: 10px 0;
          border-left: 3px solid #10B981;
          font-size: 12px;
        }
        
        .calories-summary {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          color: #10B981;
          margin: 12px 0;
          padding: 8px;
          background-color: #f0fdf4;
          border-radius: 6px;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 8px 0 0 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        th, td { 
          border: 1px solid #e5e7eb; 
          padding: 8px 6px;
          text-align: left; 
          vertical-align: top;
        }
        
        th { 
          background-color: #f9fafb; 
          font-weight: bold;
          color: #374151;
          font-size: 12px;
          padding: 10px 6px;
        }
        
        .day-header { 
          background-color: #f3f4f6; 
          font-weight: bold;
          text-transform: capitalize;
          color: #1f2937;
          width: 15%;
        }
        
        .meal-cell {
          width: 28.33%;
          padding: 8px 6px;
        }
        
        .meal-name {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 3px;
          font-size: 11px;
        }
        
        .calories { 
          color: #10B981; 
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .recipe {
          color: #6b7280;
          font-size: 9px;
          font-style: italic;
          line-height: 1.2;
          margin-top: 2px;
        }
        
        .tips {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0 0 0;
          border-left: 3px solid #3b82f6;
        }
        
        .tips h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
        }
        
        .tips ul {
          margin: 0;
          padding-left: 16px;
          color: #374151;
        }
        
        .tips li {
          margin-bottom: 5px;
          font-size: 11px;
          line-height: 1.3;
        }
        
        .personalized-tips {
          margin-top: 15px;
        }
        
        .tip-item {
          background-color: #f8fafc;
          border-left: 3px solid #10b981;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 4px;
        }
        
        .tip-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .tip-icon {
          font-size: 16px;
          margin-right: 6px;
        }
        
        .tip-category {
          font-size: 9px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        .tip-title {
          font-size: 11px;
          font-weight: bold;
          color: #1f2937;
          margin: 2px 0;
        }
        
        .tip-content {
          font-size: 10px;
          color: #374151;
          line-height: 1.4;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 10px;
        }
        
        .generation-date {
          margin-top: 6px;
          font-weight: 600;
        }
        
        /* Compact print styles */
        @media print {
          body { 
            margin: 0; 
            padding: 10px;
          }
          .header { 
            page-break-after: avoid; 
            margin-bottom: 10px;
          }
          table { 
            page-break-inside: avoid;
            margin-top: 5px;
          }
          tr { 
            page-break-inside: avoid; 
          }
          .tips {
            margin-top: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🌱 WellNest</div>
        <div class="title">Weekly Meal Plan</div>
        <div class="subtitle">Personalized nutrition for your wellness journey</div>
      </div>
      
      <div class="user-info">
        <strong>Prepared for:</strong> ${username}<br>
        <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
      </div>
      
      <div class="calories-summary">
        Total Weekly Calories: ${totalCalories} kcal
      </div>

      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>🌅 Breakfast</th>
            <th>🔥 Lunch</th>
            <th>🌙 Dinner</th>
          </tr>
        </thead>
        <tbody>
          ${mealPlanRows}
        </tbody>
      </table>

      <div class="tips">
        <h3>💡 General Guidelines:</h3>
        <ul>
          <li>Stay hydrated by drinking plenty of water throughout the day</li>
          <li>Try to eat meals at consistent times to regulate your metabolism</li>
          <li>Feel free to swap similar meals within the same category if needed</li>
          <li>Listen to your body and adjust portions based on your hunger levels</li>
        </ul>
      </div>

      <div class="personalized-tips" style="margin-top: 20px; page-break-inside: avoid;">
        <h3>🎯 Personalized Tips for Your Meal Plan:</h3>
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

      <div class="footer">
        <div>This meal plan was generated by WellNest's AI nutrition system</div>
        <div>For support, visit wellnest.com or contact our nutrition team</div>
        <div class="generation-date">© 2025 WellNest. All rights reserved.</div>
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
      
      // Header with gradient effect (simulated with layered rectangles)
      doc.rect(0, 0, 612, 140).fill('#018940');
      doc.rect(0, 120, 612, 20).fillOpacity(0.7).fill('#05d8a7').fillOpacity(1);
      
      // Main Title
      doc.fillColor('#ffffff').fontSize(36).font('Helvetica-Bold')
         .text('WellNest', 50, 35, { align: 'center' });
      
      doc.fontSize(18).fillColor('#e8f9f1').font('Helvetica')
         .text('Your Personalized Nutrition Journey', 50, 75, { align: 'center' });
      
      doc.fontSize(12).fillColor('#ffffff').font('Helvetica')
         .text('AI-Powered Meal Planning & Customization', 50, 100, { align: 'center' });
      
      // User info box
      doc.moveDown(4);
      doc.roundedRect(50, 170, 495, 70, 8).fillAndStroke('#f0fdf4', '#018940');
      
      doc.fillColor('#018940').fontSize(16).font('Helvetica-Bold')
         .text(`👤 Welcome, ${username}!`, 70, 185);
      
      doc.fillColor('#666666').fontSize(11).font('Helvetica')
         .text(`📅 Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 70, 210);
      
      doc.text(`🔥 Weekly Goal: ${totalCalories.toLocaleString()} kcal | Daily Average: ${avgDailyCalories.toLocaleString()} kcal`, 70, 225);
      
      // Guidelines Section Title
      doc.moveDown(3);
      doc.fillColor('#018940').fontSize(22).font('Helvetica-Bold')
         .text('📋 How to Use Your Personalized Meal Plan', 50, 270);
      
      doc.moveDown(0.5);
      doc.strokeColor('#05d8a7').lineWidth(3)
         .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      
      doc.moveDown(1);
      
      // Guidelines with beautiful boxes
      const guidelines = [
        {
          icon: '🤖',
          title: 'Customize with AI Chat',
          text: 'Use our intelligent AI assistant to modify any meal instantly. Ask for substitutions, dietary adjustments, or recipe variations tailored to your preferences and allergies.'
        },
        {
          icon: '📱',
          title: 'Track & Monitor Progress',
          text: 'Log your meals in the app to track calories, macros, and nutrition. Get real-time insights and personalized recommendations based on your goals.'
        },
        {
          icon: '🔄',
          title: 'Flexible Meal Swaps',
          text: 'Don\'t like a meal? Swap it! Our AI suggests healthy alternatives that match your calorie targets and nutritional requirements seamlessly.'
        },
        {
          icon: '💧',
          title: 'Hydration Reminder',
          text: 'Drink 8-10 glasses of water daily. Set up hydration reminders on your WellNest dashboard to stay on track throughout the day.'
        },
        {
          icon: '⏰',
          title: 'Optimal Meal Timing',
          text: 'Eat at consistent times daily. Space meals 3-4 hours apart for better digestion and sustained energy levels throughout your day.'
        },
        {
          icon: '📊',
          title: 'Weekly Review & Adapt',
          text: 'Check your progress dashboard weekly. Our AI learns from your eating patterns and preferences to continuously improve your meal plans.'
        }
      ];
      
      let yPos = 320;
      guidelines.forEach((guide, idx) => {
        // Alternating colored boxes for visual appeal
        const bgColor = idx % 2 === 0 ? '#f0fdf4' : '#e8f9f1';
        const borderColor = idx % 2 === 0 ? '#05d8a7' : '#018940';
        
        doc.roundedRect(50, yPos, 495, 55, 5).fillAndStroke(bgColor, borderColor);
        
        // Icon circle
        doc.circle(75, yPos + 27, 18).fill('#018940');
        doc.fillColor('#ffffff').fontSize(18).text(guide.icon, 65, yPos + 16);
        
        // Title
        doc.fillColor('#018940').fontSize(13).font('Helvetica-Bold')
           .text(guide.title, 110, yPos + 12, { width: 420 });
        
        // Description text
        doc.fillColor('#333333').fontSize(9.5).font('Helvetica')
           .text(guide.text, 110, yPos + 28, { width: 420, lineGap: 2 });
        
        yPos += 63;
      });
      
      // Footer with dashboard link
      doc.fillColor('#018940').fontSize(11).font('Helvetica-Bold')
         .text('🌐 Access Your Dashboard:', 50, 730, { align: 'center' });
      
      doc.fillColor('#05d8a7').fontSize(13).font('Helvetica-Bold')
         .text('wellnest.sbs/dashboard', 50, 745, { 
           align: 'center',
           underline: true,
           link: 'https://wellnest.sbs/dashboard'
         });
      
      doc.fillColor('#666666').fontSize(9).font('Helvetica-Oblique')
         .text('Customize your meals, track nutrition, and chat with AI for instant adjustments', 50, 765, { 
           align: 'center',
           width: 495
         });
      
      // ============================================
      // PAGE 2: MEAL PLAN DETAILS
      // ============================================
      doc.addPage();
      
      // Page 2 Header
      addTitle('🍽️ YOUR 7-DAY MEAL SCHEDULE', 26, '#018940');
      doc.moveDown(0.5);
      addSubtitle('Personalized Nutrition for Your Wellness Journey', 12, '#05d8a7');
      doc.moveDown(2);
      
      // Meal Plan Table
      addSectionTitle('📋 YOUR 7-DAY MEAL SCHEDULE');
      doc.moveDown(0.5);
      
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      dayNames.forEach((dayName, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const dayData = mealPlan.find(d => d.day === dayName) || {};
        
        // Day Header
        doc.roundedRect(50, doc.y, 495, 30, 3).fill('#018940');
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
           .text(`${dayLabels[index].toUpperCase()}`, 60, doc.y - 22);
        doc.moveDown(1.5);
        
        // Breakfast
        const formatMeal = (meal, emoji, mealType) => {
          if (!meal || (!meal.dish && !meal.calories)) {
            doc.fillColor('#999999').fontSize(10).font('Helvetica-Oblique')
               .text(`${emoji} ${mealType}: No meal planned`, 60);
          } else {
            doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold')
               .text(`${emoji} ${mealType}:`, 60);
            doc.fillColor('#333333').fontSize(10).font('Helvetica')
               .text(`${meal.dish || 'Meal planned'}`, 60);
            if (meal.calories > 0) {
              doc.fillColor('#05d8a7').fontSize(9).font('Helvetica-Bold')
                 .text(`${meal.calories} kcal`, 60);
            }
          }
          doc.moveDown(0.3);
        };
        
        formatMeal(dayData.breakfast, '🌅', 'Breakfast');
        formatMeal(dayData.lunch, '🥗', 'Lunch');
        formatMeal(dayData.dinner, '🍽️', 'Dinner');
        
        // Day Total
        const dayTotal = (dayData.breakfast?.calories || 0) + (dayData.lunch?.calories || 0) + (dayData.dinner?.calories || 0);
        if (dayTotal > 0) {
          doc.fillColor('#018940').fontSize(10).font('Helvetica-Bold')
             .text(`Daily Total: ${dayTotal} kcal`, 60);
        }
        
        doc.moveDown(1);
        // Separator line
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
        doc.moveDown(0.5);
      });
      
      // New page for tips
      doc.addPage();
      
      // Personalized Tips Section
      addSectionTitle('💡 PERSONALIZED NUTRITION TIPS');
      doc.moveDown(0.5);
      
      const tips = generatePersonalizedTips(mealPlan, totalCalories);
      tips.forEach((tip, index) => {
        if (doc.y > 680) {
          doc.addPage();
        }
        
        doc.fillColor('#05d8a7').fontSize(12).font('Helvetica-Bold')
           .text(`${tip.icon} ${tip.title}`, 60);
        doc.fillColor('#666666').fontSize(9).font('Helvetica-Oblique')
           .text(tip.category, 60);
        doc.fillColor('#333333').fontSize(10).font('Helvetica')
           .text(tip.content, 60, doc.y, { width: 475, align: 'left' });
        doc.moveDown(1);
      });
      
      // Guidelines already on Page 1 - removed duplicate
      
      // Footer with Dashboard Link
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
      doc.moveDown(0.5);
      
      // Dashboard link
      doc.fillColor('#018940').fontSize(10).font('Helvetica-Bold')
         .text('🌐 Access Your Dashboard: ', { align: 'center', continued: true })
         .fillColor('#05d8a7').text('wellnest.sbs/dashboard', { 
           align: 'center',
           underline: true,
           link: 'https://wellnest.sbs/dashboard'
         });
      
      doc.moveDown(0.3);
      doc.fillColor('#999999').fontSize(9).font('Helvetica')
         .text('Customize meals, track nutrition, and chat with AI | 📧 support@wellnest.sbs', { align: 'center' });
      doc.text('Generated by WellNest AI Nutrition System', { align: 'center' });
      doc.text(`© ${new Date().getFullYear()} WellNest Technologies. All rights reserved.`, { align: 'center' });
      
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
import { generateMealPlanPDF } from './src/utils/pdfGenerator.js';
import fs from 'fs';

console.log('🧪 Testing PDFKit meal plan PDF generation...\n');

// Sample meal plan data
const sampleMealPlan = [
  {
    day: 'monday',
    breakfast: { dish: 'Oatmeal with Berries', calories: 350 },
    lunch: { dish: 'Grilled Chicken Salad', calories: 450 },
    dinner: { dish: 'Salmon with Quinoa', calories: 550 }
  },
  {
    day: 'tuesday',
    breakfast: { dish: 'Greek Yogurt Parfait', calories: 300 },
    lunch: { dish: 'Turkey Wrap', calories: 400 },
    dinner: { dish: 'Vegetable Stir-fry', calories: 500 }
  },
  {
    day: 'wednesday',
    breakfast: { dish: 'Scrambled Eggs with Toast', calories: 380 },
    lunch: { dish: 'Quinoa Bowl', calories: 420 },
    dinner: { dish: 'Chicken Curry', calories: 580 }
  },
  {
    day: 'thursday',
    breakfast: { dish: 'Smoothie Bowl', calories: 320 },
    lunch: { dish: 'Tuna Salad', calories: 380 },
    dinner: { dish: 'Beef Tacos', calories: 520 }
  },
  {
    day: 'friday',
    breakfast: { dish: 'Avocado Toast', calories: 340 },
    lunch: { dish: 'Chicken Caesar Salad', calories: 430 },
    dinner: { dish: 'Pasta Primavera', calories: 560 }
  },
  {
    day: 'saturday',
    breakfast: { dish: 'Pancakes with Fruit', calories: 400 },
    lunch: { dish: 'Veggie Burger', calories: 450 },
    dinner: { dish: 'Grilled Steak', calories: 600 }
  },
  {
    day: 'sunday',
    breakfast: { dish: 'French Toast', calories: 380 },
    lunch: { dish: 'Sushi Bowl', calories: 440 },
    dinner: { dish: 'Roasted Chicken', calories: 570 }
  }
];

(async () => {
  try {
    console.log('📝 Generating PDF for user: TestUser');
    const pdfBuffer = await generateMealPlanPDF('TestUser', sampleMealPlan);
    
    console.log('✅ PDF generated successfully!');
    console.log(`📊 PDF size: ${pdfBuffer.length} bytes`);
    
    // Save to file
    const outputPath = './test_pdfkit_mealplan.pdf';
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`📄 PDF saved to: ${outputPath}`);
    
    // Verify it's a valid PDF
    const pdfMagicBytes = [37, 80, 68, 70]; // %PDF
    const headerBytes = Array.from(pdfBuffer.subarray(0, 4));
    const isValidPDF = JSON.stringify(headerBytes) === JSON.stringify(pdfMagicBytes);
    
    if (isValidPDF) {
      console.log('✅ Generated file is a valid PDF');
    } else {
      console.log('⚠️  Warning: File may not be a valid PDF');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();

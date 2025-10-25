import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import { generateMealPlanPDF } from '../utils/pdfGenerator.js';

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"Wellnest Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Wellnest OTP – Verify Your Email",
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #05d8a7, #018940); padding: 20px; text-align: center;">
                    <img src="..../frontend/assets/wellnest-logo.png" alt="Wellnest Logo" style="height: 50px; margin-bottom: 10px;">
                    <h2 style="color: #fff; margin: 0; font-weight: 600;">Welcome to Wellnest!</h2>
                </div>
                <div style="padding: 30px; background-color: #fff; color: #333;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                    <p style="font-size: 15px; margin-bottom: 30px;">
                        Thank you for registering with <strong>Wellnest</strong>. Please verify your email address using the OTP below:
                    </p>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="display: inline-block; background: #f5f5f5; padding: 15px 40px; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #018940; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                        This OTP will expire in <strong>10 minutes</strong>.
                    </p>
                    <p style="font-size: 14px; color: #555;">
                        If you didn't create an account with Wellnest, you can safely ignore this email.
                    </p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://wellnest.com/login" style="background-color: #05d8a7; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
                            Go to Wellnest
                        </a>
                    </div>
                </div>
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p style="margin: 0;">This is an automated email, please do not reply.</p>
                    <p style="margin: 0;">&copy; 2025 Wellnest. All rights reserved.</p>
                </div>
            </div>
            `,
        });

        console.log("OTP Email sent: ", info.response);
        return true;
    } catch (error) {
        console.error("Email error:", error);
        return false;
    }
};


// Send meal plan email with PDF attachment
export const sendMealPlanEmail = async (email, username, mealPlan) => {
    try {
        // Generate PDF attachment
        const pdfBuffer = await generateMealPlanPDF(username, mealPlan);

        // Calculate total calories
        const totalCalories = mealPlan.reduce(
            (sum, day) =>
                sum +
                (day.breakfast?.calories || 0) +
                (day.lunch?.calories || 0) +
                (day.dinner?.calories || 0),
            0
        );

        // Generate meal plan table HTML
        const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        
        const mealPlanTable = dayNames.map(dayName => {
            const dayData = mealPlan.find(d => d.day === dayName) || {};
            
            // Helper function to format meal data with better empty state handling
            const formatMeal = (meal, defaultText = 'Rest Day - No meal planned') => {
                if (!meal || (!meal.dish && !meal.calories)) {
                    return `
                        <div style="color: #9ca3af; font-style: italic; padding: 8px 0;">
                            ${defaultText}
                        </div>
                    `;
                }
                
                const dish = meal.dish || 'Meal planned';
                const calories = meal.calories || 0;
                
                return `
                    <div style="margin-bottom: 8px;">
                        <strong style="color: #1f2937; font-size: 14px;">${dish}</strong>
                        ${calories > 0 ? `<br><span style="color: #059669; font-size: 12px; font-weight: 600;">${calories} kcal</span>` : ''}
                    </div>
                `;
            };
            
            return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 16px 12px; font-weight: 700; text-transform: capitalize; background-color: #f8fafc; color: #374151; border-right: 1px solid #e5e7eb; vertical-align: top; min-width: 80px;">
                        ${dayName}
                    </td>
                    <td style="padding: 16px 12px; border-left: 1px solid #e5e7eb; vertical-align: top; min-height: 60px;">
                        ${formatMeal(dayData.breakfast, '🌅 Light breakfast recommended')}
                    </td>
                    <td style="padding: 16px 12px; border-left: 1px solid #e5e7eb; vertical-align: top; min-height: 60px;">
                        ${formatMeal(dayData.lunch, '🥗 Healthy lunch options')}
                    </td>
                    <td style="padding: 16px 12px; border-left: 1px solid #e5e7eb; vertical-align: top; min-height: 60px;">
                        ${formatMeal(dayData.dinner, '🍽️ Nutritious dinner suggested')}
                    </td>
                </tr>
            `;
        }).join('');

        // Check if the buffer is a valid PDF by looking for PDF magic bytes
        const pdfMagicBytes = [37, 80, 68, 70]; // %PDF in ASCII
        const headerBytes = Array.from(pdfBuffer.subarray(0, 4));
        const isActualPDF = JSON.stringify(headerBytes) === JSON.stringify(pdfMagicBytes);
        const fileExtension = isActualPDF ? 'pdf' : 'txt';
        const contentType = isActualPDF ? 'application/pdf' : 'text/plain; charset=utf-8';
        
        console.log(`Generated ${isActualPDF ? 'PDF' : 'text document'} for ${username}, size: ${pdfBuffer.length} bytes`);

        const info = await transporter.sendMail({
            from: `"Wellnest Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `🍽️ Your Weekly Meal Plan from WellNest (${isActualPDF ? 'PDF' : 'Document'} Attached)`,
            attachments: [
                {
                    filename: `${username.replace(/[^a-zA-Z0-9]/g, '_')}_Weekly_Meal_Plan_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
                    content: pdfBuffer,
                    contentType: contentType
                }
            ],
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Weekly Meal Plan - WellNest</title>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #05d8a7, #018940); padding: 30px 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🍽️ Your Weekly Meal Plan</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 400;">Personalized nutrition for your wellness journey</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 40px 30px; background-color: #fff; color: #333; line-height: 1.6;">
                        <div style="margin-bottom: 30px;">
                            <p style="font-size: 18px; margin-bottom: 12px; color: #1f2937; font-weight: 600;">Hello ${username}! 👋</p>
                            <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563; line-height: 1.7;">
                                Your personalized weekly meal plan is ready! Each meal has been carefully selected by our nutrition AI to meet your dietary needs and taste preferences.
                            </p>
                        </div>
                        
                        <!-- PDF Attachment Notice -->
                        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);">
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                <span style="font-size: 24px; margin-right: 12px;">📎</span>
                                <strong style="color: #1e40af; font-size: 16px; font-weight: 700;">PDF Meal Plan Attached!</strong>
                            </div>
                            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                                Your complete meal plan is attached as a beautifully formatted PDF. Download it to your device for easy access, printing, and sharing with family or nutritionists!
                            </p>
                        </div>
                    
                        <!-- Weekly Stats -->
                        <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; border-left: 5px solid #10b981;">
                            <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 18px; font-weight: 700;">📊 Weekly Nutrition Summary</h3>
                            <div style="font-size: 28px; font-weight: 800; color: #10b981; margin: 8px 0;">${totalCalories.toLocaleString()} kcal</div>
                            <p style="margin: 0; color: #374151; font-size: 14px;">Average: ${Math.round(totalCalories / 7).toLocaleString()} kcal per day</p>
                        </div>

                        <!-- Meal Plan Table -->
                        <div style="margin: 30px 0;">
                            <h3 style="color: #1f2937; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">📅 Your 7-Day Meal Schedule</h3>
                            <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                <table style="width: 100%; border-collapse: collapse; background-color: white; min-width: 600px;">
                                    <thead>
                                        <tr style="background: linear-gradient(135deg, #f8fafc, #e2e8f0);">
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb; min-width: 80px;">Day</th>
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb; border-left: 1px solid #e5e7eb;">🌅 Breakfast</th>
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb; border-left: 1px solid #e5e7eb;">🥗 Lunch</th>
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb; border-left: 1px solid #e5e7eb;">�️ Dinner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${mealPlanTable}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Success Tips Section -->
                        <div style="margin: 40px 0 30px 0; background: linear-gradient(135deg, #fefbff, #f3e8ff); padding: 25px; border-radius: 12px; border-left: 5px solid #8b5cf6;">
                            <h4 style="margin: 0 0 18px 0; color: #6b21a8; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
                                <span style="margin-right: 8px;">💡</span> Tips for Success
                            </h4>
                            <div style="display: grid; gap: 12px;">
                                <div style="display: flex; align-items: flex-start; color: #374151; line-height: 1.6; font-size: 14px;">
                                    <span style="color: #10b981; font-weight: bold; margin-right: 8px; min-width: 20px;">💧</span>
                                    <span><strong>Stay Hydrated:</strong> Drink 8-10 glasses of water daily (2-2.5 liters)</span>
                                </div>
                                <div style="display: flex; align-items: flex-start; color: #374151; line-height: 1.6; font-size: 14px;">
                                    <span style="color: #f59e0b; font-weight: bold; margin-right: 8px; min-width: 20px;">⏰</span>
                                    <span><strong>Timing Matters:</strong> Eat meals at consistent times to regulate metabolism</span>
                                </div>
                                <div style="display: flex; align-items: flex-start; color: #374151; line-height: 1.6; font-size: 14px;">
                                    <span style="color: #3b82f6; font-weight: bold; margin-right: 8px; min-width: 20px;">🔄</span>
                                    <span><strong>Flexibility:</strong> Swap similar meals within categories as needed</span>
                                </div>
                                <div style="display: flex; align-items: flex-start; color: #374151; line-height: 1.6; font-size: 14px;">
                                    <span style="color: #ef4444; font-weight: bold; margin-right: 8px; min-width: 20px;">🎧</span>
                                    <span><strong>Listen to Your Body:</strong> Adjust portions based on hunger and activity level</span>
                                </div>
                            </div>
                        </div>

                        <!-- Call to Action -->
                        <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border-left: 5px solid #0ea5e9;">
                            <h4 style="margin: 0 0 12px 0; color: #0369a1; font-size: 18px; font-weight: 700;">🚀 Ready to Transform Your Health?</h4>
                            <p style="color: #374151; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
                                Track your progress, log meals, and get personalized recommendations in your WellNest dashboard.
                            </p>
                            <a href="https://wellnest.com/dashboard" style="background: linear-gradient(135deg, #05d8a7, #059669); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(5, 216, 167, 0.2); transition: all 0.2s;">
                                🎯 Open Dashboard
                            </a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <div style="margin-bottom: 15px;">
                            <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; font-weight: 600;">🌱 WellNest</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                                AI-powered nutrition planning for your wellness journey
                            </p>
                        </div>
                        <div style="border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 15px;">
                            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">
                                📅 Generated on ${new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })} at ${new Date().toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                This is an automated email. Please do not reply directly.
                            </p>
                            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 11px; font-weight: 600;">
                                © 2025 WellNest Technologies. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `,
        });

        console.log("Meal Plan Email sent: ", info.response);
        return true;
    } catch (error) {
        console.error("Email error:", error);
        return false;
    }
};

// test function
export const sendTestMail = async () => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "Yash129912@gmail.com", // test email
            subject: "Test OTP",
            text: "This is a test mail from Nodemailer + Gmail",
        });
        console.log(" Email sent: ", info.response);
    } catch (error) {
        console.error(" Email error:", error);
    }
};

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateMealPlanPDF } from '../utils/pdfGenerator.js';

// Environment variables should be loaded by the main application
dotenv.config();

// Email service configuration - can switch between 'gmail' or 'resend'
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail'; // Change to 'resend' when your account is reactivated

// Initialize email service based on configuration
let emailService = null;
let gmailUser = process.env.GMAIL_USER || 'yash129912@gmail.com';

try {
    if (EMAIL_SERVICE === 'gmail') {
        // Gmail configuration
        const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
        if (gmailAppPassword) {
            emailService = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: gmailUser,
                    pass: gmailAppPassword
                }
            });
            console.log("✅ Gmail email service initialized");
            console.log(`📧 Emails will be sent from: ${gmailUser}`);
            
            // Verify connection
            emailService.verify(function (error, success) {
                if (error) {
                    console.error("❌ Gmail verification failed:", error.message);
                } else {
                    console.log("✅ Gmail server is ready to send emails");
                }
            });
        } else {
            console.warn("⚠️  GMAIL_APP_PASSWORD is not set in environment variables");
            console.warn("📝 Set up Gmail App Password: https://myaccount.google.com/apppasswords");
        }
    } else if (EMAIL_SERVICE === 'resend') {
        // Resend configuration
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            emailService = new Resend(resendApiKey);
            console.log("✅ Resend email service initialized");
            console.log("📧 Emails will be sent from: onboarding@resend.dev");
        } else {
            console.warn("⚠️  RESEND_API_KEY is not set in environment variables");
            console.warn("📝 Get your API key from: https://resend.com/api-keys");
        }
    } else {
        console.error("❌ Invalid EMAIL_SERVICE value. Use 'gmail' or 'resend'");
    }
} catch (error) {
    console.error(`❌ Failed to initialize ${EMAIL_SERVICE}:`, error.message);
    console.warn("⚠️  Email functionality will be limited");
}

// Generate OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email - works with both Gmail and Resend
export const sendOTPEmail = async (email, otp) => {
    try {
        if (!emailService) {
            console.error("❌ Email service is not initialized.");
            throw new Error("Email service is not configured. Please contact support.");
        }

        console.log(`📧 Attempting to send OTP email to: ${email} via ${EMAIL_SERVICE}`);

        const emailContent = {
            subject: "Verify Your Email - WellNest OTP Code",
            text: `Welcome to WellNest!

Hi there,

Thank you for registering with WellNest. Please verify your email address using the OTP below:

Your OTP Code: ${otp}

This OTP will expire in 10 minutes.

If you didn't create an account with WellNest, you can safely ignore this email.

Best regards,
The WellNest Team

---
This is an automated email, please do not reply.
© 2025 WellNest. All rights reserved.`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email - WellNest</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(90deg, #05d8a7, #018940); padding: 20px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: 600;">Welcome to WellNest!</h2>
                </div>
                <div style="padding: 30px; background-color: #fff; color: #333;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                    <p style="font-size: 15px; margin-bottom: 30px; line-height: 1.6;">
                        Thank you for registering with <strong>WellNest</strong>. Please verify your email address using the One-Time Password (OTP) below:
                    </p>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background: #f5f5f5; padding: 15px 40px; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #018940; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            ${otp}
                        </div>
                    </div>
                    <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                        This OTP will expire in <strong>10 minutes</strong>.
                    </p>
                    <p style="font-size: 14px; color: #555; line-height: 1.6;">
                        If you didn't create an account with WellNest, you can safely ignore this email.
                    </p>
                </div>
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p style="margin: 5px 0;">This is an automated email, please do not reply.</p>
                    <p style="margin: 5px 0;">&copy; 2025 WellNest. All rights reserved.</p>
                </div>
            </div>
            </body>
            </html>
            `,
        };

        if (EMAIL_SERVICE === 'gmail') {
            // Send via Gmail
            const mailOptions = {
                from: `"WellNest" <${gmailUser}>`,
                to: email,
                ...emailContent
            };
            const info = await emailService.sendMail(mailOptions);
            console.log("✅ OTP Email sent successfully via Gmail:", info.messageId);
        } else if (EMAIL_SERVICE === 'resend') {
            // Send via Resend
            const { data, error } = await emailService.emails.send({
                from: 'WellNest <onboarding@resend.dev>',
                to: email,
                ...emailContent
            });
            if (error) {
                console.error("❌ Resend API Error:", error);
                throw error;
            }
            console.log("✅ OTP Email sent successfully via Resend:", data.id);
        }

        return true;
    } catch (error) {
        console.error("❌ Failed to send OTP email:", error.message);
        console.error("📋 Error details:", error);
        return false;
    }
};

// Send meal plan email with PDF attachment
export const sendMealPlanEmail = async (email, username, mealPlan) => {
    try {
        if (!emailService) {
            console.error("❌ Email service is not initialized.");
            throw new Error("Email service is not configured. Please contact support.");
        }

        console.log(`📧 Attempting to send meal plan email to: ${email} via ${EMAIL_SERVICE}`);
        
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

        const pdfMagicBytes = [37, 80, 68, 70];
        const headerBytes = Array.from(pdfBuffer.subarray(0, 4));
        const isActualPDF = JSON.stringify(headerBytes) === JSON.stringify(pdfMagicBytes);
        const fileExtension = isActualPDF ? 'pdf' : 'txt';
        const contentType = isActualPDF ? 'application/pdf' : 'text/plain; charset=utf-8';
        
        console.log(`Generated ${isActualPDF ? 'PDF' : 'text document'} for ${username}, size: ${pdfBuffer.length} bytes`);

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Weekly Meal Plan - WellNest</title>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <div style="background: linear-gradient(135deg, #05d8a7, #018940); padding: 30px 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🍽️ Your Weekly Meal Plan</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 400;">Personalized nutrition for your wellness journey</p>
                    </div>
                    <div style="padding: 40px 30px; background-color: #fff; color: #333; line-height: 1.6;">
                        <div style="margin-bottom: 30px;">
                            <p style="font-size: 18px; margin-bottom: 12px; color: #1f2937; font-weight: 600;">Hello ${username}! 👋</p>
                            <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563; line-height: 1.7;">
                                Your personalized weekly meal plan is ready! Each meal has been carefully selected by our nutrition AI to meet your dietary needs and taste preferences.
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; border-left: 5px solid #10b981;">
                            <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 18px; font-weight: 700;">📊 Weekly Nutrition Summary</h3>
                            <div style="font-size: 28px; font-weight: 800; color: #10b981; margin: 8px 0;">${totalCalories.toLocaleString()} kcal</div>
                            <p style="margin: 0; color: #374151; font-size: 14px;">Average: ${Math.round(totalCalories / 7).toLocaleString()} kcal per day</p>
                        </div>
                        <div style="margin: 30px 0;">
                            <h3 style="color: #1f2937; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">📅 Your 7-Day Meal Schedule</h3>
                            <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                <table style="width: 100%; border-collapse: collapse; background-color: white; min-width: 600px;">
                                    <thead>
                                        <tr style="background: linear-gradient(135deg, #f8fafc, #e2e8f0);">
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb;">Day</th>
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb;">🌅 Breakfast</th>
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb;">🥗 Lunch</th>
                                            <th style="padding: 18px 12px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb;">🍽️ Dinner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${mealPlanTable}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600;">
                            © 2025 WellNest Technologies. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `;

        if (EMAIL_SERVICE === 'gmail') {
            // Send via Gmail
            const mailOptions = {
                from: `"WellNest" <${gmailUser}>`,
                to: email,
                subject: `Your Weekly Meal Plan from WellNest`,
                attachments: [
                    {
                        filename: `${username.replace(/[^a-zA-Z0-9]/g, '_')}_Weekly_Meal_Plan_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
                        content: pdfBuffer,
                        contentType: contentType
                    }
                ],
                html: htmlContent
            };
            const info = await emailService.sendMail(mailOptions);
            console.log("✅ Meal Plan Email sent successfully via Gmail:", info.messageId);
        } else if (EMAIL_SERVICE === 'resend') {
            // Send via Resend
            const { data, error } = await emailService.emails.send({
                from: 'WellNest <onboarding@resend.dev>',
                to: email,
                subject: `Your Weekly Meal Plan from WellNest`,
                attachments: [
                    {
                        filename: `${username.replace(/[^a-zA-Z0-9]/g, '_')}_Weekly_Meal_Plan_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
                        content: pdfBuffer,
                    }
                ],
                html: htmlContent,
            });
            if (error) {
                console.error("❌ Resend API Error:", error);
                throw error;
            }
            console.log("✅ Meal Plan Email sent successfully via Resend:", data.id);
        }

        return true;
    } catch (error) {
        console.error("❌ Failed to send meal plan email:", error.message);
        console.error("📋 Error details:", error);
        return false;
    }
};

// Test function
export const sendTestMail = async () => {
    try {
        if (!emailService) {
            console.error("❌ Email service is not initialized.");
            return false;
        }

        if (EMAIL_SERVICE === 'gmail') {
            const mailOptions = {
                from: `"WellNest" <${gmailUser}>`,
                to: "yash129912@gmail.com",
                subject: "Test Email from WellNest",
                html: `<p>This is a test email from <strong>WellNest</strong> using Gmail! ✅</p>`,
            };
            const info = await emailService.sendMail(mailOptions);
            console.log("✅ Email sent via Gmail:", info.messageId);
        } else if (EMAIL_SERVICE === 'resend') {
            const { data, error } = await emailService.emails.send({
                from: 'WellNest <onboarding@resend.dev>',
                to: "yash129912@gmail.com",
                subject: "Test Email from WellNest",
                html: "<p>This is a test email from <strong>WellNest</strong> using Resend! ✅</p>",
            });
            if (error) {
                console.error("❌ Email error:", error);
                return false;
            }
            console.log("✅ Email sent via Resend:", data.id);
        }

        return true;
    } catch (error) {
        console.error("❌ Email error:", error);
        return false;
    }
};

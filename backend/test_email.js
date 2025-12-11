import dotenv from 'dotenv';
import { sendTestMail, sendOTPEmail } from './src/config/email.js';

// Load environment variables
dotenv.config();

console.log('=================================');
console.log('📧 WellNest Email Test Script');
console.log('=================================\n');

console.log('Environment Variables:');
console.log(`GMAIL_USER: ${process.env.GMAIL_USER || 'yash129912@gmail.com'}`);
console.log(`GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not Set'}\n`);

async function testEmails() {
    try {
        console.log('Testing email functionality...\n');

        // Test 1: Simple test email
        console.log('Test 1: Sending simple test email...');
        const testResult = await sendTestMail();
        if (testResult) {
            console.log('✅ Test email sent successfully!\n');
        } else {
            console.log('❌ Failed to send test email\n');
        }

        // Test 2: OTP email
        console.log('Test 2: Sending OTP email...');
        const testOTP = '123456';
        const otpResult = await sendOTPEmail('yash129912@gmail.com', testOTP);
        if (otpResult) {
            console.log(`✅ OTP email sent successfully! (OTP: ${testOTP})\n`);
        } else {
            console.log('❌ Failed to send OTP email\n');
        }

        console.log('=================================');
        console.log('Email tests completed!');
        console.log('Check your inbox at: yash129912@gmail.com');
        console.log('=================================');

    } catch (error) {
        console.error('❌ Error during email tests:', error.message);
        console.error('Full error:', error);
    }
}

// Run tests
testEmails();

// Test script to verify environment variables are loaded correctly
import 'dotenv/config';

console.log('\n🔍 Environment Variables Check:\n');

const requiredVars = [
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY',
  'MONGO_URI',
  'FRONTEND_URL',
  'GOOGLE_CALLBACK_URL',
  'EMAIL_USER',
  'EMAIL_PASS',
  'ACCESS_TOKEN_SECRET',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const isSet = !!process.env[varName];
  const status = isSet ? '✓ SET' : '✗ MISSING';
  console.log(`${varName}: ${status}`);
  
  if (!isSet) {
    allPresent = false;
  }
});

console.log('\n📍 Key Values (first 20 chars):');
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`GOOGLE_CALLBACK_URL: ${process.env.GOOGLE_CALLBACK_URL}`);
console.log(`GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY?.substring(0, 20)}...`);

if (allPresent) {
  console.log('\n✅ All required environment variables are set!\n');
  process.exit(0);
} else {
  console.log('\n❌ Some environment variables are missing!\n');
  process.exit(1);
}

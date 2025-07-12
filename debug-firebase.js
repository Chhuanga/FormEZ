// Firebase Configuration Debug Script
// Run this in your browser console to check Firebase configuration

console.log('🔍 Firebase Configuration Debug');
console.log('================================');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('📋 Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  if (value) {
    console.log(`  Value: ${value.substring(0, 20)}...`);
  }
});

// Check if Firebase is initialized
console.log('\n🔧 Firebase Initialization:');
try {
  if (typeof window !== 'undefined' && window.firebase) {
    console.log('✅ Firebase SDK loaded');
    console.log('🔥 Firebase apps:', window.firebase.apps?.length || 0);
  } else {
    console.log('❌ Firebase SDK not found');
  }
} catch (e) {
  console.log('❌ Firebase check failed:', e.message);
}

// Check auth configuration
console.log('\n🔐 Auth Configuration:');
try {
  const auth = window.firebase?.auth();
  if (auth) {
    console.log('✅ Auth initialized');
    console.log('📧 Current user:', auth.currentUser?.email || 'None');
  } else {
    console.log('❌ Auth not initialized');
  }
} catch (e) {
  console.log('❌ Auth check failed:', e.message);
}

console.log('\n🏗️ Troubleshooting Steps:');
console.log('1. Check your .env file has all required variables');
console.log('2. Verify your Firebase project settings');
console.log('3. Ensure Google auth is enabled in Firebase Console');
console.log('4. Add your domain to authorized domains');
console.log('5. Check Google Cloud Console OAuth settings'); 
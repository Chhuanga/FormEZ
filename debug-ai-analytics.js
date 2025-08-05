const axios = require('axios');

async function testAIAnalytics() {
  try {
    console.log('🧠 Testing AI Analytics Summary...');
    
    // Test API endpoint - replace with actual form ID from your database
    const formId = 'cm0a8j83f0002b6hgflqntvpv'; // You'll need to replace this with an actual form ID
    
    const response = await axios.get(`http://localhost:3001/forms/${formId}/submissions/analytics/ai-summary`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token if needed
      }
    });
    
    console.log('🤖 AI Analytics Response:');
    console.log('Generated At:', response.data.generatedAt);
    console.log('Form ID:', response.data.formId);
    console.log('\n📊 AI Summary:');
    console.log('='.repeat(50));
    console.log(response.data.summary);
    console.log('='.repeat(50));
    
    // Check if response contains common markdown formatting issues
    const hasMarkdown = response.data.summary.includes('**') || response.data.summary.includes('*');
    if (hasMarkdown) {
      console.log('\n⚠️ Warning: Response still contains markdown formatting');
    } else {
      console.log('\n✅ Response is clean of markdown formatting');
    }
    
  } catch (error) {
    console.error('❌ Error testing AI analytics:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Also test the regular analytics to make sure AI service doesn't break existing functionality
async function testRegularAnalytics() {
  try {
    console.log('\n📈 Testing Regular Analytics (to ensure compatibility)...');
    
    const formId = 'cm0a8j83f0002b6hgflqntvpv';
    
    const response = await axios.get(`http://localhost:3001/forms/${formId}/submissions/analytics`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ Regular analytics still working');
    console.log('Total submissions:', response.data.submissionTrend?.reduce((sum, day) => sum + day.count, 0) || 0);
    
  } catch (error) {
    console.error('❌ Error testing regular analytics:', error.message);
  }
}

async function runTests() {
  await testRegularAnalytics();
  await testAIAnalytics();
}

runTests();

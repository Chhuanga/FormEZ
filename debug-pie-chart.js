const axios = require('axios');

async function testPieChartFix() {
  try {
    console.log('🔍 Testing Pie Chart Fix...');
    
    // Test API endpoint - replace with actual form ID from your database
    const formId = 'cm0a8j83f0002b6hgflqntvpv'; // You'll need to replace this with an actual form ID
    
    const response = await axios.get(`http://localhost:3001/forms/${formId}/submissions/analytics`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token if needed
      }
    });
    
    console.log('📊 Analytics Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if choice field analytics have proper data
    const choiceFields = response.data.fieldAnalytics?.filter(field => 
      ['RadioGroup', 'Select', 'Checkbox'].includes(field.type)
    );
    
    if (choiceFields && choiceFields.length > 0) {
      console.log('\n✅ Choice Fields Found:');
      choiceFields.forEach(field => {
        console.log(`📋 ${field.label} (${field.type}):`);
        field.options.forEach(option => {
          console.log(`   • ${option.option}: ${option.count} submissions`);
        });
      });
    } else {
      console.log('⚠️ No choice fields found in analytics');
    }
    
  } catch (error) {
    console.error('❌ Error testing pie chart fix:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPieChartFix();

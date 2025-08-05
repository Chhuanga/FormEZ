// Debug script to check form field structure
// Run this in browser console when saving fails

console.log('=== DEBUGGING FORM SAVE ===');

// Get the current form state
const formStore = window.__formStore || {}; // If you expose the store for debugging

// Or manually check what's being sent
const checkFormField = (field) => {
  console.log('Field structure:', field);
  console.log('Field keys:', Object.keys(field));
  
  if (field.required !== undefined) {
    console.error('❌ FOUND ISSUE: Field has direct "required" property:', field.required);
    console.error('This should be inside validation object instead');
  }
  
  if (field.validation) {
    console.log('✅ Validation object exists:', field.validation);
    if (field.validation.required !== undefined) {
      console.log('✅ Required property in validation:', field.validation.required);
    }
  } else {
    console.log('⚠️ No validation object found');
  }
};

// Example usage:
// If you have access to the fields array
// fields.forEach(checkFormField);

console.log('Add this to your form save function to debug:');
console.log(`
const body = {
  title: formTitle,
  fields: fields,
  theme: theme,
  formSettings: formSettings,
  postSubmissionSettings: postSubmissionSettings,
};

// Add this debug before sending:
console.log('=== FORM SAVE DEBUG ===');
console.log('Full body:', JSON.stringify(body, null, 2));
body.fields.forEach((field, index) => {
  console.log(\`Field \${index}:\`, field);
  if (field.required !== undefined) {
    console.error('❌ Field has direct required property:', field);
  }
});
`);

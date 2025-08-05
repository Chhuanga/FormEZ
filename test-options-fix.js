// Test script to verify field options validation fix
const testFieldWithMixedOptions = {
  id: "test-field",
  type: "RadioGroup",
  label: "Test Radio Field",
  options: [
    "Option 1", // string option (problematic)
    { label: "Option 2", value: "option_2" }, // object option (correct)
    "Option 3" // another string option (problematic)
  ]
};

// Simulated cleanup function from FormBuilder
function cleanupFieldOptions(field) {
  const cleanField = { ...field };
  
  // Ensure options are consistently formatted for choice fields
  if (cleanField.options && (
    cleanField.type === 'RadioGroup' || 
    cleanField.type === 'Select' || 
    cleanField.type === 'Checkbox'
  )) {
    cleanField.options = cleanField.options.map((option, index) => {
      if (typeof option === 'string') {
        return {
          label: option,
          value: option.toLowerCase().replace(/\s+/g, '_') || `option_${index + 1}`
        };
      }
      return option;
    });
  }
  
  return cleanField;
}

console.log('Original field with mixed options:');
console.log(JSON.stringify(testFieldWithMixedOptions, null, 2));

const cleanedField = cleanupFieldOptions(testFieldWithMixedOptions);

console.log('\nCleaned field with consistent options:');
console.log(JSON.stringify(cleanedField, null, 2));

// Test new field creation
const newRadioField = {
  id: "new-radio",
  type: "RadioGroup",
  label: "New Radio Field",
  options: [{ label: 'Option 1', value: 'option_1' }]
};

console.log('\nNew field creation with consistent options:');
console.log(JSON.stringify(newRadioField, null, 2));

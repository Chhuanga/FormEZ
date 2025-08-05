const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateFormSettings() {
  try {
    console.log('Updating form settings...');
    
    // Update the form with ID that was shown in the console logs
    const formId = 'cmdvx6mjx0f7nno4e5ag7n3z3';
    
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        formSettings: {
          titleIcon: 'Star',
          coverImage: 'https://images.unsplash.com/photo-1556745757-8d76bac6ab00?auto=format&fit=crop&w=1200&q=80'
        }
      }
    });
    
    console.log('✅ Form settings updated successfully!');
    console.log('📋 Form ID:', updatedForm.id);
    console.log('🎨 Form settings:', updatedForm.formSettings);
    
  } catch (error) {
    console.error('❌ Error updating form settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFormSettings();

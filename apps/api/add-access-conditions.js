const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAccessConditions() {
  try {
    console.log('Adding access conditions to form...');
    
    // Update the form with access conditions
    const formId = 'cmdy47x9o0001o98p5msgt90e';
    
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        formSettings: {
          titleIcon: 'Star',
          coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop&crop=top',
          accessConditions: {
            requireLogin: true,
            allowedEmailDomains: ['gmail.com', 'company.com']
          }
        }
      }
    });
    
    console.log('✅ Form access conditions updated successfully!');
    console.log('📋 Form ID:', updatedForm.id);
    console.log('🔐 Access conditions:', updatedForm.formSettings);
    console.log('🌐 Public form URL: http://localhost:3000/s/' + updatedForm.id);
    
  } catch (error) {
    console.error('❌ Error updating form access conditions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAccessConditions();

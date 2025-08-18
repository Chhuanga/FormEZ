const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCoverImage() {
  try {
    console.log('Creating a new test form with working cover image...');
    
    // Use a known working Unsplash image URL
    const workingImageUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop&crop=top';
    
    const newForm = await prisma.form.create({
      data: {
        title: 'Test Form with Access Conditions',
        fields: [
          {
            id: 'field-1',
            type: 'Input',
            label: 'Your Name',
            validation: { required: true }
          },
          {
            id: 'field-2', 
            type: 'RadioGroup',
            label: 'Choose an option',
            options: [
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' }
            ]
          }
        ],
        theme: {
          backgroundColor: '#F3F4F6',
          formBackgroundColor: '#FFFFFF',
          questionTextColor: '#111827',
          answerTextColor: '#374151',
          primaryColor: '#3B82F6',
          buttonTextColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          borderRadius: 8,
          textColor: '#000000'
        },
        formSettings: {
          titleIcon: 'Star',
          coverImage: workingImageUrl,
          accessConditions: {
            requireLogin: true,
            allowedEmailDomains: ['example.com', 'test.com']
          }
        },
        postSubmissionSettings: {
          type: 'message',
          message: 'Thank you for your submission!'
        },
        userId: '2Vd6R7HTykRdqbNxzwouaeNcXPv1'
      }
    });
    
    console.log('✅ New test form created successfully!');
    console.log('📋 Form ID:', newForm.id);
    console.log('🖼️ Cover image:', newForm.formSettings.coverImage);
    console.log('🔗 Edit URL: http://localhost:3000/form/' + newForm.id + '/edit');
    console.log('🔗 Public URL: http://localhost:3000/s/' + newForm.id);
    
  } catch (error) {
    console.error('❌ Error creating form:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCoverImage();

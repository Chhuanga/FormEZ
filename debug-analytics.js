async function debugAnalytics() {
  try {
    console.log('🔍 Debugging Analytics Issue...\n');
    
    // Create a test form with submissions directly via the database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres:postgres@localhost:5432/formez?schema=public'
        }
      }
    });
    
    console.log('📝 Creating test form with RadioGroup and Checkbox fields...');
    
    const testForm = await prisma.form.create({
      data: {
        title: 'Analytics Debug Form',
        fields: [
          {
            id: 'radio-test',
            type: 'RadioGroup',
            label: 'Favorite Color',
            options: [
              { label: 'Red', value: 'red' },
              { label: 'Blue', value: 'blue' },
              { label: 'Green', value: 'green' }
            ]
          },
          {
            id: 'checkbox-test', 
            type: 'Checkbox',
            label: 'Hobbies',
            options: [
              { label: 'Reading', value: 'reading' },
              { label: 'Sports', value: 'sports' },
              { label: 'Music', value: 'music' }
            ]
          }
        ],
        theme: {},
        formSettings: {},
        postSubmissionSettings: { type: 'message', message: 'Thank you!' },
        userId: '2Vd6R7HTykRdqbNxzwouaeNcXPv1'
      }
    });
    
    console.log('✅ Test form created with ID:', testForm.id);
    
    // Create test submissions
    console.log('📊 Creating test submissions...');
    
    await prisma.formSubmission.create({
      data: {
        formId: testForm.id,
        answers: {
          create: [
            { fieldId: 'radio-test', value: 'red' },
            { fieldId: 'checkbox-test', value: ['reading', 'sports'] }
          ]
        }
      }
    });
    
    await prisma.formSubmission.create({
      data: {
        formId: testForm.id,
        answers: {
          create: [
            { fieldId: 'radio-test', value: 'blue' },
            { fieldId: 'checkbox-test', value: ['music'] }
          ]
        }
      }
    });
    
    await prisma.formSubmission.create({
      data: {
        formId: testForm.id,
        answers: {
          create: [
            { fieldId: 'radio-test', value: 'red' },
            { fieldId: 'checkbox-test', value: ['reading', 'music', 'sports'] }
          ]
        }
      }
    });
    
    console.log('✅ Test submissions created');
    console.log('🔗 Analytics URL: http://localhost:3000/form/' + testForm.id + '/submissions');
    
    // Let's check what's actually in the database
    console.log('\n🔍 Checking database contents...');
    
    const formWithSubmissions = await prisma.form.findUnique({
      where: { id: testForm.id },
      include: {
        submissions: {
          include: {
            answers: true
          }
        }
      }
    });
    
    console.log('📋 Form fields:', JSON.stringify(formWithSubmissions.fields, null, 2));
    console.log('📝 Submissions and answers:');
    formWithSubmissions.submissions.forEach((sub, index) => {
      console.log(`  Submission ${index + 1}:`, JSON.stringify(sub.answers, null, 2));
    });
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
    console.error(error.stack);
  }
}

debugAnalytics();

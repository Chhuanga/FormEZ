import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_ID = '2Vd6R7HTykRdqbNxzwouaeNcXPv1';

// Helper functions for generating realistic data
function getRandomName() {
  const firstNames = ['Alex', 'Sarah', 'Mike', 'Emily', 'David', 'Jessica', 'Chris', 'Amanda', 'Ryan', 'Lisa', 'Kevin', 'Nicole', 'Tyler', 'Rachel', 'Brandon', 'Ashley', 'Jason', 'Stephanie', 'Daniel', 'Michelle'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomEmail() {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com', 'business.org'];
  const name = getRandomName().toLowerCase().replace(' ', '.');
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${name}@${domain}`;
}

function getRandomSatisfactionRating() {
  const ratings = [
    { value: 'very_satisfied', label: 'Very Satisfied', weight: 30 },
    { value: 'satisfied', label: 'Satisfied', weight: 40 },
    { value: 'neutral', label: 'Neutral', weight: 15 },
    { value: 'dissatisfied', label: 'Dissatisfied', weight: 10 },
    { value: 'very_dissatisfied', label: 'Very Dissatisfied', weight: 5 }
  ];
  
  const totalWeight = ratings.reduce((sum, rating) => sum + rating.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  for (const rating of ratings) {
    currentWeight += rating.weight;
    if (random <= currentWeight) {
      return { value: rating.value, label: rating.label };
    }
  }
  return { value: 'satisfied', label: 'Satisfied' };
}

function getRandomComment(rating) {
  const comments = {
    very_satisfied: ['Excellent service!', 'Amazing experience', 'Exceeded expectations'],
    satisfied: ['Good service overall', 'Happy with the results', 'Met my expectations'],
    neutral: ['Average experience', 'Nothing special', 'Could be better'],
    dissatisfied: ['Poor service', 'Disappointed', 'Not what I expected'],
    very_dissatisfied: ['Terrible service', 'Completely unsatisfied', 'Waste of money']
  };
  
  if (Math.random() < 0.3) return '';
  
  const ratingComments = comments[rating.value as keyof typeof comments] || comments.satisfied;
  return ratingComments[Math.floor(Math.random() * ratingComments.length)];
}

function generateCustomerFeedbackSubmissions(count: number) {
  const submissions: any[] = [];
  for (let i = 0; i < count; i++) {
    const rating = getRandomSatisfactionRating();
    const name = getRandomName();
    const email = getRandomEmail();
    const comment = getRandomComment(rating);
    const recommend = rating.value === 'very_satisfied' ? true : 
                     rating.value === 'satisfied' ? Math.random() > 0.3 :
                     Math.random() > 0.8;
    
    submissions.push({
      answers: [
        { fieldId: 'field_1', value: name },
        { fieldId: 'field_2', value: email },
        { fieldId: 'field_3', value: rating },
        { fieldId: 'field_4', value: comment },
        { fieldId: 'field_5', value: recommend }
      ]
    });
  }
  return submissions;
}

async function displayAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEMO DATA ANALYSIS');
  console.log('='.repeat(60));

  try {
    // Basic Statistics
    const totalForms = await prisma.form.count({ where: { userId: USER_ID } });
    const totalSubmissions = await prisma.formSubmission.count({
      where: { form: { userId: USER_ID } }
    });
    const totalViews = await prisma.formView.count({
      where: { form: { userId: USER_ID } }
    });

    console.log('\n📈 OVERVIEW');
    console.log(`Forms: ${totalForms} | Submissions: ${totalSubmissions} | Views: ${totalViews}`);
    console.log(`Conversion Rate: ${((totalSubmissions / totalViews) * 100).toFixed(2)}%`);

    // Form Performance
    const forms = await prisma.form.findMany({
      where: { userId: USER_ID },
      include: { submissions: true, views: true }
    });

    console.log('\n📋 FORM PERFORMANCE');
    forms.forEach(form => {
      const subs = form.submissions.length;
      const views = form.views.length;
      const rate = views > 0 ? ((subs / views) * 100).toFixed(1) : '0.0';
      console.log(`• ${form.title}: ${subs} submissions, ${views} views (${rate}%)`);
    });

    // Customer Satisfaction
    const feedbackForm = forms.find(f => f.title.includes('Customer Feedback'));
    if (feedbackForm) {
      console.log('\n😊 CUSTOMER SATISFACTION');
      
      const satisfactionAnswers = await prisma.answer.findMany({
        where: {
          submission: { formId: feedbackForm.id },
          fieldId: 'field_3'
        }
      });

      const counts = { very_satisfied: 0, satisfied: 0, neutral: 0, dissatisfied: 0, very_dissatisfied: 0 };
      satisfactionAnswers.forEach(answer => {
        const rating = (answer.value as any)?.value || answer.value;
        if (counts.hasOwnProperty(rating)) counts[rating as keyof typeof counts]++;
      });

      const total = satisfactionAnswers.length;
      Object.entries(counts).forEach(([rating, count]) => {
        const pct = ((count / total) * 100).toFixed(1);
        const label = rating.replace('_', ' ').toUpperCase();
        console.log(`• ${label}: ${count} (${pct}%)`);
      });

      // NPS
      const recommendAnswers = await prisma.answer.findMany({
        where: { submission: { formId: feedbackForm.id }, fieldId: 'field_5' }
      });
      const recommendRate = recommendAnswers.length > 0 
        ? ((recommendAnswers.filter(a => a.value === true).length / recommendAnswers.length) * 100).toFixed(1)
        : '0.0';
      console.log(`• Recommendation Rate: ${recommendRate}%`);
    }

    // Email Domains
    console.log('\n📧 TOP EMAIL DOMAINS');
    const emailAnswers = await prisma.answer.findMany({
      where: { submission: { form: { userId: USER_ID } }, fieldId: 'field_2' }
    });

    const domainCounts: { [key: string]: number } = {};
    emailAnswers.forEach(answer => {
      const email = answer.value as string;
      if (email && typeof email === 'string' && email.includes('@')) {
        const domain = email.split('@')[1];
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });

    Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([domain, count]) => {
        const pct = ((count / emailAnswers.length) * 100).toFixed(1);
        console.log(`• ${domain}: ${count} (${pct}%)`);
      });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Analysis Complete - Ready for testing!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

async function createDemoData() {
  console.log('Creating demo data...');

  try {
    // Clean existing data for this user
    await prisma.answer.deleteMany({
      where: { submission: { form: { userId: USER_ID } } }
    });
    await prisma.formSubmission.deleteMany({
      where: { form: { userId: USER_ID } }
    });
    await prisma.formView.deleteMany({
      where: { form: { userId: USER_ID } }
    });
    await prisma.form.deleteMany({
      where: { userId: USER_ID }
    });

    // Create Customer Feedback Survey
    const feedbackForm = await prisma.form.create({
      data: {
        title: 'Customer Feedback Survey',
        fields: [
          { id: 'field_1', type: 'text', label: 'Name', required: true },
          { id: 'field_2', type: 'email', label: 'Email', required: true },
          { id: 'field_3', type: 'select', label: 'Satisfaction', required: true, 
            options: [
              { value: 'very_satisfied', label: 'Very Satisfied' },
              { value: 'satisfied', label: 'Satisfied' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'dissatisfied', label: 'Dissatisfied' },
              { value: 'very_dissatisfied', label: 'Very Dissatisfied' }
            ]
          },
          { id: 'field_4', type: 'textarea', label: 'Comments', required: false },
          { id: 'field_5', type: 'checkbox', label: 'Recommend us?', required: false }
        ],
        theme: { primaryColor: '#3b82f6', backgroundColor: '#ffffff', textColor: '#1f2937' },
        userId: USER_ID
      }
    });

    // Generate submissions
    const submissions = generateCustomerFeedbackSubmissions(250);
    
    for (let i = 0; i < submissions.length; i++) {
      const submissionData = submissions[i];
      
      const submission = await prisma.formSubmission.create({
        data: { formId: feedbackForm.id }
      });

      for (const answerData of submissionData.answers) {
        await prisma.answer.create({
          data: {
            fieldId: answerData.fieldId,
            value: answerData.value,
            submissionId: submission.id
          }
        });
      }

      if (i % 50 === 0) {
        console.log(`Created ${i + 1}/250 submissions...`);
      }
    }

    // Add form views
    const viewCount = Math.floor(Math.random() * 300) + 400;
    for (let i = 0; i < viewCount; i++) {
      await prisma.formView.create({
        data: { formId: feedbackForm.id }
      });
    }

    console.log(`✅ Created ${feedbackForm.title} with 250 submissions and ${viewCount} views`);

    // Display analysis
    await displayAnalysis();

  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoData();

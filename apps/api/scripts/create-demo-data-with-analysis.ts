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

function generateRandomTimestamp() {
  // Generate submissions over the past 180 days (6 months)
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(now.getDate() - 180);
  
  // Weighted distribution - more recent submissions are more likely
  const timePeriods = [
    { weight: 40, daysBack: 30 },    // Last 30 days - 40% of submissions
    { weight: 30, daysBack: 90 },    // 30-90 days ago - 30% of submissions  
    { weight: 20, daysBack: 150 },   // 90-150 days ago - 20% of submissions
    { weight: 10, daysBack: 180 }    // 150-180 days ago - 10% of submissions
  ];
  
  const totalWeight = timePeriods.reduce((sum, period) => sum + period.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  let selectedPeriod = timePeriods[0];
  for (const period of timePeriods) {
    currentWeight += period.weight;
    if (random <= currentWeight) {
      selectedPeriod = period;
      break;
    }
  }
  
  // Generate random timestamp within the selected period
  const maxDaysBack = selectedPeriod.daysBack;
  const minDaysBack = selectedPeriod === timePeriods[0] ? 0 : 
                      selectedPeriod === timePeriods[1] ? 30 :
                      selectedPeriod === timePeriods[2] ? 90 : 150;
  
  const daysBack = Math.floor(Math.random() * (maxDaysBack - minDaysBack)) + minDaysBack;
  const randomDate = new Date();
  randomDate.setDate(now.getDate() - daysBack);
  
  // Add some random hours/minutes for more realistic distribution
  randomDate.setHours(
    Math.floor(Math.random() * 24), 
    Math.floor(Math.random() * 60), 
    Math.floor(Math.random() * 60)
  );
  
  return randomDate;
}

function getRandomHearAboutUs() {
  const sources = [
    { value: 'social_media', weight: 30 },
    { value: 'search_engine', weight: 25 },
    { value: 'friend_referral', weight: 20 },
    { value: 'advertisement', weight: 15 },
    { value: 'website', weight: 8 },
    { value: 'other', weight: 2 }
  ];
  
  const totalWeight = sources.reduce((sum, source) => sum + source.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  for (const source of sources) {
    currentWeight += source.weight;
    if (random <= currentWeight) {
      return { value: source.value };
    }
  }
  return { value: 'other' };
}

function getRandomAgeGroup() {
  const ageGroups = [
    { value: '18-24', weight: 15 },
    { value: '25-34', weight: 30 },
    { value: '35-44', weight: 25 },
    { value: '45-54', weight: 18 },
    { value: '55-64', weight: 10 },
    { value: '65+', weight: 2 }
  ];
  
  const totalWeight = ageGroups.reduce((sum, group) => sum + group.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  for (const group of ageGroups) {
    currentWeight += group.weight;
    if (random <= currentWeight) {
      return { value: group.value };
    }
  }
  return { value: '25-34' };
}

function getRandomLocation() {
  const locations = [
    { value: 'north_america', weight: 40 },
    { value: 'europe', weight: 25 },
    { value: 'asia', weight: 20 },
    { value: 'south_america', weight: 8 },
    { value: 'africa', weight: 5 },
    { value: 'oceania', weight: 2 }
  ];
  
  const totalWeight = locations.reduce((sum, location) => sum + location.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  for (const location of locations) {
    currentWeight += location.weight;
    if (random <= currentWeight) {
      return { value: location.value };
    }
  }
  return { value: 'north_america' };
}

function getRandomServices() {
  const services = ['consulting', 'support', 'training', 'development', 'maintenance'];
  const selectedServices: { value: string }[] = [];
  
  // Each service has 30-60% chance of being selected
  services.forEach(service => {
    if (Math.random() < 0.45) {
      selectedServices.push({ value: service });
    }
  });
  
  // Ensure at least one service is selected
  if (selectedServices.length === 0) {
    selectedServices.push({ value: services[Math.floor(Math.random() * services.length)] });
  }
  
  return selectedServices;
}

function getRandomPurchaseFrequency() {
  const frequencies = [
    { value: 'first_time', weight: 25 },
    { value: 'occasionally', weight: 30 },
    { value: 'yearly', weight: 20 },
    { value: 'quarterly', weight: 15 },
    { value: 'monthly', weight: 10 }
  ];
  
  const totalWeight = frequencies.reduce((sum, freq) => sum + freq.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  for (const freq of frequencies) {
    currentWeight += freq.weight;
    if (random <= currentWeight) {
      return { value: freq.value };
    }
  }
  return { value: 'occasionally' };
}

function getRandomProductQuality(satisfactionRating) {
  // Product quality should correlate with overall satisfaction
  const satisfactionValue = satisfactionRating.value;
  
  if (satisfactionValue === 'very_satisfied') {
    return Math.random() < 0.8 ? { value: 'excellent' } : { value: 'good' };
  } else if (satisfactionValue === 'satisfied') {
    return Math.random() < 0.6 ? { value: 'good' } : Math.random() < 0.8 ? { value: 'excellent' } : { value: 'average' };
  } else if (satisfactionValue === 'neutral') {
    return Math.random() < 0.7 ? { value: 'average' } : Math.random() < 0.85 ? { value: 'good' } : { value: 'poor' };
  } else if (satisfactionValue === 'dissatisfied') {
    return Math.random() < 0.6 ? { value: 'poor' } : Math.random() < 0.8 ? { value: 'average' } : { value: 'very_poor' };
  } else {
    return Math.random() < 0.7 ? { value: 'very_poor' } : { value: 'poor' };
  }
}

function generateCustomerFeedbackSubmissions(count: number) {
  const submissions: any[] = [];
  for (let i = 0; i < count; i++) {
    const rating = getRandomSatisfactionRating();
    const name = getRandomName();
    const email = getRandomEmail();
    const hearAboutUs = getRandomHearAboutUs();
    const ageGroup = getRandomAgeGroup();
    const location = getRandomLocation();
    const services = getRandomServices();
    const purchaseFreq = getRandomPurchaseFrequency();
    const productQuality = getRandomProductQuality(rating);
    const comment = getRandomComment(rating);
    const recommend = rating.value === 'very_satisfied' ? true : 
                     rating.value === 'satisfied' ? Math.random() > 0.3 :
                     Math.random() > 0.8;
    const recommendValue = recommend ? ['yes_recommend'] : [];
    const submissionTimestamp = generateRandomTimestamp();
    
    submissions.push({
      timestamp: submissionTimestamp,
      answers: [
        { fieldId: 'field_1', value: name },
        { fieldId: 'field_2', value: email },
        { fieldId: 'field_3', value: rating.value },
        { fieldId: 'field_4', value: hearAboutUs.value },
        { fieldId: 'field_5', value: ageGroup.value },
        { fieldId: 'field_6', value: location.value },
        { fieldId: 'field_7', value: services.map(s => s.value) },
        { fieldId: 'field_8', value: purchaseFreq.value },
        { fieldId: 'field_9', value: productQuality.value },
        { fieldId: 'field_10', value: comment },
        { fieldId: 'field_11', value: recommendValue }
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
          { id: 'field_1', type: 'Input', label: 'Name', required: true },
          { id: 'field_2', type: 'Email', label: 'Email', required: true },
          { id: 'field_3', type: 'Select', label: 'Overall Satisfaction', required: true, 
            options: [
              { value: 'very_satisfied', label: 'Very Satisfied' },
              { value: 'satisfied', label: 'Satisfied' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'dissatisfied', label: 'Dissatisfied' },
              { value: 'very_dissatisfied', label: 'Very Dissatisfied' }
            ]
          },
          { id: 'field_4', type: 'RadioGroup', label: 'How did you hear about us?', required: true,
            options: [
              { value: 'social_media', label: 'Social Media' },
              { value: 'search_engine', label: 'Search Engine' },
              { value: 'friend_referral', label: 'Friend/Family Referral' },
              { value: 'advertisement', label: 'Advertisement' },
              { value: 'website', label: 'Company Website' },
              { value: 'other', label: 'Other' }
            ]
          },
          { id: 'field_5', type: 'Select', label: 'Age Group', required: true,
            options: [
              { value: '18-24', label: '18-24' },
              { value: '25-34', label: '25-34' },
              { value: '35-44', label: '35-44' },
              { value: '45-54', label: '45-54' },
              { value: '55-64', label: '55-64' },
              { value: '65+', label: '65+' }
            ]
          },
          { id: 'field_6', type: 'RadioGroup', label: 'Location', required: true,
            options: [
              { value: 'north_america', label: 'North America' },
              { value: 'europe', label: 'Europe' },
              { value: 'asia', label: 'Asia' },
              { value: 'south_america', label: 'South America' },
              { value: 'africa', label: 'Africa' },
              { value: 'oceania', label: 'Oceania' }
            ]
          },
          { id: 'field_7', type: 'Checkbox', label: 'Which services have you used?', required: false,
            options: [
              { value: 'consulting', label: 'Consulting' },
              { value: 'support', label: 'Customer Support' },
              { value: 'training', label: 'Training' },
              { value: 'development', label: 'Development' },
              { value: 'maintenance', label: 'Maintenance' }
            ]
          },
          { id: 'field_8', type: 'Select', label: 'Purchase Frequency', required: true,
            options: [
              { value: 'first_time', label: 'First Time' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'occasionally', label: 'Occasionally' }
            ]
          },
          { id: 'field_9', type: 'RadioGroup', label: 'Product Quality Rating', required: true,
            options: [
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'average', label: 'Average' },
              { value: 'poor', label: 'Poor' },
              { value: 'very_poor', label: 'Very Poor' }
            ]
          },
          { id: 'field_10', type: 'Textarea', label: 'Comments', required: false },
          { id: 'field_11', type: 'Checkbox', label: 'Would you recommend us to others?', required: false,
            options: [
              { value: 'yes_recommend', label: 'Yes, I would recommend' }
            ]
          }
        ],
        theme: { primaryColor: '#3b82f6', backgroundColor: '#ffffff', textColor: '#1f2937' },
        userId: USER_ID
      }
    });

    // Generate submissions
    const submissions = generateCustomerFeedbackSubmissions(3000);
    
    for (let i = 0; i < submissions.length; i++) {
      const submissionData = submissions[i];
      
      const submission = await prisma.formSubmission.create({
        data: { 
          formId: feedbackForm.id,
          createdAt: submissionData.timestamp
        }
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
        console.log(`Created ${i + 1}/3000 submissions...`);
      }
    }

    // Add form views with dynamic timestamps
    const viewCount = Math.floor(Math.random() * 1000) + 2500; // 2500-3500 views for 3000 submissions
    console.log(`📊 Creating ${viewCount} form views with dynamic timestamps...`);
    
    for (let i = 0; i < viewCount; i++) {
      const viewTimestamp = generateRandomTimestamp();
      await prisma.formView.create({
        data: { 
          formId: feedbackForm.id,
          createdAt: viewTimestamp
        }
      });
      
      if (i % 500 === 0 && i > 0) {
        console.log(`Created ${i}/${viewCount} views...`);
      }
    }

    console.log(`✅ Created ${feedbackForm.title} with 3000 submissions and ${viewCount} views`);

    // Display analysis
    await displayAnalysis();

  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoData();

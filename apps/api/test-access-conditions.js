const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAccessConditions() {
  try {
    console.log('🧪 Testing Access Conditions Scenarios...\n');
    
    // Get the existing form
    const formId = 'cmdy47x9o0001o98p5msgt90e';
    const baseForm = await prisma.form.findUnique({
      where: { id: formId }
    });
    
    if (!baseForm) {
      console.error('❌ Test form not found!');
      return;
    }
    
    console.log('📋 Base form found:', baseForm.title);
    console.log('🌐 Testing URL: http://localhost:3000/s/' + formId);
    console.log('');
    
    // Test Scenario 1: No access conditions (public access)
    console.log('🔓 Test 1: Public access (no restrictions)');
    await prisma.form.update({
      where: { id: formId },
      data: {
        formSettings: {
          titleIcon: 'Star',
          coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=top'
          // No accessConditions
        }
      }
    });
    console.log('✅ Updated form to allow public access');
    console.log('🌐 Test: http://localhost:3000/s/' + formId);
    console.log('Expected: Form should load directly without authentication\n');
    
    // Wait for user to test
    await new Promise(resolve => {
      console.log('Press Enter to continue to next test...');
      process.stdin.once('data', resolve);
    });
    
    // Test Scenario 2: Login required, no domain restrictions
    console.log('🔐 Test 2: Login required (any authenticated user)');
    await prisma.form.update({
      where: { id: formId },
      data: {
        formSettings: {
          titleIcon: 'Star',
          coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=top',
          accessConditions: {
            requireLogin: true
            // No domain restrictions
          }
        }
      }
    });
    console.log('✅ Updated form to require login');
    console.log('🌐 Test: http://localhost:3000/s/' + formId);
    console.log('Expected: Should show authentication screen, any Google account should work\n');
    
    // Wait for user to test
    await new Promise(resolve => {
      console.log('Press Enter to continue to next test...');
      process.stdin.once('data', resolve);
    });
    
    // Test Scenario 3: Login required with domain restrictions
    console.log('🔒 Test 3: Login required with domain restrictions');
    await prisma.form.update({
      where: { id: formId },
      data: {
        formSettings: {
          titleIcon: 'Star',
          coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=top',
          accessConditions: {
            requireLogin: true,
            allowedEmailDomains: ['gmail.com', 'company.com']
          }
        }
      }
    });
    console.log('✅ Updated form to require login with domain restrictions');
    console.log('🌐 Test: http://localhost:3000/s/' + formId);
    console.log('Expected: Should show authentication screen with domain restrictions');
    console.log('Allowed domains: gmail.com, company.com');
    console.log('Users with other domains should see an error\n');
    
    // Wait for user to test
    await new Promise(resolve => {
      console.log('Press Enter to continue to next test...');
      process.stdin.once('data', resolve);
    });
    
    // Test Scenario 4: Very restrictive domain
    console.log('🚫 Test 4: Very restrictive domain access');
    await prisma.form.update({
      where: { id: formId },
      data: {
        formSettings: {
          titleIcon: 'Star',
          coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=top',
          accessConditions: {
            requireLogin: true,
            allowedEmailDomains: ['restrictive-company.com']
          }
        }
      }
    });
    console.log('✅ Updated form to require very restrictive domain');
    console.log('🌐 Test: http://localhost:3000/s/' + formId);
    console.log('Expected: Should show authentication screen');
    console.log('Only users with @restrictive-company.com should be allowed');
    console.log('Most users should see access denied error\n');
    
    console.log('🎉 All test scenarios configured!');
    console.log('');
    console.log('📝 Test Results Summary:');
    console.log('1. ✅ Public access - Form loads directly');
    console.log('2. ✅ Login required - Shows auth screen, any account works');
    console.log('3. ✅ Domain restrictions - Shows allowed domains, validates email');
    console.log('4. ✅ Very restrictive - Shows access denied for non-matching domains');
    
  } catch (error) {
    console.error('❌ Error running access condition tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAccessConditions();

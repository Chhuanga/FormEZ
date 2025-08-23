import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The form owner (demo user)
const FORM_OWNER_ID = '2Vd6R7HTykRdqbNxzwouaeNcXPv1';

// You can change this to any Firebase UID to test collaboration
// This could be a second Firebase user account you create for testing
const NEW_COLLABORATOR_ID = process.argv[2] || 'test-user-2-firebase-uid';

async function addCollaborator() {
  try {
    if (NEW_COLLABORATOR_ID === 'test-user-2-firebase-uid' && process.argv.length < 3) {
      console.log('🔧 Usage: npm run add-collaborator <firebase-uid>');
      console.log('📝 Example: npm run add-collaborator abc123def456ghi789');
      console.log('\n💡 To test collaboration:');
      console.log('   1. Create a second Firebase account');
      console.log('   2. Get the Firebase UID from that account');
      console.log('   3. Run this script with that UID');
      console.log('   4. Sign in with the second account');
      console.log('   5. Visit the collaboration URL');
      return;
    }

    console.log('🔍 Finding Customer Feedback Survey form...');
    
    // Get the demo form
    const form = await prisma.form.findFirst({
      where: { 
        userId: FORM_OWNER_ID,
        title: 'Customer Feedback Survey'
      },
      include: {
        collaborators: true,
      },
    });

    if (!form) {
      console.error('❌ Customer Feedback Survey form not found');
      console.log('💡 Run the demo data script first: npm run create-demo-data');
      return;
    }

    console.log(`✅ Found form: ${form.title} (ID: ${form.id})`);
    console.log(`📊 Current collaborators: ${form.collaborators.length}`);

    // Check if collaborator already exists
    const existingCollaborator = form.collaborators.find(c => c.userId === NEW_COLLABORATOR_ID);
    if (existingCollaborator) {
      console.log(`👤 User is already a collaborator: ${NEW_COLLABORATOR_ID}`);
      console.log(`🔗 Collaboration URL: http://localhost:3000/form/${form.id}/collaborate`);
      return;
    }

    // Add new collaborator
    const collaborator = await prisma.formCollaborator.create({
      data: {
        formId: form.id,
        userId: NEW_COLLABORATOR_ID,
        role: 'editor',
      },
    });

    console.log(`✅ Added collaborator: ${collaborator.userId}`);
    console.log(`🔗 Collaboration URL: http://localhost:3000/form/${form.id}/collaborate`);
    
    console.log(`\n📝 Testing steps:`);
    console.log(`   1. Sign in to Firebase with UID: ${NEW_COLLABORATOR_ID}`);
    console.log(`   2. Visit: http://localhost:3000/form/${form.id}/collaborate`);
    console.log(`   3. You should now have collaboration access!`);
    console.log(`\n🎯 This form has 3,000 submissions and full analytics data!`);

  } catch (error) {
    console.error('❌ Error adding collaborator:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 This user is already a collaborator on this form');
    } else if (error.code === 'P2003') {
      console.log('💡 The user ID provided does not exist. Make sure it\'s a valid Firebase UID');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addCollaborator();

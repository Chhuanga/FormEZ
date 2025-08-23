import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FORM_OWNER_ID = '2Vd6R7HTykRdqbNxzwouaeNcXPv1';
// Use the same user ID as the owner for testing, or change to a different Firebase UID
const TEST_COLLABORATOR_ID = '2Vd6R7HTykRdqbNxzwouaeNcXPv1'; // Same user for testing

async function addTestCollaborator() {
  try {
    console.log('🔍 Finding form owned by', FORM_OWNER_ID);
    
    // Get the form with the title "Customer Feedback Survey" (our demo form with 3000 submissions)
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
      console.error('❌ No form found for user', FORM_OWNER_ID);
      return;
    }

    console.log(`✅ Found form: ${form.title} (ID: ${form.id})`);
    console.log(`📊 Current collaborators: ${form.collaborators.length}`);

    // Check if collaborator already exists
    const existingCollaborator = form.collaborators.find(c => c.userId === TEST_COLLABORATOR_ID);
    if (existingCollaborator) {
      console.log(`👤 User is already a collaborator: ${TEST_COLLABORATOR_ID}`);
      console.log(`🔗 Collaboration URL: http://localhost:3000/form/${form.id}/collaborate`);
      return;
    }

    // Add test collaborator
    const collaborator = await prisma.formCollaborator.create({
      data: {
        formId: form.id,
        userId: TEST_COLLABORATOR_ID,
        role: 'editor',
      },
    });

    console.log(`✅ Added test collaborator with ID: ${collaborator.userId}`);
    console.log(`🔗 Collaboration URL: http://localhost:3000/form/${form.id}/collaborate`);
    
    console.log(`\n📝 Testing instructions:`);
    console.log(`   1. Visit: http://localhost:3000/form/${form.id}/collaborate`);
    console.log(`   2. You should now have access to collaborate on the form`);
    console.log(`   3. The form owner and collaborator are the same user for testing`);

  } catch (error) {
    console.error('❌ Error adding collaborator:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestCollaborator();

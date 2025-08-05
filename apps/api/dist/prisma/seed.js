"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
const feedbackFormFields = [
    {
        id: 'rating',
        type: 'RadioGroup',
        label: 'How would you rate your recent experience?',
        options: ['Excellent', 'Good', 'Average', 'Poor'],
        validation: { required: true },
    },
    {
        id: 'visited_departments',
        type: 'Checkbox',
        label: 'Which departments did you visit?',
        options: ['Clothing', 'Electronics', 'Home Goods', 'Groceries', 'Toys'],
        validation: { required: false },
    },
    {
        id: 'recommend_likelihood',
        type: 'NumberInput',
        label: 'On a scale of 1-10, how likely are you to recommend us?',
        validation: { required: true },
    },
    {
        id: 'improvements',
        type: 'Textarea',
        label: 'How can we improve our store?',
        validation: { required: false },
    },
    {
        id: 'new_products',
        type: 'Textarea',
        label: 'What new products would you like to see?',
        validation: { required: false },
    },
    {
        id: 'email',
        type: 'Email',
        label: 'Your email (for a chance to win a gift card!)',
        validation: { required: false },
    },
];
const improvementsCorpus = [
    'Checkout lines were too long.',
    'Staff was very helpful and friendly.',
    'Could not find the item I was looking for.',
    'The store was clean and well-organized.',
    'Prices are a bit high on some items.',
    'Love the new selection in the bakery.',
    'The music was too loud.',
    'Please bring back the old coffee brand.',
    'Online order pickup was very efficient.',
    'Wish you had more parking spaces.',
];
const newProductsCorpus = [
    'More organic vegetable options.',
    'A wider selection of gluten-free products.',
    'High-quality kitchenware.',
    'More eco-friendly cleaning supplies.',
    'I wish you sold books and magazines.',
    'A better selection of imported cheeses.',
    'Smart home devices.',
    'Locally sourced honey and jams.',
    'A dedicated section for pet supplies.',
    'More comfortable seating in the cafe.',
];
async function main() {
    console.log('Start seeding ...');
    const testUserId = '2Vd6R7HTykRdqbNxzwouaeNcXPv1';
    console.log(`Ensuring test user exists: ${testUserId}`);
    const user = await prisma.user.upsert({
        where: { id: testUserId },
        update: {},
        create: {
            id: testUserId,
            email: `${testUserId}@test.firebase`,
        },
    });
    console.log(`Seeding for user: ${user.id}`);
    const form = await prisma.form.create({
        data: {
            title: 'Customer Feedback Survey',
            fields: feedbackFormFields,
            userId: user.id,
            theme: {
                backgroundColor: '#F8F8F8',
                textColor: '#333333',
                primaryColor: '#6A5ACD',
                fontSize: '16px',
                questionTextColor: '#2D3748',
                answerTextColor: '#4A5568',
                formBackgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                buttonTextColor: '#FFFFFF',
            },
            formSettings: {
                titleIcon: 'Star',
                coverImage: 'https://images.unsplash.com/photo-1556745757-8d76bac6ab00?auto=format&fit=crop&w=1200&q=80',
            },
            postSubmissionSettings: {
                type: 'message',
                message: 'Thank you for your valuable feedback!',
            },
        },
    });
    console.log(`Created form "${form.title}" with ID: ${form.id}`);
    for (let i = 0; i < 250; i++) {
        await prisma.formView.create({
            data: {
                formId: form.id,
                createdAt: faker_1.faker.date.recent({ days: 30 }),
            },
        });
    }
    console.log('Created 250 form views.');
    for (let i = 0; i < 150; i++) {
        const submissionDate = faker_1.faker.date.recent({ days: 30 });
        await prisma.formSubmission.create({
            data: {
                formId: form.id,
                createdAt: submissionDate,
                answers: {
                    create: [
                        {
                            fieldId: 'rating',
                            value: faker_1.faker.helpers.arrayElement([
                                'Excellent',
                                'Good',
                                'Average',
                                'Poor',
                            ]),
                        },
                        {
                            fieldId: 'visited_departments',
                            value: faker_1.faker.helpers.arrayElements(['Clothing', 'Electronics', 'Home Goods', 'Groceries', 'Toys'], faker_1.faker.number.int({ min: 1, max: 3 })),
                        },
                        {
                            fieldId: 'recommend_likelihood',
                            value: faker_1.faker.number.int({ min: 1, max: 10 }),
                        },
                        ...(faker_1.faker.datatype.boolean()
                            ? [
                                {
                                    fieldId: 'improvements',
                                    value: faker_1.faker.helpers.arrayElement(improvementsCorpus),
                                },
                            ]
                            : []),
                        ...(faker_1.faker.datatype.boolean()
                            ? [
                                {
                                    fieldId: 'new_products',
                                    value: faker_1.faker.helpers.arrayElement(newProductsCorpus),
                                },
                            ]
                            : []),
                        ...(faker_1.faker.datatype.boolean(0.3)
                            ? [
                                {
                                    fieldId: 'email',
                                    value: faker_1.faker.internet.email(),
                                },
                            ]
                            : []),
                    ],
                },
            },
        });
    }
    console.log('Created 150 form submissions.');
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    void prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
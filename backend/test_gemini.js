require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('Sending test prompt with gemini-1.5-flash...');
        const result = await model.generateContent('Hi');
        console.log('Response:', result.response.text());
        console.log('✅ gemini-1.5-flash works!');
    } catch (e) {
        console.error('❌ gemini-1.5-flash error:', e.message);
        try {
            const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
            console.log('Trying gemini-pro...');
            const result2 = await model2.generateContent('Hi');
            console.log('Response:', result2.response.text());
            console.log('✅ gemini-pro works!');
        } catch (e2) {
            console.error('❌ gemini-pro error:', e2.message);
        }
    }
}

test();

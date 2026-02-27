require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

async function test() {
    try {
        const prompt = `You are a helpful assistant. Reply ONLY with raw JSON (no backticks, no markdown):
{
  "reply": "Hello! How can I help you today?",
  "extracted_fields": {"title":"","description":"","category":"","subcategory":"","location_text":"","severity":"","citizen_phone":"","citizen_email":""},
  "ready_to_submit": false
}

User says: "There is a massive pothole on MG Road near the metro station. It is very dangerous and cars are getting damaged."
Respond with ONLY raw JSON (no markdown):`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        console.log('Raw response:', text);
        const parsed = JSON.parse(text.replace(/^```json\s*\n?/i, '').replace(/^```\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim());
        console.log('\nParsed OK:');
        console.log('  reply:', parsed.reply);
        console.log('  category:', parsed.extracted_fields?.category);
        console.log('  severity:', parsed.extracted_fields?.severity);
        console.log('  location_text:', parsed.extracted_fields?.location_text);
        console.log('  ready_to_submit:', parsed.ready_to_submit);
    } catch (e) {
        console.error('GEMINI ERROR:', e.message);
    }
}
test();

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent("Respond with {reply: 'hello'}");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("GEMINI ERROR TRACE:");
        console.error(e);
    }
}
run();

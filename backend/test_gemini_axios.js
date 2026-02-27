require('dotenv').config();
const axios = require('axios');

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: 'Hi' }] }]
        });
        console.log('Success:', res.data);
    } catch (e) {
        if (e.response) {
            console.log('Error Status:', e.response.status);
            console.log('Error Data:', JSON.stringify(e.response.data, null, 2));
        } else {
            console.log('Error Message:', e.message);
        }
    }
}

test();

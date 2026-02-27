const express = require('express');
const router = express.Router();

/* ─── Keyword fallback classifier ─── */
const AI_KW = {
  Waste: ['garbage', 'trash', 'waste', 'bin', 'dump', 'litter', 'rubbish', 'debris'],
  Water: ['water', 'pipe', 'leak', 'drain', 'flood', 'sewage', 'supply', 'tap'],
  Road: ['pothole', 'road', 'pavement', 'crack', 'highway', 'asphalt', 'junction'],
  Streetlight: ['light', 'lamp', 'streetlight', 'dark', 'bulb', 'pole', 'illumination'],
  Sanitation: ['manhole', 'sewer', 'sanitation', 'mosquito', 'stagnant', 'hygiene', 'pest'],
};
const HIGH_W = ['urgent', 'dangerous', 'accident', 'hazard', 'emergency', 'severe', 'critical', 'injury'];
const MED_W = ['issue', 'problem', 'broken', 'damaged', 'leaking', 'blocked', 'overflow'];

function kwClassify(text) {
  if (!text || text.length < 5) return { category: 'General', priority: 'Low', confidence: 50, reasoning: 'Insufficient text' };
  const low = text.toLowerCase();
  const scores = {};
  let total = 0;
  for (const [c, kws] of Object.entries(AI_KW)) { scores[c] = kws.filter(k => low.includes(k)).length; total += scores[c]; }
  const max = Math.max(...Object.values(scores));
  const cat = max === 0 ? 'General' : Object.keys(scores).find(k => scores[k] === max);
  let pri = 'Low';
  if (HIGH_W.some(w => low.includes(w)) || text.length > 100) pri = 'High';
  else if (MED_W.some(w => low.includes(w)) || text.split(' ').length > 10) pri = 'Medium';
  const conf = Math.min(95, 55 + max * 15 + (total > 2 ? 8 : 0));
  return { category: cat, priority: pri, confidence: conf, reasoning: `Matched ${max} keyword(s) in "${cat}" category via local AI engine.` };
}

/* ─── Gemini init ─── */
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
  try { const { GoogleGenerativeAI } = require('@google/generative-ai'); genAI = new GoogleGenerativeAI(apiKey); }
  catch (e) { console.warn('Gemini init failed:', e.message); }
}

/* ─── POST /api/ai/classify ─── */
router.post('/classify', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  if (!genAI) {
    const fallback = kwClassify(text);
    return res.json({ category: fallback.category, priority: fallback.priority, summary: text.substring(0, 50) + '...' });
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this Indian civic complaint and return ONLY a raw JSON object (no markdown, no backticks):
{
  "category": "Waste" | "Water" | "Road" | "Streetlight" | "Sanitation" | "General",
  "priority": "High" | "Medium" | "Low",
  "summary": "short 1-line issue summary",
  "confidence": <integer 0-100>,
  "reasoning": "one-sentence explanation of classification"
}
Complaint: "${text}"`;
    let txt = (await model.generateContent(prompt)).response.text().trim();
    txt = txt.replace(/^```json\s*\n?/i, '').replace(/^```\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = JSON.parse(txt);
    // Ensure confidence is always a number
    if (!parsed.confidence) parsed.confidence = 85;
    if (!parsed.reasoning) parsed.reasoning = `Gemini classified as "${parsed.category}" with ${parsed.priority} priority.`;
    res.json(parsed);
  } catch (e) {
    console.warn('Gemini classify fallback:', e.message);
    const fallback = kwClassify(text);
    res.json({ category: fallback.category, priority: fallback.priority, summary: text.substring(0, 50) + '...', confidence: fallback.confidence, reasoning: fallback.reasoning });
  }
});

/* ─── POST /api/ai/chat ─── */
router.post('/chat', async (req, res) => {
  const {
    message,
    history = [],
    stats = {},
    extracted_fields = {},
    selected_language = 'English',
    input_mode = 'text',
  } = req.body;

  if (!message) return res.status(400).json({ error: 'Message required' });

  // Centralized Fallback Logic
  const getFallbackResponse = () => {
    const low = message.toLowerCase();
    let reply = "I'm the SUGRS AI Assistant. I can help you categorized your grievances and guide you through the filing process.";
    let identifiedCategory = "";

    // Extract category using existing AI_KW keywords
    for (const [cat, keywords] of Object.entries(AI_KW)) {
      if (keywords.some(kw => low.includes(kw))) {
        identifiedCategory = cat;
        break;
      }
    }

    if (low.includes('hello') || low.includes('hi') || low.includes('help')) {
      reply = "Hello! I can help you report issues like potholes, water leaks, or garbage collection. What's bothering you today?";
    } else if (identifiedCategory === 'Water') {
      reply = "I understand you have a water/sewage issue. These are handled by the Water Department. Typical resolution time is 48-72 hours. I have noted this down. Anything else to add?";
    } else if (identifiedCategory === 'Road') {
      reply = "Road and pavement issues are handled by the Public Works (Roads) Department. I can help you pinpoint the location for the repair crew. I've marked this as a Road issue. Shall we proceed?";
    } else if (identifiedCategory === 'Streetlight') {
      reply = "Streetlight maintenance is a priority for safety. I'll need the pole number or near address to notify the Streetlight Department. I've added this to the report.";
    } else if (identifiedCategory === 'Waste') {
      reply = "Waste management complaints are routed to the Sanitation team. They usually resolve collection issues within 24 hours. I've captured this as a Sanitation issue.";
    } else if (low.includes('status') || low.includes('track')) {
      reply = "You can track your complaint by clicking 'Track Complaint' on the top menu and entering your Ticket ID (e.g., TKT-1234).";
    }

    // Smart field extraction in fallback
    const newFields = { ...extracted_fields };
    if (identifiedCategory) {
      newFields.category = identifiedCategory;
      if (!newFields.title || newFields.title === "") {
        newFields.title = message.length > 50 ? message.substring(0, 47) + "..." : message;
      }
      if (!newFields.description || newFields.description === "") {
        newFields.description = message;
      }
    }

    return {
      reply: reply + "\n\n(Note: AI is currently running in fallback mode.)",
      language_used: selected_language,
      extracted_fields: newFields,
      duplicate_check: { is_duplicate: false, similarity_score: 0, cluster_id: '' },
      upvote_recommendation: { allow_public_upvote: identifiedCategory !== "", visibility: 'public' },
      notification_triggers: { send_push: false, send_sms: false, priority_level: 'normal' },
      voice_metadata: { input_mode, confidence_score: 0.9 },
      feedback_display: { show_on_main_page: false, highlight_level: 'normal' },
      ready_to_submit: identifiedCategory !== "",
    };
  };

  if (!genAI) return res.json(getFallbackResponse());

  try {
    const modelName = 'gemini-1.5-flash-latest';
    console.log(`[AI] Using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const hist = history.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');

    const prompt = `
You are SUGRS AI operating in Anti-Gravity Mode.

You are a civic grievance intelligence engine for a multilingual public grievance platform.

SYSTEM CONTEXT:
- Website language is selected from landing page.
- The selected language is: ${selected_language}
- User input mode: ${input_mode}
- You must strictly respond in the selected language.
- Never auto-detect language.
- Never respond outside JSON.
- Never explain the JSON.

====================================================
YOUR RESPONSIBILITIES
====================================================

1) MULTILINGUAL CONTROL
- Always respond in: ${selected_language}
- Maintain natural, respectful civic tone.

2) STRUCTURED EXTRACTION
Extract and structure complaint details clearly.
Previously extracted fields (preserve non-empty values, do NOT overwrite with empty):
${JSON.stringify(extracted_fields || {})}

3) DUPLICATE DETECTION & CLUSTERING
- Analyze semantic similarity.
- If issue likely already exists → mark as duplicate.
- Generate logical cluster_id based on: category + area + issue type
- Estimate similarity score (0–100).

4) PUBLIC UPVOTE DECISION
- Enable upvotes for public-impact issues.
- Disable for personal/private disputes.
- Suggest trending if cluster size likely high.

5) PUSH & SMS TRIGGERS
Enable send_push and send_sms if:
- severity is "critical"
- public safety hazard
- infrastructure failure
- emergency risk
Otherwise keep false.

6) VOICE RECOGNITION SUPPORT
- If input_mode is "voice", assume speech-to-text noise.
- Clean grammar internally.
- Infer missing structure intelligently.
- Set confidence_score (0–1).

7) MAIN PAGE FEEDBACK CONTROL
- show_on_main_page = true for: public issues, high severity, duplicate clusters
- highlight_level: normal | trending | urgent

8) ESCALATION & CIVIC RESPONSIBILITY FRAMEWORK
Think carefully before recommending escalation. Classify the issue into one of three tiers:

Tier A: SELF-RESOLVABLE ISSUE
Classify here if the issue:
- Affects only personal/private property
- Is minor and non-hazardous
- Is informational (how to apply, where to go, process questions)
- Can reasonably be solved by contacting local services directly
- Does not affect public infrastructure or community safety
Action: Provide practical step-by-step guidance. Encourage responsible action. Do NOT recommend filing a complaint. Keep tone supportive and empowering.
Response Flags: ready_to_submit = false, send_push = false, send_sms = false, allow_public_upvote = false, show_on_main_page = false, priority_level = "normal".

Tier B: PUBLIC COMMUNITY ISSUE
Classify here if the issue:
- Affects shared infrastructure
- Impacts multiple citizens
- Relates to roads, drainage, water supply, streetlights, sanitation
- Is a recurring public problem
Action: Recommend filing a formal complaint. Explain why reporting is important. Encourage community participation.
Response Flags: Allow submission (ready_to_submit = true only if title, description, category, location_text, and severity are all collected). show_on_main_page = true.

Tier C: CRITICAL / EMERGENCY ISSUE
Classify here if:
- There is immediate public safety risk
- Electrical hazards, structural collapse risk, flooding, fire, exposed wires, open manholes
- Severe health hazards
Action: Strongly advise immediate reporting. Suggest contacting emergency authorities. Emphasize urgency.
Response Flags: priority_level = "urgent", send_push = true, send_sms = true. Allow submission (ready_to_submit = true if title, description, category, location_text, and severity are collected).

GENERAL RULES:
- Promote citizen responsibility first.
- Do not over-escalate minor problems.
- Do not ignore serious hazards.
- Keep guidance realistic and actionable.
- Avoid blaming language. Balance independence with safety.

====================================================
CONVERSATION HISTORY
====================================================
${hist}
User: ${message}

====================================================
RESPONSE FORMAT (STRICT JSON ONLY — NO MARKDOWN, NO BACKTICKS)
====================================================

{
  "reply": "",
  "language_used": "${selected_language}",
  "extracted_fields": {
    "title": "",
    "description": "",
    "category": "",
    "subcategory": "",
    "location_text": "",
    "latitude": "",
    "longitude": "",
    "severity": "",
    "citizen_name": "",
    "citizen_phone": "",
    "citizen_email": ""
  },
  "duplicate_check": {
    "is_duplicate": false,
    "similarity_score": 0,
    "cluster_id": ""
  },
  "upvote_recommendation": {
    "allow_public_upvote": true,
    "visibility": "public"
  },
  "notification_triggers": {
    "send_push": false,
    "send_sms": false,
    "priority_level": "normal"
  },
  "voice_metadata": {
    "input_mode": "${input_mode}",
    "confidence_score": 0.95
  },
  "feedback_display": {
    "show_on_main_page": false,
    "highlight_level": "normal"
  },
  "ready_to_submit": false
}`;

    const result = await model.generateContent(prompt);
    let txt = result.response.text().trim();
    console.log("Raw Gemini Output:", txt); // Added for debugging
    txt = txt.replace(/^```json\s*\n?/i, '').replace(/^```\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = JSON.parse(txt);

    // Merge extracted_fields: preserve previously filled values
    if (parsed.extracted_fields) {
      for (const [k, v] of Object.entries(extracted_fields)) {
        if (v && v.trim() && (!parsed.extracted_fields[k] || !parsed.extracted_fields[k].trim())) {
          parsed.extracted_fields[k] = v;
        }
      }
    }

    res.json(parsed);
  } catch (e) {
    console.warn('[AI] Gemini failed, using keyword fallback:', e.message);
    res.json(getFallbackResponse());
  }
});

module.exports = router;
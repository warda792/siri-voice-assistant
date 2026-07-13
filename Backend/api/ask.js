(
echo export default async function handler^(req, res^) {
echo     res.setHeader^('Access-Control-Allow-Origin', '*'^);
echo     res.setHeader^('Access-Control-Allow-Methods', 'POST, OPTIONS'^);
echo     res.setHeader^('Access-Control-Allow-Headers', 'Content-Type'^);
echo     if ^(req.method === 'OPTIONS'^) { return res.status^(200^).end^(^); }
echo     if ^(req.method !== 'POST'^) { return res.status^(405^).json^({ error: 'Method not allowed' }^); }
echo     const { message } = req.body;
echo     if ^(!message ^|^| typeof message !== 'string' ^|^| !message.trim^(^)^) { return res.status^(400^).json^({ error: 'Missing or invalid message field' }^); }
echo     const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
echo     if ^(!GEMINI_API_KEY^) { return res.status^(500^).json^({ error: 'Gemini API key not configured' }^); }
echo     try {
echo         const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
echo         const response = await fetch^(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify^({ contents: [{ parts: [{ text: `You are a helpful voice assistant. Keep replies short. User said: "${message}"` }] }] }^) }^);
echo         const data = await response.json^(^);
echo         if ^(!response.ok^) { return res.status^(response.status^).json^({ error: data.error?.message ^|^| 'Gemini API request failed' }^); }
echo         const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim^(^);
echo         if ^(!reply^) { return res.status^(502^).json^({ error: 'No response generated' }^); }
echo         res.status^(200^).json^({ reply }^);
echo     } catch ^(err^) { res.status^(500^).json^({ error: 'Internal server error' }^); }
echo }
) > ask.js


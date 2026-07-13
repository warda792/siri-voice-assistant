export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Missing or invalid "message" field' });
    }

    const GROK_API_KEY = process.env.GROK_API_KEY;

    if (!GROK_API_KEY) {
        return res.status(500).json({ error: 'Grok API key not configured' });
    }

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'grok-3-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful, friendly voice assistant. Keep replies short and conversational (1-3 sentences), since they will be read aloud.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Grok API error:', data);
            return res.status(response.status).json({ error: data.error?.message || 'Grok API request failed' });
        }

        const reply = data.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            return res.status(502).json({ error: 'No response generated' });
        }

        res.status(200).json({ reply });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

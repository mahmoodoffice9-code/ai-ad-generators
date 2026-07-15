export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { productName, productDesc } = req.body;

  if (!productName || !productDesc) {
    return res.status(400).json({ error: 'Missing product name or description' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key setup nahi hui! Vercel settings check karein.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert e-commerce copywriter. Output strictly raw JSON with keys: "facebook", "whatsapp", and "hashtags". No markdown markdown blocks.'
          },
          {
            role: 'user',
            content: `Create ad copy for:\nProduct: ${productName}\nDescription: ${productDesc}`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    // Agar OpenAI ne koi error diya (jaise billing ya quota limit)
    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({ 
        error: `OpenAI Error: ${data.error ? data.error.message : 'Response not ok'}` 
      });
    }

    const aiResponse = JSON.parse(data.choices[0].message.content.trim());
    return res.status(200).json(aiResponse);

  } catch (error) {
    // Yeh exact error response frontend ko bhejega taake blank error na aaye
    return res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
}

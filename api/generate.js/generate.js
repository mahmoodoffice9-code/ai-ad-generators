export default async function handler(req, res) {
  // Sirf POST requests allow karenge
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, productDesc } = req.body;

  if (!productName || !productDesc) {
    return res.status(400).json({ error: 'Product name and description are required' });
  }

  // Vercel par jo hum API key set karenge, ye wahan se uthayega
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Ya gpt-4o-mini jo sasta aur fast hai
        messages: [
          {
            role: 'system',
            content: 'You are an expert e-commerce copywriter. Provide your output strictly in JSON format with exactly three keys: "facebook", "whatsapp", and "hashtags". Do not include any markdown formatting like ```json or ``` in your response, just raw JSON.'
          },
          {
            role: 'user',
            content: `Create high-converting ad copy for this product:\nProduct: ${productName}\nDescription: ${productDesc}\n\nRequirements:\n1. facebook: Catchy social media post with emojis.\n2. whatsapp: Short, persuasive message with bold text (using stars like *this*) and emojis.\n3. hashtags: 5-8 trending hashtags.`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // AI ke response ko parse karke frontend ko bhejenge
    const aiResponse = JSON.parse(data.choices[0].message.content.trim());
    return res.status(200).json(aiResponse);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate ad. Please try again.' });
  }
}

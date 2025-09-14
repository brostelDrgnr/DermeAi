export default async (req, context) => {
  try {
    // 1. Recebe a pergunta que o utilizador enviou do site
    const { prompt } = await req.json();

    // 2. Pega na chave secreta de API de uma variável de ambiente segura
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // 3. Envia o pedido para o Google, agindo como um intermediário seguro
    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!googleResponse.ok) {
        throw new Error("Failed to fetch from Google API");
    }
    
    const data = await googleResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // 4. Devolve a resposta do Google de volta para o seu site
    return new Response(JSON.stringify({ text }), {
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

};

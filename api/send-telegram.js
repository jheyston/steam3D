export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers });
  }

  let body;
  try {
    body = await req.json();
  } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  // WEBHOOK from Telegram
  if (body.message) {
    const chatId = body.message?.chat?.id;
    const text = body.message?.text || '';
    const nombre = body.message?.chat?.first_name || 'estudiante';

    if (text === '/start' && chatId) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `Hola ${nombre}!\n\nBienvenido al bot Sala STEAM Salon 117 UIS.\n\nTu Chat ID es: ${chatId}\n\nCopialo y pegalo en el formulario de solicitud.`
          })
        });
      }
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  // SEND NOTIFICATION from app
  const { chatId, message, botToken } = body;

  if (!chatId || !message || !botToken) {
    return new Response(JSON.stringify({ error: 'Faltan: chatId, message, botToken' }), { status: 400, headers });
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId).trim(),
        text: String(message)
      })
    });

    const data = await r.json();

    if (!data.ok) {
      return new Response(JSON.stringify({ error: data.description, detail: data }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ success: true, messageId: data.result.message_id }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

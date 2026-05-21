export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') return new Response('ok', { status: 200, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  let chatId, message, botToken;
  try {
    const body = await req.json();
    chatId = body.chatId;
    message = body.message;
    botToken = body.botToken;
  } catch(e) {
    return new Response(JSON.stringify({ error: 'JSON invalido: ' + e.message }), { status: 400, headers });
  }

  if (!chatId || !message || !botToken) {
    return new Response(JSON.stringify({ error: 'Faltan campos', chatId: !!chatId, message: !!message, botToken: !!botToken }), { status: 400, headers });
  }

  const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: String(chatId).trim(), text: String(message) })
  });

  const data = await r.json();

  if (!data.ok) {
    return new Response(JSON.stringify({ error: data.description, code: data.error_code }), { status: 400, headers });
  }

  return new Response(JSON.stringify({ success: true, messageId: data.result.message_id }), { status: 200, headers });
}

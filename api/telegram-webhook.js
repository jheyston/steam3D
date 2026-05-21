export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = { 'Content-Type': 'application/json' };
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: true }), { status: 200, headers });

  let body;
  try { body = await req.json(); } catch(e) { return new Response(JSON.stringify({ ok: true }), { status: 200, headers }); }

  const msg = body.message;
  if (msg && msg.text === '/start') {
    const chatId = msg.chat?.id;
    const nombre = msg.chat?.first_name || 'estudiante';
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Hola ${nombre}!\n\nBienvenido al bot Sala STEAM Salon 117 UIS.\n\nTu Chat ID es: ${chatId}\n\nCopialo y pegalo en el formulario de solicitud de impresion 3D.`
        })
      });
    }
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

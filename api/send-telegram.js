export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = req.body || {};

  // ── WEBHOOK: Telegram envía POST cuando el usuario escribe al bot
  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat?.id;
    const text = msg.text || '';
    const nombre = msg.chat?.first_name || 'estudiante';

    if (text === '/start' && chatId) {
      // Leer token desde variable de entorno o desde query param
      const botToken = process.env.TELEGRAM_BOT_TOKEN || req.query.token;

      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            parse_mode: 'MarkdownV2',
            text: `👋 Hola *${nombre}*\\!\n\nBienvenido al bot de la *Sala STEAM · Salón 117 · UIS*\\.\n\n✅ Tu *Chat ID* es:\n\n\`${chatId}\`\n\n📋 Cópialo y pégalo en el campo *"Chat ID de Telegram"* del formulario de solicitud\\.\n\n📍 _Universidad Industrial de Santander_`
          })
        });
      }
    }
    return res.status(200).json({ ok: true });
  }

  // ── ENVÍO DE NOTIFICACIONES: la app llama aquí con POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { chatId, message, botToken } = body;
  if (!chatId || !message || !botToken) {
    return res.status(400).json({ error: 'Faltan: chatId, message, botToken' });
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: String(chatId).trim(), text: message, parse_mode: 'MarkdownV2' })
    });
    const data = await r.json();
    console.log('Telegram response:', JSON.stringify(data));
    if (!data.ok) return res.status(400).json({ error: data.description, detail: data });
    return res.status(200).json({ success: true, messageId: data.result?.message_id, telegramResponse: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Log everything to diagnose
  console.log('Method:', req.method);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Body:', JSON.stringify(req.body));

  const body = req.body || {};

  // WEBHOOK from Telegram (has body.message)
  if (body.message) {
    const chatId = body.message?.chat?.id;
    const text = body.message?.text || '';
    const nombre = body.message?.chat?.first_name || 'estudiante';
    console.log('Webhook message from chatId:', chatId, 'text:', text);

    if (text === '/start' && chatId) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        const reply = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `Hola ${nombre}!\n\nBienvenido al bot de la Sala STEAM Salon 117 UIS.\n\nTu Chat ID es: ${chatId}\n\nCopialo y pegalo en el formulario de solicitud de impresion.`
          })
        });
        const replyData = await reply.json();
        console.log('Start reply:', JSON.stringify(replyData));
      }
    }
    return res.status(200).json({ ok: true });
  }

  // SEND NOTIFICATION from the app (has chatId, message, botToken)
  const { chatId, message, botToken } = body;

  console.log('Notification request - chatId:', chatId, 'hasMessage:', !!message, 'hasToken:', !!botToken);

  if (!chatId || !message || !botToken) {
    console.log('Missing fields');
    return res.status(400).json({ error: 'Faltan campos: chatId=' + chatId + ' message=' + !!message + ' botToken=' + !!botToken });
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('Calling Telegram API...');

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId).trim(),
        text: String(message)
      })
    });

    const data = await r.json();
    console.log('Telegram response:', JSON.stringify(data));

    if (!data.ok) {
      return res.status(400).json({ error: data.description, detail: data });
    }

    return res.status(200).json({ success: true, messageId: data.result.message_id });
  } catch (err) {
    console.log('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

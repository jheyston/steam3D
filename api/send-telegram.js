export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { chatId, message, botToken } = req.body;

  if (!chatId || !message || !botToken) {
    return res.status(400).json({ error: 'Faltan campos: chatId, message, botToken' });
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (!data.ok) {
      return res.status(400).json({ error: data.description || 'Error de Telegram', detail: data });
    }

    return res.status(200).json({ success: true, messageId: data.result.message_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

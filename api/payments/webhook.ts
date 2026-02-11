import crypto from 'crypto';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!webhookSecret) {
      return res.status(500).json({ error: 'Missing RAZORPAY_WEBHOOK_SECRET' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const payload = JSON.stringify(req.body);

    const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

    if (!signature || expected !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    return res.status(200).json({ ok: true, event: req.body?.event || 'unknown' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message || 'Webhook failure' });
  }
}

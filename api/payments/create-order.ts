import { createRazorpayOrder } from '../_lib/razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, userId, purpose } = req.body || {};
    if (!amount || !userId) {
      return res.status(400).json({ error: 'amount and userId are required' });
    }

    const amountPaise = Number(amount);
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return res.status(400).json({ error: 'amount must be at least 100 paise' });
    }

    const receipt = `freshleaf_${purpose || 'payment'}_${Date.now()}`;
    const order = await createRazorpayOrder(amountPaise, receipt, { userId, purpose: purpose || 'checkout' });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error('Create order API error:', error);
    return res.status(500).json({ error: error.message || 'Unable to create payment order' });
  }
}

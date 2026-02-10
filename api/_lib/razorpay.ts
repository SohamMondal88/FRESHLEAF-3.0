import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error('Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
}

const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

export const createRazorpayOrder = async (amount: number, receipt: string, notes?: Record<string, string>) => {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
      payment_capture: 1,
      notes: notes || {}
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay create order failed: ${errorText}`);
  }

  return response.json();
};

export const verifyRazorpaySignature = (orderId: string, paymentId: string, signature: string) => {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === signature;
};

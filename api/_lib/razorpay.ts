import crypto from 'crypto';

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Missing server envs: RAZORPAY_KEY_ID and/or RAZORPAY_KEY_SECRET');
  }
  return { keyId, keySecret };
};

export const createRazorpayOrder = async (amount: number, receipt: string, notes?: Record<string, string>) => {
  const { keyId, keySecret } = getRazorpayCredentials();
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

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
  const { keySecret } = getRazorpayCredentials();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === signature;
};

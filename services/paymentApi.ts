interface CreateOrderPayload {
  amountPaise: number;
  userId: string;
  purpose: 'checkout' | 'wallet_topup';
}

export const createServerOrder = async ({ amountPaise, userId, purpose }: CreateOrderPayload) => {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: amountPaise, userId, purpose })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Unable to create payment order' }));
    throw new Error(data.error || 'Unable to create payment order');
  }

  return response.json();
};

interface VerifyPayload {
  userId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  paymentMethod?: string;
  walletUsed?: number;
  orderId?: string;
  purpose: 'checkout' | 'wallet_topup';
}

export const verifyServerPayment = async (payload: VerifyPayload) => {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Payment verification failed' }));
    throw new Error(data.error || 'Payment verification failed');
  }

  return response.json();
};

/**
 * Razorpay Payment Gateway Integration Helper for Aalaya Vastra.
 * Supports standard Razorpay Checkout SDK.
 */

import { BRAND } from '../config/brand';

/**
 * Loads the Razorpay checkout script if not already present on window.
 * @returns {Promise<boolean>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Open the Razorpay Checkout modal with order & customer details.
 *
 * @param {Object} params
 * @param {string} params.orderId - Internal order ID (e.g. AV-123456)
 * @param {number} params.amount - Total amount in INR (will be converted to paise)
 * @param {Object} params.customer - { fullName, email, phone, address }
 * @param {string} [params.description] - Description shown on Razorpay checkout
 * @param {Function} params.onSuccess - Callback on payment success: ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => void
 * @param {Function} [params.onFailure] - Callback on payment failure: (error) => void
 * @param {Function} [params.onDismiss] - Callback when user closes or dismisses the modal
 */
export async function openRazorpayCheckout({
  orderId,
  amount,
  customer,
  description = `Order ${orderId} - ${BRAND.name}`,
  onSuccess,
  onFailure,
  onDismiss,
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    const errorMsg = 'Razorpay SDK failed to load. Please check your internet connection and try again.';
    if (onFailure) onFailure(new Error(errorMsg));
    return;
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TYMDeidWqhpxfL';

  const amountInPaise = Math.round(Number(amount) * 100);

  const options = {
    key: keyId,
    amount: amountInPaise,
    currency: 'INR',
    name: BRAND.name,
    description: description,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
    prefill: {
      name: customer?.fullName || '',
      email: customer?.email || '',
      contact: customer?.phone || '',
    },
    notes: {
      order_id: orderId,
      shipping_address: `${customer?.address || ''}, ${customer?.city || ''} ${customer?.pincode || ''}`.trim(),
    },
    theme: {
      color: '#6B1518', // Aalaya Vastra brand maroon
      backdrop_color: 'rgba(0, 0, 0, 0.7)',
    },
    modal: {
      backdropclose: false,
      escape: true,
      handleback: true,
      confirm_close: true,
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
    },
    handler: function (response) {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.warn('Razorpay payment failed:', response.error);
      if (onFailure) {
        onFailure(response.error);
      }
    });
    rzp.open();
  } catch (err) {
    console.error('Error opening Razorpay modal:', err);
    if (onFailure) onFailure(err);
  }
}

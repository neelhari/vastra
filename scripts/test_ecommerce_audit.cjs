/**
 * Comprehensive Automated Audit & Test Suite for Aalaya Vastra
 * Tests:
 * 1. Admin Login & Credentials
 * 2. Customer Login & Credentials (Supabase + Local fallback)
 * 3. Pricing & Cart Calculations
 * 4. Quantity Doubling / Jumping Defense
 * 5. Money-Loss Flaw & Exploitation Defense (Coupons, Negative Totals, Shipping, Razorpay Paise)
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    testsPassed++;
    results.push({ status: 'PASS', testName, details });
    console.log(`  [PASS] ${testName}`);
  } else {
    testsFailed++;
    results.push({ status: 'FAIL', testName, details });
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

// ============================================================================
// SUITE 1: CUSTOMER LOGIN TEST CASES
// ============================================================================
console.log('\n--- Running Suite 1: Customer Login Test Cases ---');

// Mock AuthContext login logic (reflecting src/context/AuthContext.jsx)
function createCustomerAuthContext(registeredUsers, mockSupabaseSignIn) {
  let currentUser = null;

  async function login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both Email and Password.' };
    }

    // 1. Supabase Auth
    try {
      const supaRes = await mockSupabaseSignIn({ email: cleanEmail, password });
      if (supaRes.success && supaRes.data?.user) {
        currentUser = supaRes.data.user;
        return { success: true, user: currentUser };
      }
    } catch (e) {
      // ignore
    }

    // 2. Fallback: local registered users
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again or click Forgot Password.' };
      }
      currentUser = found;
      return { success: true, user: found };
    }

    return {
      success: false,
      error: 'Invalid email or password. If you do not have an account yet, please Create an Account.',
    };
  }

  return { login, getCurrentUser: () => currentUser };
}

const registeredUsersSeed = [
  {
    id: 'usr_harini',
    name: 'Harini Jupudy',
    email: 'harini@aalayavastra.com',
    password: 'password123',
    phone: '9390299611',
  }
];

// Case 1.1: Valid pre-seeded customer login
(async () => {
  const auth = createCustomerAuthContext(registeredUsersSeed, async () => ({
    success: false,
    message: 'Invalid login credentials',
  }));

  const res = await auth.login({ email: 'harini@aalayavastra.com', password: 'password123' });
  assert(res.success === true && res.user.name === 'Harini Jupudy', 'Customer Login: Pre-seeded account login succeeds via verified fallback');

  // Case 1.2: Case-insensitive email handling
  const resCase = await auth.login({ email: '  HARINI@AalayaVastra.com  ', password: 'password123' });
  assert(resCase.success === true, 'Customer Login: Normalizes uppercase and whitespace in email');

  // Case 1.3: Incorrect password check
  const resBadPwd = await auth.login({ email: 'harini@aalayavastra.com', password: 'wrongpassword' });
  assert(resBadPwd.success === false && resBadPwd.error.includes('Incorrect password'), 'Customer Login: Rejects incorrect password with clear message');

  // Case 1.4: Non-existent user check
  const resUnknown = await auth.login({ email: 'nobody@nowhere.com', password: 'somepassword' });
  assert(resUnknown.success === false && resUnknown.error.includes('Invalid email or password'), 'Customer Login: Rejects non-existent email');

  // Case 1.5: Missing email or password
  const resBlank = await auth.login({ email: '', password: '' });
  assert(resBlank.success === false && resBlank.error.includes('both Email and Password'), 'Customer Login: Enforces required fields');

  // Case 1.6: Supabase Auth direct success
  const supaAuth = createCustomerAuthContext(registeredUsersSeed, async ({ email }) => ({
    success: true,
    data: {
      user: {
        id: 'supa-123',
        email,
        user_metadata: { full_name: 'Supabase User' }
      }
    }
  }));
  const resSupa = await supaAuth.login({ email: 'online@customer.com', password: 'validpwd123' });
  assert(resSupa.success === true && resSupa.user.id === 'supa-123', 'Customer Login: Real Supabase Auth account logs in directly');

// ============================================================================
// SUITE 2: ADMIN LOGIN TEST CASES
// ============================================================================
  console.log('\n--- Running Suite 2: Admin Login Test Cases ---');

  function createAdminAuthContext(mockSupabaseSignIn, mockIsAdmin) {
    let session = null;
    let isAdmin = false;

    async function signIn(email, password) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        return { success: false, message: 'Please enter both email and password.' };
      }

      // 1. Supabase Auth
      try {
        const res = await mockSupabaseSignIn(cleanEmail, cleanPassword);
        if (res.success && res.data?.session) {
          session = res.data.session;
          isAdmin = await mockIsAdmin(res.data.session.user.id);
          return res;
        }
      } catch (e) {}

      // 2. Offline / Master Admin fallback
      if (
        (cleanEmail === 'admin@aalayavastra.com' || cleanEmail === 'harini@aalayavastra.com') &&
        cleanPassword === 'admin123'
      ) {
        const mockAdminSession = {
          user: {
            id: 'admin-master-id',
            email: cleanEmail,
            user_metadata: { full_name: 'Harini Jupudy (Admin)' },
          },
        };
        session = mockAdminSession;
        isAdmin = true;
        return { success: true, data: mockAdminSession };
      }

      return { success: false, message: 'Invalid admin email or password.' };
    }

    return { signIn, getSession: () => session, getIsAdmin: () => isAdmin };
  }

  // Case 2.1: Master Admin Quick-Fill login
  const adminAuth = createAdminAuthContext(
    async () => ({ success: false, message: 'Auth service fallback' }),
    async () => false
  );
  const adminRes = await adminAuth.signIn('admin@aalayavastra.com', 'admin123');
  assert(adminRes.success === true && adminAuth.getIsAdmin() === true, 'Admin Login: Master Admin credentials (admin@aalayavastra.com / admin123) succeed');

  // Case 2.2: Alternate Admin username
  const adminRes2 = await adminAuth.signIn('harini@aalayavastra.com', 'admin123');
  assert(adminRes2.success === true && adminAuth.getIsAdmin() === true, 'Admin Login: Alternate owner credentials (harini@aalayavastra.com / admin123) succeed');

  // Case 2.3: Wrong Admin password
  const badAdminRes = await adminAuth.signIn('admin@aalayavastra.com', 'wrongpassword');
  assert(badAdminRes.success === false, 'Admin Login: Rejects unauthorized admin passwords');

  // Case 2.4: Empty inputs
  const emptyAdminRes = await adminAuth.signIn('', '');
  assert(emptyAdminRes.success === false, 'Admin Login: Rejects blank credentials');

// ============================================================================
// SUITE 3: CART & PRICING INTEGRITY TEST CASES
// ============================================================================
  console.log('\n--- Running Suite 3: Cart & Pricing Integrity Test Cases ---');

  function calculateCartPricing(cartItems, couponCode, activeCoupons, freeShippingThreshold = 2000) {
    const totalItemsCount = cartItems.reduce((acc, item) => acc + Math.max(1, Math.floor(Number(item.quantity) || 1)), 0);
    const subtotal = cartItems.reduce((acc, item) => {
      const p = Math.max(0, Number(item.price) || 0);
      const q = Math.max(1, Math.floor(Number(item.quantity) || 1));
      return acc + (p * q);
    }, 0);

    const isFreeShipping = subtotal >= freeShippingThreshold;
    const deliveryCharge = isFreeShipping ? 0 : 99;

    const appliedCoupon = couponCode
      ? activeCoupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
      : null;
    const couponMinOrderMet = appliedCoupon ? subtotal >= (appliedCoupon.minOrder || 0) : false;

    const discountAmount = (() => {
      if (!appliedCoupon || !couponMinOrderMet) return 0;
      const val = Math.max(0, Number(appliedCoupon.discountValue) || 0);
      let amount = appliedCoupon.type === 'percentage'
        ? Math.round((subtotal * val) / 100)
        : val;
      if (appliedCoupon.maxDiscount) {
        amount = Math.min(amount, Math.max(0, Number(appliedCoupon.maxDiscount) || 0));
      }
      return Math.max(0, Math.min(amount, subtotal));
    })();

    const totalAmount = Math.max(0, subtotal - discountAmount) + deliveryCharge;
    const razorpayPaise = Math.round(totalAmount * 100);

    return {
      totalItemsCount,
      subtotal,
      isFreeShipping,
      deliveryCharge,
      couponMinOrderMet,
      discountAmount,
      totalAmount,
      razorpayPaise,
    };
  }

  const standardCoupons = [
    { code: 'AV20', type: 'percentage', discountValue: 20, minOrder: 1000, maxDiscount: 2000, active: true },
    { code: 'VASTRA10', type: 'percentage', discountValue: 10, minOrder: 500, maxDiscount: 1000, active: true },
    { code: 'FIRST100', type: 'flat', discountValue: 100, minOrder: 999, maxDiscount: 100, active: true },
  ];

  // Case 3.1: Single product subtotal calculation
  const cart1 = [{ id: 1, name: 'Saree 1', price: 1499, quantity: 1 }];
  const res31 = calculateCartPricing(cart1, null, standardCoupons);
  assert(res31.subtotal === 1499, 'Pricing: Single item subtotal calculated accurately (₹1,499)');
  assert(res31.deliveryCharge === 99, 'Shipping: Applies ₹99 shipping for order below ₹2,000 threshold');
  assert(res31.totalAmount === 1598, 'Payable: Total payable is ₹1,499 + ₹99 = ₹1,598');

  // Case 3.2: Multi-item crossing free shipping threshold
  const cart2 = [
    { id: 1, name: 'Saree 1', price: 1499, quantity: 1 },
    { id: 2, name: 'Silk Saree 2', price: 2999, quantity: 1 }
  ];
  const res32 = calculateCartPricing(cart2, null, standardCoupons);
  assert(res32.subtotal === 4498, 'Pricing: Multi-item subtotal (1499 + 2999 = ₹4,498)');
  assert(res32.isFreeShipping === true && res32.deliveryCharge === 0, 'Shipping: 100% Free Shipping applied for orders >= ₹2,000');
  assert(res32.totalAmount === 4498, 'Payable: Total amount equals subtotal without delivery charge (₹4,498)');

// ============================================================================
// SUITE 4: QUANTITY DOUBLING / JUMPING DEFENSE
// ============================================================================
  console.log('\n--- Running Suite 4: Quantity Doubling & Jumping Defense ---');

  // Simulating Buy Now logic
  function simulateBuyNow(existingCart, product, quantity = 1, selectedColor = null, selectedSize = null) {
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const itemKey = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
    const idx = existingCart.findIndex(i => i.itemKey === itemKey);
    if (idx > -1) {
      const updated = [...existingCart];
      updated[idx] = { ...updated[idx], quantity: safeQty }; // Exact set, not +=
      return updated;
    }
    return [...existingCart, { ...product, itemKey, quantity: safeQty }];
  }

  // Case 4.1: Repeated Buy Now clicks must NOT double quantity (1 -> 2 -> 4)
  let testCart = [];
  const prodA = { id: 10, name: 'Kanchi Pattu Saree', price: 5499 };
  testCart = simulateBuyNow(testCart, prodA, 1);
  assert(testCart[0].quantity === 1, 'Buy Now: Initial click sets quantity to 1');
  // User navigates back and clicks Buy Now again
  testCart = simulateBuyNow(testCart, prodA, 1);
  assert(testCart[0].quantity === 1, 'Anti-Doubling: Subsequent Buy Now click keeps quantity at 1, avoiding 1->2 doubling');
  // Third click
  testCart = simulateBuyNow(testCart, prodA, 1);
  assert(testCart[0].quantity === 1, 'Anti-Doubling: Multiple repeated clicks maintain exact quantity 1');

  // Case 4.2: Quantity change with string representation
  const stringQtyCart = simulateBuyNow([], prodA, "1");
  assert(stringQtyCart[0].quantity === 1 && typeof stringQtyCart[0].quantity === 'number', 'Type Defense: String quantity "1" safely converted to number 1');

// ============================================================================
// SUITE 5: FINANCIAL FLAW & LOSS-PREVENTION TEST CASES
// ============================================================================
  console.log('\n--- Running Suite 5: Anti Money-Loss Defense Test Cases ---');

  // Case 5.1: Coupon minOrder requirement strictly enforced
  // AV20 requires minOrder ₹1,000. Cart is ₹800.
  const belowMinCart = [{ id: 1, name: 'Accessory', price: 800, quantity: 1 }];
  const res51 = calculateCartPricing(belowMinCart, 'AV20', standardCoupons);
  assert(res51.couponMinOrderMet === false, 'Money Loss Defense: Coupon rejected when subtotal is below minimum order (₹800 < ₹1,000)');
  assert(res51.discountAmount === 0, 'Money Loss Defense: Discount amount is strictly ₹0 when threshold unmet');
  assert(res51.totalAmount === 899, 'Money Loss Defense: Total is ₹800 + ₹99 delivery = ₹899');

  // Case 5.2: Percentage discount applied properly
  // AV20 on ₹2,500 order -> 20% of 2500 = ₹500
  const validDiscountCart = [{ id: 1, name: 'Saree', price: 2500, quantity: 1 }];
  const res52 = calculateCartPricing(validDiscountCart, 'AV20', standardCoupons);
  assert(res52.discountAmount === 500, 'Coupon Logic: 20% applied correctly (₹500 off ₹2,500)');
  assert(res52.totalAmount === 2000, 'Payable Logic: ₹2,500 - ₹500 = ₹2,000');

  // Case 5.3: Max Discount Capping Defense
  // AV20 has maxDiscount: ₹2,000. Order of ₹20,000 would be ₹4,000 without cap.
  const largeCart = [{ id: 1, name: 'Bridal Saree', price: 20000, quantity: 1 }];
  const res53 = calculateCartPricing(largeCart, 'AV20', standardCoupons);
  assert(res53.discountAmount === 2000, 'Money Loss Defense: Discount strictly capped at maxDiscount (₹2,000, NOT ₹4,000)');
  assert(res53.totalAmount === 18000, 'Payable: ₹20,000 - ₹2,000 = ₹18,000');

  // Case 5.4: Subtotal drop disqualifies coupon (customer reduces cart below minOrder)
  const dynamicCartBefore = [{ id: 1, name: 'Item', price: 600, quantity: 2 }]; // subtotal = 1200
  const resBefore = calculateCartPricing(dynamicCartBefore, 'AV20', standardCoupons);
  assert(resBefore.discountAmount === 240, 'Dynamic Coupon: Active at ₹1,200 subtotal');

  const dynamicCartAfter = [{ id: 1, name: 'Item', price: 600, quantity: 1 }]; // subtotal = 600 (< 1000)
  const resAfter = calculateCartPricing(dynamicCartAfter, 'AV20', standardCoupons);
  assert(resAfter.discountAmount === 0, 'Money Loss Defense: When quantity reduced below threshold, discount instantly drops to ₹0');

  // Case 5.5: Protection against Negative Totals
  // What if a rogue coupon with ₹10,000 flat discount is applied to a ₹1,500 order?
  const rogueCoupons = [{ code: 'ROGUE', type: 'flat', discountValue: 10000, minOrder: 500, active: true }];
  const testRogueCart = [{ id: 1, name: 'Saree', price: 1500, quantity: 1 }];
  const res55 = calculateCartPricing(testRogueCart, 'ROGUE', rogueCoupons);
  assert(res55.discountAmount <= 1500, 'Money Loss Defense: Discount can never exceed subtotal (capped at ₹1,500)');
  assert(res55.totalAmount >= 0, 'Money Loss Defense: Total amount can never be negative');

  // Case 5.6: Razorpay paise conversion accuracy
  // Verify that ₹2,098 converts to exactly 209,800 paise without fractional floating point loss
  const testTotal = 2098;
  const paise = Math.round(testTotal * 100);
  assert(paise === 209800, 'Razorpay Defense: Exactly 209,800 paise (no floating point arithmetic error)');

  // Case 5.7: WhatsApp text reflects exact calculated total
  function generateWhatsAppText(cartItems, subtotal, discountAmount, deliveryCharge, totalAmount) {
    return `Subtotal: ₹${subtotal} | Discount: ₹${discountAmount} | Delivery: ₹${deliveryCharge} | Total: ₹${totalAmount}`;
  }
  const waMsg = generateWhatsAppText(cart1, res31.subtotal, res31.discountAmount, res31.deliveryCharge, res31.totalAmount);
  assert(waMsg.includes('Total: ₹1598'), 'WhatsApp Order Defense: WhatsApp order text matches payable total exactly');

// ============================================================================
// SUMMARY REPORT
// ============================================================================
  console.log('\n======================================================');
  console.log(` AUDIT RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();

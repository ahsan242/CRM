# Stripe Payment Integration Setup

## Installation

1. Install the required Stripe packages:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Environment Variables

Add your Stripe Publishable Key to your `.env` file in the frontend directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Getting Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
3. Add it to your `.env` file as `VITE_STRIPE_PUBLISHABLE_KEY`

### Backend Setup

Make sure your backend `.env` file has:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Testing

Use these test card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date (e.g., 12/25) and any 3-digit CVC.

## How It Works

1. User adds products to cart
2. User clicks "Proceed to Checkout"
3. User fills shipping/billing information
4. Order is created in the backend
5. Payment Intent is created with Stripe
6. User enters card details using Stripe Elements
7. Payment is confirmed
8. Order status is updated to "confirmed" and payment status to "paid"
9. User is redirected to order details page


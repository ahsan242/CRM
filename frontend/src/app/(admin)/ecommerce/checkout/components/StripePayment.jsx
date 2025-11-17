import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button, Alert, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';
import './stripe.css';

// Initialize Stripe - You'll need to set your Stripe publishable key
// For now, we'll use a placeholder. Set STRIPE_PUBLISHABLE_KEY in your .env file
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

// Payment Form Component
const PaymentForm = ({ clientSecret, amount, orderId, onSuccess, onError, loading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
  }, [stripe, elements]);

  const handleChange = (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        onError(stripeError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment failed. Please try again.');
        setProcessing(false);
        onError('Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      setProcessing(false);
      onError(err.message || 'Payment failed');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#495057',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#6c757d',
        },
        ':-webkit-autofill': {
          color: '#495057',
        },
      },
      invalid: {
        color: '#dc3545',
        iconColor: '#dc3545',
        '::placeholder': {
          color: '#dc3545',
        },
      },
      complete: {
        iconColor: '#28a745',
      },
    },
    hidePostalCode: false,
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="form-label fw-semibold mb-3">
          <IconifyIcon icon="bx:credit-card" className="me-2" />
          Card Information
        </label>
        <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
          <CardElement
            options={cardElementOptions}
            onChange={handleChange}
          />
        </div>
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            <IconifyIcon icon="bx:error-circle" className="me-2" />
            {error}
          </Alert>
        )}
      </div>

      <div className="mb-3">
        <Alert variant="info" className="mb-0">
          <IconifyIcon icon="bx:info-circle" className="me-2" />
          <strong>Test Card:</strong> Use 4242 4242 4242 4242 with any future expiry date and any CVC
        </Alert>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-100"
        disabled={!stripe || disabled || processing || loading}
      >
        {processing || loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <IconifyIcon icon="bx:credit-card" className="me-2" />
            Pay {currency}{parseFloat(amount || 0).toFixed(2)}
          </>
        )}
      </Button>
    </Form>
  );
};

// Main Stripe Payment Component
const StripePayment = ({ clientSecret, paymentIntentId, amount, orderId, onSuccess, onError, loading }) => {
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    // Check if Stripe is properly configured
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey || publishableKey === 'pk_test_placeholder') {
      setStripeError('Stripe publishable key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.');
    }
  }, []);

  if (stripeError) {
    return (
      <Alert variant="warning">
        <IconifyIcon icon="bx:error-circle" className="me-2" />
        <strong>Stripe Setup Required:</strong>
        <br />
        {stripeError}
        <br />
        <small className="mt-2 d-block">
          <strong>Steps to setup:</strong>
          <ol className="mt-2 mb-0">
            <li>Install packages: <code>npm install @stripe/stripe-js @stripe/react-stripe-js</code></li>
            <li>Get your publishable key from: <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">Stripe Dashboard</a></li>
            <li>Add to <code>.env</code>: <code>VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key</code></li>
            <li>Restart your dev server</li>
          </ol>
          See <code>STRIPE_SETUP.md</code> for detailed instructions.
        </small>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="warning">
        <IconifyIcon icon="bx:error-circle" className="me-2" />
        Payment intent not initialized. Please try again.
      </Alert>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        clientSecret={clientSecret}
        amount={amount}
        orderId={orderId}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
      />
    </Elements>
  );
};

export default StripePayment;


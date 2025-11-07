// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// class StripeService {
//   constructor() {
//     this.stripe = stripe;
//   }

//   // Create a payment intent
//   async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
//     try {
//       const paymentIntent = await this.stripe.paymentIntents.create({
//         amount: Math.round(amount * 100), // Convert to cents
//         currency,
//         metadata,
//         automatic_payment_methods: {
//           enabled: true,
//         },
//       });

//       return {
//         success: true,
//         clientSecret: paymentIntent.client_secret,
//         paymentIntentId: paymentIntent.id,
//         amount: paymentIntent.amount / 100,
//       };
//     } catch (error) {
//       console.error('Stripe payment intent error:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }

//   // Confirm payment intent
//   async confirmPaymentIntent(paymentIntentId) {
//     try {
//       const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
//       return {
//         success: true,
//         paymentIntent,
//         status: paymentIntent.status
//       };
//     } catch (error) {
//       console.error('Stripe confirm payment error:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }

//   // Create refund
//   async createRefund(paymentIntentId, amount = null) {
//     try {
//       const refundData = {
//         payment_intent: paymentIntentId,
//       };

//       if (amount) {
//         refundData.amount = Math.round(amount * 100);
//       }

//       const refund = await this.stripe.refunds.create(refundData);

//       return {
//         success: true,
//         refund,
//         refundId: refund.id
//       };
//     } catch (error) {
//       console.error('Stripe refund error:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }

//   // Create customer in Stripe
//   async createCustomer(user) {
//     try {
//       const customer = await this.stripe.customers.create({
//         email: user.email,
//         name: user.name,
//         metadata: {
//           userId: user.id
//         }
//       });

//       return {
//         success: true,
//         customerId: customer.id
//       };
//     } catch (error) {
//       console.error('Stripe customer creation error:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }
// }

// module.exports = new StripeService();

// Initialize Stripe with proper error handling
let stripe;
try {
  const Stripe = require('stripe');
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.warn('⚠️ Stripe not initialized. Payment features will be disabled.');
  stripe = null;
}

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // Create a payment intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntent,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe confirm payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount = null) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refund,
        refundId: refund.id
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create customer in Stripe
  async createCustomer(user) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });

      return {
        success: true,
        customerId: customer.id
      };
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if Stripe is configured
  isConfigured() {
    return this.stripe !== null;
  }
}

module.exports = new StripeService();
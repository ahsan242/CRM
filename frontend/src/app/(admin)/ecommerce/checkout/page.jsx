import { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Col, Row, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useCart } from '@/context/CartContext';
import { useAuthContext } from '@/context/useAuthContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { currency } from '@/context/constants';
import * as orderService from '@/http/order';
import CheckoutForm from './components/CheckoutForm';
import OrderSummary from './components/OrderSummary';
import StripePayment from './components/StripePayment';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, getCartTotals, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();
  
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [step, setStep] = useState('checkout'); // 'checkout' or 'payment'

  useEffect(() => {
    if (!isAuthenticated || !user) {
      showNotification({
        message: 'Please sign in to checkout',
        variant: 'warning'
      });
      navigate('/auth/sign-in', { state: { from: '/ecommerce/checkout' } });
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      showNotification({
        message: 'Your cart is empty',
        variant: 'warning'
      });
      navigate('/ecommerce/cart');
      return;
    }
    // Don't call fetchCart here - CartContext already handles fetching
    // This was causing infinite loops
  }, [isAuthenticated, user?.id, cart?.id, navigate, showNotification]);

  const { totalAmount, totalItems } = getCartTotals();

  const handleCreateOrder = async (formData) => {
    if (!cart || !cart.id) {
      showNotification({
        message: 'Cart not found. Please try again.',
        variant: 'danger'
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        cartId: cart.id,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress || formData.shippingAddress,
        paymentMethod: formData.paymentMethod || 'stripe',
        shippingMethod: formData.shippingMethod || 'standard',
        notes: formData.notes || '',
        customerNotes: formData.customerNotes || '',
        useProfileAddress: formData.useProfileAddress || false,
        taxRate: 0.1, // 10% tax
        shippingCost: formData.shippingMethod === 'express' ? 25.00 : 10.00
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        setOrder(response.data);
        showNotification({
          message: 'Order created successfully! Proceeding to payment...',
          variant: 'success'
        });
        
        // Create payment intent
        await handleCreatePaymentIntent(response.data.id);
      } else {
        showNotification({
          message: response.error || 'Failed to create order',
          variant: 'danger'
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification({
        message: error.response?.data?.error || 'Failed to create order. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentIntent = async (orderId) => {
    try {
      const response = await orderService.createPaymentIntent(orderId);
      
      if (response.success) {
        setPaymentIntent(response.data);
        setStep('payment');
      } else {
        showNotification({
          message: response.error || 'Failed to initialize payment',
          variant: 'danger'
        });
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      showNotification({
        message: error.response?.data?.error || 'Failed to initialize payment',
        variant: 'danger'
      });
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    if (!order) return;

    setLoading(true);
    try {
      const response = await orderService.confirmPayment(order.id, paymentIntentId);
      
      if (response.success) {
        showNotification({
          message: 'Payment successful! Your order has been confirmed.',
          variant: 'success'
        });
        
        // Refresh cart to clear it (since backend marks it as converted)
        await fetchCart();
        
        // Redirect to order details after a short delay
        setTimeout(() => {
          navigate(`/ecommerce/orders/${order.id}`, { replace: true });
        }, 1500);
      } else {
        showNotification({
          message: response.error || 'Payment confirmation failed',
          variant: 'danger'
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      showNotification({
        message: error.response?.data?.error || 'Payment confirmation failed',
        variant: 'danger'
      });
      setLoading(false);
    }
  };

  if (cartLoading || !cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        <PageMetaData title="Checkout" />
        <PageBreadcrumb title="Checkout" subName="Ecommerce" />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMetaData title="Checkout" />
      <PageBreadcrumb title="Checkout" subName="Ecommerce" />
      
      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-4">
                {step === 'checkout' ? 'Shipping & Billing Information' : 'Payment'}
              </CardTitle>
              
              {step === 'checkout' ? (
                <CheckoutForm
                  onSubmit={handleCreateOrder}
                  loading={loading}
                  user={user}
                />
              ) : (
                <div>
                  <Alert variant="info" className="mb-4">
                    <IconifyIcon icon="bx:info-circle" className="me-2" />
                    Please complete your payment to confirm your order #{order?.orderNumber || order?.id}.
                  </Alert>
                  
                  {paymentIntent && order && (
                    <div>
                      <div className="mb-4 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Order Total:</span>
                          <strong className="fs-5">{currency}{parseFloat(order.totalAmount || 0).toFixed(2)}</strong>
                        </div>
                        <small className="text-muted">
                          Payment Intent: {paymentIntent.paymentIntentId}
                        </small>
                      </div>

                      <StripePayment
                        clientSecret={paymentIntent.clientSecret}
                        paymentIntentId={paymentIntent.paymentIntentId}
                        amount={order.totalAmount}
                        orderId={order.id}
                        onSuccess={handlePaymentSuccess}
                        onError={(error) => {
                          showNotification({
                            message: error || 'Payment failed. Please try again.',
                            variant: 'danger'
                          });
                        }}
                        loading={loading}
                      />

                      <div className="mt-3 text-center">
                        <Button
                          variant="outline-secondary"
                          onClick={() => setStep('checkout')}
                          disabled={loading}
                        >
                          <IconifyIcon icon="bx:arrow-back" className="me-2" />
                          Back to Shipping
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <OrderSummary
            cart={cart}
            order={order}
            totalAmount={totalAmount}
            totalItems={totalItems}
          />
        </Col>
      </Row>
    </>
  );
};

export default Checkout;


import api from "../api";

// ====================== ORDER API FUNCTIONS ======================

// Create order from cart
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Create payment intent for Stripe
export const createPaymentIntent = async (orderId) => {
  try {
    const response = await api.post('/api/orders/payment-intent', { orderId });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment
export const confirmPayment = async (orderId, paymentIntentId) => {
  try {
    const response = await api.post('/api/orders/confirm-payment', {
      orderId,
      paymentIntentId
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Get all orders
export const getOrders = async (params = {}) => {
  try {
    const response = await api.get('/api/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get user order history
export const getUserOrderHistory = async () => {
  try {
    const response = await api.get('/api/orders/user/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

// Get order statistics
export const getOrderStatistics = async () => {
  try {
    const response = await api.get('/api/orders/user/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, notes) => {
  try {
    const response = await api.put(`/api/orders/${orderId}/status`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.put(`/api/orders/${orderId}/cancel`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Get sales analytics
export const getSalesAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/api/orders/analytics/sales', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    throw error;
  }
};

// Get financial reports
export const getFinancialReports = async (params = {}) => {
  try {
    const response = await api.get('/api/orders/analytics/financial-reports', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    throw error;
  }
};


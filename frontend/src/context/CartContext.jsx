import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import * as cartService from '@/http/cart';
import { useNotificationContext } from './useNotificationContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        loading: false
      };
    case 'ADD_ITEM':
      return {
        ...state,
        cart: action.payload,
        loading: false
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        cart: action.payload,
        loading: false
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: action.payload,
        loading: false
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: null,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  cart: null,
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuthContext();
  const { showNotification } = useNotificationContext();

  // Generate or get session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  };

  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let cartData;
      if (isAuthenticated && user?.id) {
        // Fetch user's cart
        cartData = await cartService.getCart(user.id);
      } else {
        // Fetch guest cart using session ID
        const sessionId = getSessionId();
        cartData = await cartService.getCart(null, sessionId);
      }
      
      if (cartData.success) {
        dispatch({ type: 'SET_CART', payload: cartData.data });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [user?.id, isAuthenticated]);

  // Fetch cart on component mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const cartData = {
        productId: product.id,
        quantity: quantity,
        sellerName: product.brand?.title || 'default',
      };

      // Add user ID or session ID based on authentication
      if (isAuthenticated && user) {
        cartData.userId = user.id;
      } else {
        cartData.sessionId = getSessionId();
      }

      const response = await cartService.addToCart(cartData);
      
      if (response.success) {
        dispatch({ type: 'ADD_ITEM', payload: response.data });
        showNotification({
          message: 'Product added to cart successfully!',
          variant: 'success'
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add product to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showNotification({
        message: errorMessage,
        variant: 'danger'
      });
      throw error;
    }
  };

  const updateCartItem = async (productId, quantity, sellerName = null) => {
    try {
      if (!state.cart) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updateData = {
        productId,
        quantity,
        sellerName
      };

      const response = await cartService.updateCartItem(state.cart.id, updateData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_ITEM', payload: response.data });
        showNotification({
          message: 'Cart updated successfully!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showNotification({
        message: errorMessage,
        variant: 'danger'
      });
    }
  };

  const removeFromCart = async (productId, sellerName = null) => {
    try {
      if (!state.cart) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      
      const removeData = {
        productId,
        sellerName
      };

      const response = await cartService.removeFromCart(state.cart.id, removeData);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_ITEM', payload: response.data });
        showNotification({
          message: 'Item removed from cart!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showNotification({
        message: errorMessage,
        variant: 'danger'
      });
    }
  };

  const clearCart = async () => {
    try {
      if (!state.cart) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await cartService.clearCart(state.cart.id);
      
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        showNotification({
          message: 'Cart cleared successfully!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showNotification({
        message: errorMessage,
        variant: 'danger'
      });
    }
  };

  const mergeCarts = async () => {
    try {
      if (!isAuthenticated || !user) return;

      const sessionId = localStorage.getItem('cartSessionId');
      if (!sessionId) return;

      const mergeData = {
        sessionId: sessionId,
        userId: user.id
      };

      const response = await cartService.mergeCarts(mergeData);
      
      if (response.success) {
        // Remove session ID after successful merge
        localStorage.removeItem('cartSessionId');
        dispatch({ type: 'SET_CART', payload: response.data });
        showNotification({
          message: 'Cart merged successfully!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error merging carts:', error);
    }
  };

  // Calculate cart totals
  const getCartTotals = () => {
    if (!state.cart || !state.cart.items || state.cart.items.length === 0) {
      return {
        totalAmount: 0,
        itemCount: 0,
        totalItems: 0
      };
    }

    const totalAmount = state.cart.totalAmount || 0;
    const itemCount = state.cart.itemCount || 0;
    const totalItems = state.cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
      totalAmount,
      itemCount,
      totalItems
    };
  };

  // Get quantity of a specific product in the cart
  const getProductQuantity = (productId, sellerName = null) => {
    if (!state.cart || !state.cart.items || state.cart.items.length === 0) {
      return 0;
    }

    const item = state.cart.items.find(
      cartItem => 
        cartItem.productId === productId && 
        (sellerName === null || cartItem.sellerName === sellerName)
    );

    return item ? (item.quantity || 0) : 0;
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    refreshCart: fetchCart, // Alias for fetchCart for better naming
    mergeCarts,
    getCartTotals,
    getProductQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
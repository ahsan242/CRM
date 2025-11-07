
// src/http/useSignIn.js
import { useMutation } from '@tanstack/react-query';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useAuthContext } from '@/context/useAuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';

export const useSignIn = () => {
  const { showNotification } = useNotificationContext();
  const { saveSession } = useAuthContext();
  const navigate = useNavigate();

  const signInMutation = useMutation({
    mutationFn: async (credentials) => {
      console.log('🔐 Attempting login with:', { email: credentials.email });
      
      const response = await api.post('/api/users/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ Login successful - Full response:', data);
      
      if (data.success && data.data) {
        // Save the complete session data
        const sessionData = {
          token: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          user: data.data.user
        };
        
        saveSession(sessionData);
        
        showNotification({
          message: data.message || 'Login successful! Welcome back!',
          variant: 'success',
        });
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Handle case where success is true but data is missing
        throw new Error(data.error || 'Login response incomplete');
      }
    },
    onError: (error) => {
      console.error('❌ Login mutation error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.error || errorData.message || errorMessage;
        
        // Handle specific cases
        if (errorData.requiresVerification) {
          errorMessage = 'Please verify your email before logging in.';
          // You can redirect to verification page here if needed
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification({
        message: errorMessage,
        variant: 'danger',
      });
    },
  });

  return {
    signIn: signInMutation.mutate,
    signInAsync: signInMutation.mutateAsync, // For async/await usage
    isLoading: signInMutation.isPending,
    isError: signInMutation.isError,
    error: signInMutation.error,
  };
};
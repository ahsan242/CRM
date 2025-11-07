import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNotificationContext } from '@/context/useNotificationContext';
import api from './api';

export const useVerification = () => {
  const [verificationData, setVerificationData] = useState(null);
  const { showNotification } = useNotificationContext();

  const initiateRegistration = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/api/users/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      setVerificationData(data.data);
      showNotification({
        message: data.message || 'Verification code sent to your email!',
        variant: 'success',
      });
    },
    onError: (error) => {
      showNotification({
        message: error.response?.data?.error || 'Failed to send verification code',
        variant: 'danger',
      });
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async (verificationData) => {
      const response = await api.post('/api/users/verify-email', verificationData);
      return response.data;
    },
    onSuccess: (data) => {
      showNotification({
        message: data.message || 'Email verified successfully!',
        variant: 'success',
      });
      setVerificationData(null);
    },
    onError: (error) => {
      showNotification({
        message: error.response?.data?.error || 'Verification failed',
        variant: 'danger',
      });
    },
  });

  const resendVerification = useMutation({
    mutationFn: async (email) => {
      const response = await api.post('/api/users/resend-verification', { email });
      return response.data;
    },
    onSuccess: (data) => {
      setVerificationData(data.data);
      showNotification({
        message: data.message || 'New verification code sent!',
        variant: 'success',
      });
    },
    onError: (error) => {
      showNotification({
        message: error.response?.data?.error || 'Failed to resend verification code',
        variant: 'danger',
      });
    },
  });

  return {
    initiateRegistration,
    verifyEmail,
    resendVerification,
    verificationData,
    setVerificationData,
  };
};
import { getAllUsers } from '@/http/users';
import { getAllCarts } from '@/http/cart';

export const getAllCustomers = async () => {
  try {
    const response = await getAllUsers();
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerOrdersCount = async (userId) => {
  try {
    const response = await getAllCarts();
    if (response.data.success) {
        console.log('Carts data:', response.data.data);
      // Filter carts for this specific user and calculate total items
      const userCarts = response.data.data.filter(cart => cart.userId === userId);
      const totalItems = userCarts.reduce((total, cart) => total + cart.itemCount, 0);
      return totalItems;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return 0;
  }
};
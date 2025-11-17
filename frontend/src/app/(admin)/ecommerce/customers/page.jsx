import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getAllCustomers, getCustomerOrdersCount } from '@/helpers/api';
import CustomersList from './components/CustomersList';
import { useEffect, useState } from 'react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllCustomers();
      
      // Enhance users data with orders count and include full profile
      const customersWithOrders = await Promise.all(
        usersData.map(async (user) => {
          const ordersCount = await getCustomerOrdersCount(user.id);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.profile?.phone || 'N/A',
            address: user.profile?.address || user.profile?.country || 'N/A',
            city: user.profile?.city || '',
            country: user.profile?.country || '',
            postalCode: user.profile?.postalCode || '',
            age: user.profile?.age || null,
            dateOfBirth: user.profile?.dateOfBirth || null,
            gender: user.profile?.gender || null,
            profile: user.profile || {}, // Include full profile object
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            ordersCount: ordersCount,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`,
            role: user.role
          };
        })
      );
      
      setCustomers(customersWithOrders);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading customers...</div>;
  }

  return (
    <>
      <PageBreadcrumb subName="Ecommerce" title="Customers List" />
      <PageMetaData title="Customers" />
      <CustomersList customers={customers} onCustomerUpdated={fetchCustomers} />
    </>
  );
};

export default Customers;
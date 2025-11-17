import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import * as orderService from '@/http/order';
import { useEffect, useState } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import BillingInformation from './components/BillingInformation';
import DeliveryInformation from './components/DeliveryInformation';
import OrderProducts from './components/OrderProducts';
import OrderSummery from './components/OrderSummery';
import ShippingInformation from './components/ShippingInformation';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getOrderById(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.error || 'Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error.response?.data?.error || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <PageBreadcrumb subName="Ecommerce" title="Order Details" />
        <PageMetaData title="Order Details" />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <PageBreadcrumb subName="Ecommerce" title="Order Details" />
        <PageMetaData title="Order Details" />
        <Alert variant="danger">
          {error || 'Order not found'}
          <br />
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => navigate('/ecommerce/orders')}>
            Back to Orders
          </button>
        </Alert>
      </>
    );
  }
  // Determine progress bar state
  const getProgressState = () => {
    const status = order.status?.toLowerCase();
    if (status === 'delivered') return 4;
    if (status === 'shipped') return 3;
    if (status === 'confirmed' || status === 'processing') return 2;
    return 1;
  };

  const progressState = getProgressState();

  return (
    <>
      <PageBreadcrumb subName="Ecommerce" title="Order Details" />
      <PageMetaData title={`Order #${order.orderNumber || order.id}`} />
      
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <ul className="progressbar ps-0 my-5 pb-5">
            <li className={progressState >= 1 ? 'active' : ''}>Order Placed</li>
            <li className={progressState >= 2 ? 'active' : ''}>Packed</li>
            <li className={progressState >= 3 ? 'active' : ''}>Shipped</li>
            <li className={progressState >= 4 ? 'active' : ''}>Delivered</li>
          </ul>
        </Col>
      </Row>
      
      <Row>
        <Col xl={7}>
          <OrderProducts order={order} />
        </Col>
        <Col xl={5}>
          <OrderSummery order={order} />
        </Col>
      </Row>
      
      <Row>
        <Col lg={4}>
          <ShippingInformation order={order} />
        </Col>
        <Col lg={4}>
          <BillingInformation order={order} />
        </Col>
        <Col lg={4}>
          <DeliveryInformation order={order} />
        </Col>
      </Row>
    </>
  );
};
export default OrderDetail;
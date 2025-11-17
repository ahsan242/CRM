import { Card, CardBody, CardTitle, Table, Badge } from 'react-bootstrap';
import { currency } from '@/context/constants';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const OrderSummery = ({ order }) => {
  const subtotal = parseFloat(order.subtotal || 0);
  const shippingAmount = parseFloat(order.shippingAmount || 0);
  const taxAmount = parseFloat(order.taxAmount || 0);
  const totalAmount = parseFloat(order.totalAmount || 0);

  return (
    <Card>
      <CardBody>
        <CardTitle as="h5" className="mb-3">
          Order Summary
        </CardTitle>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Order Status:</span>
            <Badge bg={
              order.status === 'delivered' ? 'success' :
              order.status === 'confirmed' ? 'success' :
              order.status === 'processing' ? 'primary' :
              order.status === 'pending' ? 'warning' :
              order.status === 'cancelled' ? 'danger' : 'secondary'
            }>
              {order.status || 'N/A'}
            </Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Payment Status:</span>
            <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
              {order.paymentStatus || 'pending'}
            </Badge>
          </div>
          {order.paymentMethod && (
            <div className="d-flex justify-content-between align-items-center">
              <span>Payment Method:</span>
              <span className="text-capitalize">{order.paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="table-responsive text-nowrap table-centered">
          <Table className="mb-0">
            <thead>
              <tr>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td>{currency}{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping Charge:</td>
                <td>
                  {shippingAmount === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    `${currency}${shippingAmount.toFixed(2)}`
                  )}
                </td>
              </tr>
              <tr>
                <td>Tax ({order.taxRate ? (order.taxRate * 100).toFixed(0) : 10}%):</td>
                <td>{currency}{taxAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Total:</td>
                <td className="fw-semibold">{currency}{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {order.orderDate && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted d-block">
              <IconifyIcon icon="bx:calendar" className="me-1" />
              Order Date: {new Date(order.orderDate).toLocaleDateString()}
            </small>
            {order.orderNumber && (
              <small className="text-muted d-block mt-1">
                <IconifyIcon icon="bx:hash" className="me-1" />
                Order #: {order.orderNumber}
              </small>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OrderSummery;
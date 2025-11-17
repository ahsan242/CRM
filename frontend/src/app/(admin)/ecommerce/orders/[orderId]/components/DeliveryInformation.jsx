import { Card, CardBody, CardTitle, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const DeliveryInformation = ({ order }) => {
  const getShippingIcon = () => {
    const method = order.shippingMethod?.toLowerCase();
    if (method === 'express') return 'bx:rocket';
    return 'bx:package';
  };

  const getShippingCompany = () => {
    const method = order.shippingMethod?.toLowerCase();
    if (method === 'express') return 'Express Delivery';
    return 'Standard Delivery';
  };

  return (
    <Card className="card-height-100">
      <CardBody>
        <CardTitle as="h5" className="mb-3">
          Delivery Information
        </CardTitle>
        <div className="text-center">
          <IconifyIcon icon={getShippingIcon()} className="h2 text-primary mb-3" />
          <h6 className="mb-3">{getShippingCompany()}</h6>
          
          <p className="mb-2">
            <strong>Order Number:</strong>
            <br />
            <span className="text-muted">#{order.orderNumber || order.id}</span>
          </p>
          
          <p className="mb-2">
            <strong>Shipping Method:</strong>
            <br />
            <Badge bg="info" className="mt-1">
              {order.shippingMethod || 'Standard'}
            </Badge>
          </p>
          
          {order.orderDate && (
            <p className="mb-2">
              <strong>Order Date:</strong>
              <br />
              <span className="text-muted small">
                {new Date(order.orderDate).toLocaleDateString()}
              </span>
            </p>
          )}
          
          {order.completedAt && (
            <p className="mb-0">
              <strong>Completed:</strong>
              <br />
              <span className="text-muted small">
                {new Date(order.completedAt).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default DeliveryInformation;
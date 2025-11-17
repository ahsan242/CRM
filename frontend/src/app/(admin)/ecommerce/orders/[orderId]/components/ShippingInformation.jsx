import { Card, CardBody, CardTitle } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ShippingInformation = ({ order }) => {
  const shippingAddress = order.shippingAddress || {};
  const user = order.user || {};

  return (
    <Card className="card-height-100">
      <CardBody>
        <CardTitle as="h5" className="mb-3">
          Shipping Information
        </CardTitle>
        <h6 className="mb-3">{user.name || 'N/A'}</h6>
        <address className="mb-0">
          {shippingAddress.street || 'N/A'}, <br />
          {shippingAddress.city || ''}, {shippingAddress.state || ''} {shippingAddress.zipCode || ''} <br />
          {shippingAddress.country && (
            <>
              {shippingAddress.country} <br />
            </>
          )}
          {shippingAddress.phone && (
            <>
              <abbr title="phone">Phone:</abbr>&nbsp; {shippingAddress.phone} <br />
            </>
          )}
          {user.email && (
            <>
              <abbr title="email">Email:</abbr>&nbsp; {user.email}
            </>
          )}
        </address>
        {order.shippingMethod && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted d-block">
              <strong>Shipping Method:</strong> {order.shippingMethod}
            </small>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ShippingInformation;
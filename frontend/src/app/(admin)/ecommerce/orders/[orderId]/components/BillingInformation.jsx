import { Card, CardBody, CardTitle, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';

const BillingInformation = ({ order }) => {
  const billingAddress = order.billingAddress || {};
  const user = order.user || {};

  return (
    <Card className="card-height-100">
      <CardBody>
        <CardTitle as="h5" className="mb-3">
          Billing Information
        </CardTitle>
        
        <div className="mb-3">
          <p className="mb-2">
            <strong>Payment Method:</strong>
            <br />
            <Badge bg="primary" className="mt-1">
              {order.paymentMethod || 'N/A'}
            </Badge>
          </p>
          <p className="mb-2">
            <strong>Payment Status:</strong>
            <br />
            <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="mt-1">
              {order.paymentStatus || 'pending'}
            </Badge>
          </p>
          {order.paymentIntentId && (
            <p className="mb-0 small text-muted">
              Payment Intent: {order.paymentIntentId.substring(0, 20)}...
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-top">
          <h6 className="mb-2">Billing Address</h6>
          <address className="mb-0 small">
            {billingAddress.street || 'N/A'}, <br />
            {billingAddress.city || ''}, {billingAddress.state || ''} {billingAddress.zipCode || ''} <br />
            {billingAddress.country && (
              <>
                {billingAddress.country} <br />
              </>
            )}
            {user.email && (
              <>
                <abbr title="email">Email:</abbr>&nbsp; {user.email}
              </>
            )}
          </address>
        </div>
      </CardBody>
    </Card>
  );
};

export default BillingInformation;

import { Card, CardBody, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const CustomerCard = ({ customer }) => {
  const getLocation = (customer) => {
    if (customer.city && customer.address) {
      return `${customer.city}, ${customer.address}`;
    }
    return customer.city || customer.address || 'Location not set';
  };

  return (
    <Card>
      <CardBody>
        <div className="text-center">
          <img 
            src={customer.image} 
            alt={customer.name}
            className="img-fluid avatar-xxl img-thumbnail rounded-circle avatar-border" 
          />
          <h4 className="mt-3">
            <Link to={`/customers/${customer.id}`}>{customer.name}</Link>
          </h4>
          <Link to="" className="mb-1 d-inline-block icons-center">
            <IconifyIcon icon="bx:location-plus" className="text-danger fs-14 me-1" />
            {getLocation(customer)}
          </Link>
          <br />
          <Link to={`tel:${customer.phone}`}>
            <IconifyIcon icon="bx:phone-call" className="text-success fs-14 me-1" />
            {customer.phone}
          </Link>
          <br />
          <div className="mt-2">
            <span className="badge bg-primary me-1">{customer.role}</span>
            <span className="badge bg-secondary">Orders: {customer.ordersCount}</span>
          </div>
          <Link to={`/customers/${customer.id}`} className="btn btn-sm btn-outline-primary mt-2">
            View All Details
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

const CustomerGrid = ({ customers }) => {
  return (
    <Row className="row-cols-1 row-cols-md-2 row-cols-xl-5 gx-3">
      {customers.map((customer, idx) => (
        <div className="col" key={customer.id || idx}>
          <CustomerCard customer={customer} />
        </div>
      ))}
    </Row>
  );
};

export default CustomerGrid;
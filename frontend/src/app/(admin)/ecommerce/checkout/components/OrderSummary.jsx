import { Card, CardBody, CardTitle, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { currency } from '@/context/constants';

const OrderSummary = ({ cart, order, totalAmount, totalItems }) => {
  const shippingCost = order?.shippingAmount || (order?.shippingMethod === 'express' ? 25.00 : 10.00);
  const taxAmount = order?.taxAmount || (totalAmount * 0.1);
  const finalTotal = order?.totalAmount || (totalAmount + shippingCost + taxAmount);

  return (
    <Card className="sticky-top" style={{ top: '20px' }}>
      <CardBody>
        <CardTitle as="h5" className="mb-3">
          Order Summary
        </CardTitle>
        
        {cart && cart.items && cart.items.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-2">Items in Cart:</h6>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <tbody>
                  {cart.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.productImage ? `http://localhost:5000/uploads/products/${item.productImage}` : '/assets/images/products/default-product.jpg'}
                            alt={item.productName}
                            className="img-fluid rounded me-2"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <small className="d-block">{item.productName}</small>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <small>{currency}{parseFloat(item.totalPrice || 0).toFixed(2)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

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
                <td>Items ({totalItems}):</td>
                <td>{currency}{parseFloat(totalAmount || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td>{currency}{parseFloat(shippingCost).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax (10%):</td>
                <td>{currency}{parseFloat(taxAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Total:</td>
                <td className="fw-semibold">{currency}{parseFloat(finalTotal).toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </div>

        <div className="mt-3">
          <Link to="/ecommerce/cart" className="btn btn-outline-secondary w-100">
            <i className="bx bx-arrow-back me-2"></i>
            Back to Cart
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrderSummary;


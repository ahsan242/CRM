import { Card, CardBody, CardTitle, Table } from 'react-bootstrap';
import { currency } from '@/context/constants';

const OrderProducts = ({ order }) => {
  const items = order.items || [];

  return (
    <Card>
      <CardBody>
        <CardTitle as="h5" className="mb-3">
          Products From Order #{order.orderNumber || order.id}
        </CardTitle>
        <div className="table-responsive">
          <Table className="table table-centered table-dashed mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      {item.product?.mainImage ? (
                        <img
                          src={`http://localhost:5000/uploads/products/${item.product.mainImage}`}
                          alt={item.productName || item.product?.title}
                          className="img-fluid rounded"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                          <span className="text-muted">-</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{item.productName || item.product?.title || 'Product'}</strong>
                        {item.productSku && (
                          <small className="d-block text-muted">SKU: {item.productSku}</small>
                        )}
                        {item.sellerName && (
                          <small className="d-block text-muted">Seller: {item.sellerName}</small>
                        )}
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{currency}{parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                    <td className="fw-semibold">{currency}{parseFloat(item.totalPrice || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrderProducts;
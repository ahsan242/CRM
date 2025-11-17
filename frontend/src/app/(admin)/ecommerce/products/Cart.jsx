import { useEffect } from 'react';
import { Card, CardBody, CardTitle, Col, Row, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useCart } from '@/context/CartContext';
import { currency } from '@/context/constants';

const Cart = () => {
  const { cart, loading, removeFromCart, updateCartItem, clearCart, getCartTotals } = useCart();

  // CartContext already fetches cart on mount, no need to fetch again here

  const handleQuantityChange = async (productId, newQuantity, sellerName) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity, sellerName);
  };

  const handleRemoveItem = async (productId, sellerName) => {
    await removeFromCart(productId, sellerName);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return (
      <>
        <PageMetaData title="Shopping Cart" />
        <PageBreadcrumb title="Shopping Cart" subName="Ecommerce" />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your cart...</p>
        </div>
      </>
    );
  }

  const { totalAmount, itemCount, totalItems } = getCartTotals();

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        <PageMetaData title="Shopping Cart" />
        <PageBreadcrumb title="Shopping Cart" subName="Ecommerce" />
        <Row>
          <Col>
            <Card>
              <CardBody className="text-center py-5">
                <IconifyIcon icon="bx:cart" className="text-muted mb-3" style={{ fontSize: '4rem' }} />
                <h3>Your cart is empty</h3>
                <p className="text-muted mb-4">Start shopping to add items to your cart</p>
                <Link to="/ecommerce/products" className="btn btn-primary">
                  <IconifyIcon icon="bx:shopping-bag" className="me-2" />
                  Continue Shopping
                </Link>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <PageMetaData title="Shopping Cart" />
      <PageBreadcrumb title="Shopping Cart" subName="Ecommerce" />
      
      <Row>
        <Col xl={8}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <CardTitle as="h5" className="mb-0">
                  Shopping Cart
                </CardTitle>
                <Badge bg="primary" className="fs-6">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              <div className="table-responsive">
                <Table className="table table-centered table-dashed mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Product</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th style={{ width: '100px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item, index) => (
                      <tr key={`${item.productId}-${item.sellerName || 'default'}-${index}`}>
                        <td>
                          <img
                            src={item.productImage ? `http://localhost:5000/uploads/products/${item.productImage}` : '/assets/images/products/default-product.jpg'}
                            alt={item.productName}
                            className="img-fluid rounded"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = '/assets/images/products/default-product.jpg';
                            }}
                          />
                        </td>
                        <td>
                          <h6 className="mb-1">{item.productName || 'Product Name'}</h6>
                          <p className="text-muted mb-1 small">SKU: {item.productSku || 'N/A'}</p>
                          {item.sellerName && (
                            <small className="text-muted d-block">Seller: {item.sellerName}</small>
                          )}
                        </td>
                        <td className="fw-semibold">{currency}{parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.sellerName)}
                              disabled={item.quantity <= 1}
                              style={{ minWidth: '32px', padding: '0.25rem 0.5rem' }}
                            >
                              <IconifyIcon icon="bx:minus" />
                            </Button>
                            <span className="mx-2 fw-semibold" style={{ minWidth: '30px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.sellerName)}
                              style={{ minWidth: '32px', padding: '0.25rem 0.5rem' }}
                            >
                              <IconifyIcon icon="bx:plus" />
                            </Button>
                          </div>
                        </td>
                        <td className="fw-semibold">{currency}{parseFloat(item.totalPrice || 0).toFixed(2)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId, item.sellerName)}
                            title="Remove item"
                          >
                            <IconifyIcon icon="bx:trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Link to="/ecommerce/products" className="btn btn-outline-primary">
                  <IconifyIcon icon="bx:arrow-back" className="me-2" />
                  Continue Shopping
                </Link>
                <Button variant="outline-danger" onClick={handleClearCart}>
                  <IconifyIcon icon="bx:trash" className="me-2" />
                  Clear Cart
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-3">
                Order Summary
              </CardTitle>
              
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
                      <td>Shipping Charge:</td>
                      <td className="text-success">FREE</td>
                    </tr>
                    <tr>
                      <td>Estimated tax:</td>
                      <td>{currency}0.00</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Total:</td>
                      <td className="fw-semibold">{currency}{parseFloat(totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="mt-4">
                <Link to="/ecommerce/checkout" className="btn btn-primary w-100 mb-2" style={{ textDecoration: 'none' }}>
                  <IconifyIcon icon="bx:credit-card" className="me-2" />
                  Proceed to Checkout
                </Link>
                
                <Link to="/ecommerce/products" className="btn btn-outline-secondary w-100">
                  <IconifyIcon icon="bx:arrow-back" className="me-2" />
                  Continue Shopping
                </Link>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Cart;
import clsx from 'clsx';
import { Button, Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import * as orderService from '@/http/order';
import { useEffect, useState } from 'react';
import { currency } from '@/context/constants';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrders();
        if (response.success) {
          setOrders(response.data.orders || response.data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  return <>
      <PageBreadcrumb subName="Ecommerce" title="Orders List" />
      <PageMetaData title="Orders List" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" />
                  </span>
                  <input type="search" className="form-control" id="search" placeholder="Search ..." />
                </div>
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <Dropdown>
                    <DropdownToggle as={'a'} role="button" className="arrow-none btn btn-light dropdown-toggle">
                      <div className="flex-centered mb-0">
                        <IconifyIcon icon="bx:sort" className="me-1" />
                        Filter <IconifyIcon icon="bx:chevron-down" height={16} width={16} className="ms-2" />
                      </div>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem href="">By Date</DropdownItem>
                      <DropdownItem href="">By Order ID</DropdownItem>
                      <DropdownItem href="">By Status</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button variant="primary">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Create Contact
                  </Button>
                </div>
              </div>
            </CardBody>
            <div className="table-responsive table-centered">
              <table className="table text-nowrap mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th>Order ID.</th>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Customer Name</th>
                    <th>Email ID</th>
                    <th>Phone No.</th>
                    <th>Address</th>
                    <th>Payment Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, idx) => {
                      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                      const shippingAddress = order.shippingAddress || {};
                      const addressString = shippingAddress.street 
                        ? `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`
                        : 'N/A';
                      
                      return (
                        <tr key={order.id || idx}>
                          <td>
                            <Link to={`/ecommerce/orders/${order.id}`}>
                              #{order.orderNumber || order.id}
                            </Link>
                          </td>
                          <td>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                          <td>
                            {firstItem?.product?.mainImage ? (
                              <img 
                                src={`http://localhost:5000/uploads/products/${firstItem.product.mainImage}`} 
                                alt={firstItem.product.title || 'Product'} 
                                className="img-fluid avatar-sm" 
                              />
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Link to="">{order.user?.name || 'N/A'}</Link>
                          </td>
                          <td>{order.user?.email || 'N/A'}</td>
                          <td>{shippingAddress.phone || 'N/A'}</td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }} title={addressString}>
                            {addressString}
                          </td>
                          <td>{order.paymentMethod || 'N/A'}</td>
                          <td>
                            <div className="icons-center">
                              <IconifyIcon 
                                icon="bxs:circle" 
                                className={clsx('me-1', 
                                  order.status === 'cancelled' ? 'text-danger' : 
                                  order.status === 'pending' || order.status === 'processing' ? 'text-primary' : 
                                  order.status === 'confirmed' || order.status === 'delivered' ? 'text-success' : 
                                  'text-warning'
                                )} 
                              />
                              {order.status || 'N/A'}
                            </div>
                            {order.paymentStatus && (
                              <small className={clsx('d-block', 
                                order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'
                              )}>
                                Payment: {order.paymentStatus}
                              </small>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="align-items-center justify-content-between row g-0 text-center text-sm-start p-3 border-top">
              <div className="col-sm">
                <div className="text-muted">
                  Showing&nbsp;
                  <span className="fw-semibold">10</span>&nbsp; of &nbsp;
                  <span className="fw-semibold">90,521</span>&nbsp; orders
                </div>
              </div>
              <Col sm="auto" className="mt-3 mt-sm-0">
                <ul className="pagination pagination-rounded m-0">
                  <li className="page-item">
                    <Link to="" className="page-link">
                      <IconifyIcon icon="bx:left-arrow-alt" />
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link to="" className="page-link">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link to="" className="page-link">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link to="" className="page-link">
                      3
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link to="" className="page-link">
                      <IconifyIcon icon="bx:right-arrow-alt" />
                    </Link>
                  </li>
                </ul>
              </Col>
            </div>
          </Card>
        </Col>
      </Row>
    </>;
};
export default Orders;
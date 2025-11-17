import { useState } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Alert } from 'react-bootstrap';
import EditCustomerModal from './EditCustomerModal';
import { deleteUser } from '@/http/users';
import { useNotificationContext } from '@/context/useNotificationContext';

const CustomersListView = ({ customers, onCustomerUpdated }) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotificationContext();
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocation = (customer) => {
    if (customer.city && customer.address) {
      return `${customer.city}, ${customer.address}`;
    }
    return customer.city || customer.address || 'N/A';
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
  };

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer?.id) return;

    setIsDeleting(true);
    try {
      const response = await deleteUser(deletingCustomer.id);
      
      if (response.data?.success) {
        showNotification({
          message: 'Customer deleted successfully!',
          variant: 'success'
        });
        onCustomerUpdated?.();
        setShowDeleteModal(false);
        setDeletingCustomer(null);
      } else {
        throw new Error(response.data?.error || 'Failed to delete customer');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete customer';
      showNotification({
        message: errorMessage,
        variant: 'danger'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <EditCustomerModal
        customer={editingCustomer}
        show={!!editingCustomer}
        onHide={() => setEditingCustomer(null)}
        onSuccess={(updatedCustomer) => {
          onCustomerUpdated?.();
          setEditingCustomer(null);
        }}
      />

      <Modal show={showDeleteModal} onHide={() => !isDeleting && setShowDeleteModal(false)} centered>
        <ModalHeader closeButton={!isDeleting}>
          <ModalTitle>
            <IconifyIcon icon="bx:trash" className="me-2 text-danger" />
            Delete Customer
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Alert variant="warning" className="mb-3">
            <IconifyIcon icon="bx:error-circle" className="me-2" />
            <strong>Warning:</strong> This action cannot be undone.
          </Alert>
          <p>
            Are you sure you want to delete <strong>{deletingCustomer?.name}</strong>?
          </p>
          <p className="text-muted small mb-0">
            This will permanently remove the customer and all associated data.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:trash" className="me-2" />
                Delete Customer
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    <Card className="overflow-hidden">
      <div className="table-responsive table-centered">
        <table className="table text-nowrap mb-0">
          <thead className="teble-light">
            <tr>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Role</th>
              <th>Email ID</th>
              <th>Phone No.</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, idx) => (
              <tr key={customer.id || idx}>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <img 
                      src={customer.image} 
                      alt={customer.name}
                      className="img-fluid avatar-xs rounded-circle avatar-border me-1" 
                    />
                    <Link to={`/customers/${customer.id}`}>{customer.name}</Link>
                  </div>
                </td>
                <td>{formatDate(customer.updatedAt)}</td>
                <td>{customer.role}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{getLocation(customer)}</td>
                <td>{customer.ordersCount}</td>
                <td>
                  <Button 
                    variant="soft-secondary" 
                    size="sm" 
                    type="button" 
                    className="me-2"
                    onClick={() => handleEdit(customer)}
                    title="Edit Customer"
                  >
                    <IconifyIcon icon="bx:edit" className="fs-16" />
                  </Button>
                  <Button 
                    variant="soft-danger" 
                    size="sm" 
                    type="button"
                    onClick={() => handleDeleteClick(customer)}
                    title="Delete Customer"
                  >
                    <IconifyIcon icon="bx:trash" className="fs-16" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination - You can enhance this with real pagination data from API */}
      <div className="align-items-center justify-content-between row g-0 text-center text-sm-start p-3 border-top">
        <div className="col-sm">
          <div className="text-muted">
            Showing&nbsp;
            <span className="fw-semibold">{customers.length}</span>&nbsp; of&nbsp;
            <span className="fw-semibold">{customers.length}</span>&nbsp; Results
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
                <IconifyIcon icon="bx:right-arrow-alt" />
              </Link>
            </li>
          </ul>
        </Col>
      </div>
    </Card>
    </>
  );
};

export default CustomersListView;
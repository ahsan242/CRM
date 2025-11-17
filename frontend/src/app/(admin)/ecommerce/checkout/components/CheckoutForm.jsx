import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, FormCheck } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAuthContext } from '@/context/useAuthContext';

const CheckoutForm = ({ onSubmit, loading, user }) => {
  const { user: authUser } = useAuthContext();
  const [formData, setFormData] = useState({
    useProfileAddress: false,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    billingAddress: {
      sameAsShipping: true,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    paymentMethod: 'stripe',
    shippingMethod: 'standard',
    notes: '',
    customerNotes: ''
  });

  useEffect(() => {
    // Pre-fill with user profile if available
    if (authUser?.profile?.address) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          ...authUser.profile.address
        }
      }));
    }
  }, [authUser]);

  const handleInputChange = (field, value, isShipping = true) => {
    if (isShipping) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    }
  };

  const handleSameAsShipping = (checked) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        sameAsShipping: checked,
        ...(checked ? prev.shippingAddress : {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        })
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h6 className="mb-3">Shipping Address</h6>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.shippingAddress.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                required
                placeholder="123 Main St"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={formData.shippingAddress.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
                placeholder="New York"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={formData.shippingAddress.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
                placeholder="NY"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                value={formData.shippingAddress.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                required
                placeholder="10001"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                value={formData.shippingAddress.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      <div className="mb-4">
        <h6 className="mb-3">Billing Address</h6>
        <FormCheck
          type="checkbox"
          label="Same as shipping address"
          checked={formData.billingAddress.sameAsShipping}
          onChange={(e) => handleSameAsShipping(e.target.checked)}
          className="mb-3"
        />
        
        {!formData.billingAddress.sameAsShipping && (
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.billingAddress.street}
                  onChange={(e) => handleInputChange('street', e.target.value, false)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value, false)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange('state', e.target.value, false)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Zip Code</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.billingAddress.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value, false)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.billingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value, false)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        )}
      </div>

      <div className="mb-4">
        <h6 className="mb-3">Shipping Method</h6>
        <Form.Group>
          <FormCheck
            type="radio"
            name="shippingMethod"
            label="Standard Shipping (5-7 business days) - $10.00"
            value="standard"
            checked={formData.shippingMethod === 'standard'}
            onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
          />
          <FormCheck
            type="radio"
            name="shippingMethod"
            label="Express Shipping (2-3 business days) - $25.00"
            value="express"
            checked={formData.shippingMethod === 'express'}
            onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
          />
        </Form.Group>
      </div>

      <div className="mb-4">
        <h6 className="mb-3">Additional Notes (Optional)</h6>
        <Form.Group className="mb-3">
          <Form.Label>Order Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any special instructions for your order..."
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Customer Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={formData.customerNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
            placeholder="Any notes for customer service..."
          />
        </Form.Group>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-100"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Processing...
          </>
        ) : (
          <>
            <IconifyIcon icon="bx:credit-card" className="me-2" />
            Proceed to Payment
          </>
        )}
      </Button>
    </Form>
  );
};

export default CheckoutForm;


import { useState, useEffect, useRef } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import SelectFormInput from '@/components/form/SelectFormInput';
import { updateUser } from '@/http/users';
import { useNotificationContext } from '@/context/useNotificationContext';

const customerFormSchema = yup.object({
  name: yup.string().required('Customer name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().nullable().transform((value) => value || null),
  age: yup.number().nullable().transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) return null;
    const num = Number(originalValue);
    return isNaN(num) ? null : num;
  }).min(0, 'Age must be positive').max(150, 'Age must be realistic'),
  country: yup.string().nullable().transform((value) => value || null),
  city: yup.string().nullable().transform((value) => value || null),
  address: yup.string().nullable().transform((value) => value || null),
  postalCode: yup.string().nullable().transform((value) => value || null),
  dateOfBirth: yup.date().nullable().transform((value, originalValue) => {
    if (!originalValue || originalValue === '') return null;
    return value;
  }),
  gender: yup.string().oneOf(['male', 'female', 'other', null, ''], 'Invalid gender').nullable().transform((value) => value || null),
});

const EditCustomerModal = ({ customer, show, onHide, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { showNotification } = useNotificationContext();

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      age: '',
      country: '',
      city: '',
      address: '',
      postalCode: '',
      dateOfBirth: '',
      gender: '',
    }
  });

  useEffect(() => {
    if (customer && show) {
      setValue('name', customer.name || '');
      setValue('email', customer.email || '');
      // Set UserProfile fields
      const profile = customer.profile || {};
      setValue('phone', profile.phone || '');
      setValue('age', profile.age || '');
      setValue('country', profile.country || '');
      setValue('city', profile.city || '');
      setValue('address', profile.address || '');
      setValue('postalCode', profile.postalCode || '');
      setValue('dateOfBirth', profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '');
      setValue('gender', profile.gender || '');
      
      // Set image preview if profile picture exists
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const originalImage = profile.profilePicture 
        ? `${API_URL}/uploads/profiles/${profile.profilePicture}`
        : null;
      setImagePreview(originalImage);
      setSelectedImage(null);
      setError(null);
    }
  }, [customer, show, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification({
          message: 'Please select an image file',
          variant: 'warning'
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification({
          message: 'Image size must be less than 5MB',
          variant: 'warning'
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    // Restore original image if it exists, otherwise clear preview
    const profile = customer?.profile || {};
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (profile.profilePicture) {
      setImagePreview(`${API_URL}/uploads/profiles/${profile.profilePicture}`);
    } else {
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    if (!customer?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        name: data.name,
        // Email is read-only, don't send it for update
        // UserProfile fields
        phone: data.phone || null,
        age: data.age || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        postalCode: data.postalCode || null,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
      };

      const response = await updateUser(customer.id, updateData, selectedImage);

      if (response.data?.success) {
        showNotification({
          message: 'Customer updated successfully!',
          variant: 'success'
        });
        onSuccess?.(response.data.data);
        onHide();
        reset();
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.data?.error || 'Failed to update customer');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update customer';
      setError(errorMessage);
      showNotification({
        message: errorMessage,
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable>
      <ModalHeader closeButton>
        <ModalTitle>
          <IconifyIcon icon="bx:edit" className="me-2" />
          Edit Customer
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert variant="danger" className="mb-3">
            <IconifyIcon icon="bx:error-circle" className="me-2" />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="name"
                label="Customer Name"
                placeholder="Enter customer name"
                containerClassName="mb-3"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                containerClassName="mb-3"
                disabled
              />
            </Col>
          </Row>

          <hr className="my-3" />
          <h6 className="mb-3">Profile Information</h6>

          {/* Profile Picture Upload */}
          <div className="mb-4">
            <Form.Label className="fw-semibold mb-2">Profile Picture</Form.Label>
            <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
              {/* Image Preview */}
              <div className="text-center">
                {imagePreview ? (
                  <div className="position-relative d-inline-block">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="img-thumbnail rounded-circle"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 rounded-circle"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                      onClick={handleRemoveImage}
                      title="Remove image"
                    >
                      <IconifyIcon icon="bx:x" />
                    </Button>
                  </div>
                ) : (
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                    <IconifyIcon icon="bx:user" className="text-muted" style={{ fontSize: '3rem' }} />
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex-grow-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control mb-2"
                  disabled={isSubmitting}
                />
                <small className="text-muted d-block">
                  <IconifyIcon icon="bx:info-circle" className="me-1" />
                  Recommended: Square image, max 5MB. Formats: JPG, PNG, GIF
                </small>
              </div>
            </div>
          </div>

          <Row>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                containerClassName="mb-3"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="age"
                label="Age"
                type="number"
                placeholder="Enter age"
                containerClassName="mb-3"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <SelectFormInput
                control={control}
                name="gender"
                label="Gender"
                placeholder="Select gender"
                containerClassName="mb-3"
                options={[
                  { value: '', label: 'Select gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                containerClassName="mb-3"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="country"
                label="Country"
                placeholder="Enter country"
                containerClassName="mb-3"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="city"
                label="City"
                placeholder="Enter city"
                containerClassName="mb-3"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="postalCode"
                label="Postal Code"
                placeholder="Enter postal code"
                containerClassName="mb-3"
              />
            </Col>
          </Row>

          <TextAreaFormInput
            control={control}
            name="address"
            label="Address"
            placeholder="Enter full address"
            rows={3}
            containerClassName="mb-3"
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="light"
              onClick={onHide}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="bx:check" className="me-2" />
                  Update Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default EditCustomerModal;


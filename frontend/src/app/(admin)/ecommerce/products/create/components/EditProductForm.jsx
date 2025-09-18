
// src/app/(admin)/ecommerce/products/create/components/EditProductForm.jsx
import { useState, useEffect } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import { getProduct, updateProduct } from '@/http/Product';

const productFormSchema = yup.object({
  title: yup.string().required('Product title is required'),
  sku: yup.string().required('SKU is required'),
  price: yup.number().required('Price is required').positive('Price must be positive'),
  quantity: yup.number().required('Quantity is required').integer('Quantity must be a whole number').min(0, 'Quantity cannot be negative'),
  shortDescp: yup.string().optional(),
  longDescp: yup.string().optional(),
  metaDescp: yup.string().optional(),
});

const EditProductForm = ({ productId, onSuccess }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(productFormSchema)
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(productId);
        const product = response.data;
        
        setValue('title', product.title);
        setValue('sku', product.sku);
        setValue('price', product.price);
        setValue('quantity', product.quantity);
        setValue('shortDescp', product.shortDescp);
        setValue('longDescp', product.longDescp);
        setValue('metaDescp', product.metaDescp);
        
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateProduct(productId, data);
      
      setShowSuccessAlert(true);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading product details...</div>;
  }

  return (
    <div className="p-4">
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="bx:check-circle" className="me-2" />
          Product updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <IconifyIcon icon="bx:error" className="me-2" />
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={6}>
            <TextFormInput 
              control={control} 
              label="Product Title" 
              placeholder="Enter product title" 
              containerClassName="mb-3" 
              name="title" 
            />
          </Col>
          <Col lg={6}>
            <TextFormInput 
              control={control} 
              label="SKU" 
              placeholder="Enter SKU" 
              containerClassName="mb-3" 
              name="sku" 
            />
          </Col>
        </Row>
        
        <Row>
          <Col lg={6}>
            <TextFormInput 
              control={control} 
              label="Price" 
              placeholder="Enter price" 
              containerClassName="mb-3" 
              name="price" 
              type="number"
              step="0.01"
            />
          </Col>
          <Col lg={6}>
            <TextFormInput 
              control={control} 
              label="Quantity" 
              placeholder="Enter quantity" 
              containerClassName="mb-3" 
              name="quantity" 
              type="number"
            />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <TextAreaFormInput 
              control={control} 
              name="shortDescp" 
              label="Short Description" 
              containerClassName="mb-3" 
              rows={3} 
            />
          </Col>
          <Col lg={12}>
            <TextAreaFormInput 
              control={control} 
              name="longDescp" 
              label="Long Description" 
              containerClassName="mb-3" 
              rows={5} 
            />
          </Col>
          <Col lg={12}>
            <TextAreaFormInput 
              control={control} 
              name="metaDescp" 
              label="Meta Description" 
              containerClassName="mb-3" 
              rows={3} 
            />
          </Col>
        </Row>
        
        <div className="d-flex justify-content-end mt-5">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:save" className="me-2" />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
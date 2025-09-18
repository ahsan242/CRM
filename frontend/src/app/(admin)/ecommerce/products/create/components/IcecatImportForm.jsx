

// src/app/(admin)/ecommerce/products/create/components/IcecatImportForm.jsx
import React, { useState } from 'react';
import { Row, Col, Alert, Button, Card, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import TextFormInput from '@/components/form/TextFormInput';
import { importProductFromIcecat } from '@/http/Product';

const IcecatImportForm = ({ onProductImported }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importedProduct, setImportedProduct] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      productCode: '',
      brand: ''
    }
  });

  const productCode = watch('productCode');
  const brand = watch('brand');

  const handleImport = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setImportedProduct(null);
    setDebugInfo('');
    
    try {
      console.log('Sending import request:', data);
      const response = await importProductFromIcecat(data);
      console.log('Import response:', response);
      
      if (response.product) {
        setImportedProduct(response.product);
        setSuccess('Product imported successfully!');
        onProductImported?.(response.product);
      } else if (response.message) {
        setSuccess(response.message);
      }
      
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage = err.message || 'Failed to import product from Icecat';
      setError(errorMessage);
      
      // Add debug info
      setDebugInfo(`Error details: ${JSON.stringify(err.response?.data || {}, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseImportedProduct = () => {
    if (importedProduct) {
      onProductImported?.(importedProduct, true);
    }
  };

  // Test with sample data
  const fillSampleData = () => {
    setValue('productCode', 'E500-G.APSMB1');
    setValue('brand', 'HP');
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Import from Icecat API</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Button variant="outline-secondary" size="sm" onClick={fillSampleData}>
            Fill Sample Data
          </Button>
          <small className="text-muted ms-2">(HP E500-G.APSMB1 for testing)</small>
        </div>

        <form onSubmit={handleSubmit(handleImport)}>
          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
              {debugInfo && (
                <details className="mt-2">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 small">{debugInfo}</pre>
                </details>
              )}
            </Alert>
          )}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Row>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="productCode"
                label="Product Code *"
                placeholder="e.g., E500-G.APSMB1"
                containerClassName="mb-3"
              />
            </Col>
            <Col lg={6}>
              <TextFormInput
                control={control}
                name="brand"
                label="Brand *"
                placeholder="e.g., HP, LG, DELL"
                containerClassName="mb-3"
              />
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !productCode || !brand}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Importing...
                </>
              ) : 'Import Product'}
            </Button>
            
            {importedProduct && (
              <Button 
                variant="success" 
                onClick={handleUseImportedProduct}
              >
                Use Imported Product
              </Button>
            )}
          </div>
        </form>

        {importedProduct && (
          <div className="mt-4 p-3 border rounded">
            <h6>Imported Product Details:</h6>
            <p><strong>Title:</strong> {importedProduct.title}</p>
            <p><strong>Brand:</strong> {importedProduct.brand?.title || importedProduct.brandId}</p>
            <p><strong>SKU:</strong> {importedProduct.sku}</p>
            <p><strong>Category:</strong> {importedProduct.category?.title || importedProduct.categoryId}</p>
            <p><strong>Description:</strong> {importedProduct.shortDescp?.substring(0, 100)}...</p>
            
            {importedProduct.mainImage && (
              <div className="mt-2">
                <img 
                  src={`/uploads/${importedProduct.mainImage}`} 
                  alt="Product preview" 
                  style={{ maxHeight: '150px', maxWidth: '100%' }}
                  className="img-thumbnail"
                />
              </div>
            )}
          </div>
        )}

        {/* Debug section */}
        <div className="mt-4 p-3 border rounded bg-light">
          <h6 className="text-muted">Debug Information:</h6>
          <p className="small text-muted mb-1">
            <strong>API Endpoint:</strong> POST http://localhost:5000/api/products/import
          </p>
          <p className="small text-muted">
            <strong>Required Fields:</strong> productCode, brand
          </p>
          {loading && (
            <p className="small text-info">Request in progress...</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default IcecatImportForm;
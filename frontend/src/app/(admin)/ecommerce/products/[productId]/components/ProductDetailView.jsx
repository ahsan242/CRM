
// src/pages/ecommerce/components/ProductDetailView.jsx
import { Card, CardBody, Badge, Row, Col } from 'react-bootstrap';
import { currency } from '@/context/constants';

const ProductDetailView = ({ product }) => {
  const stockStatus = product.quantity > 0 ? 'In Stock' : 'Out of Stock';
  const stockVariant = product.quantity > 0 ? 'success' : 'danger';

  return (
    <Card>
      <CardBody>
        <h2 className="mb-3">{product.title}</h2>
        
        {/* Basic Info */}
        <Row className="mb-3">
          <Col md={6}>
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Brand:</strong> {product.brand?.title || 'N/A'}</p>
            <p><strong>Category:</strong> {product.category?.title || 'N/A'}</p>
          </Col>
          <Col md={6}>
            <p><strong>Price:</strong> {currency}{product.price || '0.00'}</p>
            <p>
              <strong>Status:</strong>{' '}
              <Badge bg={stockVariant}>{stockStatus}</Badge>
            </p>
            <p><strong>Quantity:</strong> {product.quantity || 0}</p>
          </Col>
        </Row>

        {/* Description */}
        {product.shortDescp && (
          <div className="mb-3">
            <h5>Description</h5>
            <p className="text-muted">{product.shortDescp}</p>
          </div>
        )}

        {product.longDescp && (
          <div className="mb-3">
            <h5>Detailed Description</h5>
            <p className="text-muted">{product.longDescp}</p>
          </div>
        )}

        {/* Bullet Points */}
        {product.bulletPoints && product.bulletPoints.length > 0 && (
          <div className="mb-3">
            <h5>Key Features</h5>
            <ul className="text-muted">
              {product.bulletPoints.map((point, index) => (
                <li key={index}>{point.point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Specifications */}
        {product.techProducts && product.techProducts.length > 0 && (
          <div className="mb-3">
            <h5>Technical Specifications</h5>
            <Row>
              {product.techProducts.map((tech, index) => (
                <Col md={6} key={index}>
                  <p className="mb-1">
                    <strong>{tech.techProductName?.title}:</strong> {tech.value}
                  </p>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Documents */}
        {product.documents && product.documents.length > 0 && (
          <div className="mb-3">
            <h5>Documents</h5>
            <ul>
              {product.documents.map((doc, index) => (
                <li key={index}>
                  <a 
                    href={doc.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {doc.description || 'Product Document'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ProductDetailView;
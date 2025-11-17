
// src/pages/ecommerce/components/ProductImages.jsx
import { useState } from 'react';
import { Card, CardBody } from 'react-bootstrap';

const ProductImages = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Get all images including main image and galleries
  const allImages = [
    ...(product.mainImage ? [{
      url: product.mainImage,
      imageTitle: 'Main Image'
    }] : []),
    ...(product.images || []),
    ...(product.galleries || [])
  ];

  if (allImages.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center">
            <img 
              src="/assets/images/products/default-product.jpg" 
              alt="No image available"
              className="img-fluid"
            />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        {/* Main Image */}
        <div className="text-center mb-3">
          <img 
            src={`http://localhost:5000/uploads/products/${allImages[selectedImage]?.url}`}
            alt={allImages[selectedImage]?.imageTitle || 'Product Image'}
            className="img-fluid"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>

        {/* Thumbnail Images */}
        {allImages.length > 1 && (
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {allImages.map((image, index) => (
              <div 
                key={index}
                className={`border rounded p-1 cursor-pointer ${selectedImage === index ? 'border-primary' : 'border-light'}`}
                onClick={() => setSelectedImage(index)}
                style={{ width: '60px', height: '60px' }}
              >
                <img 
                  src={`http://localhost:5000/uploads/products/${image.url}`}
                  alt={image.imageTitle || `Thumbnail ${index + 1}`}
                  className="img-fluid h-100 w-100"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ProductImages;
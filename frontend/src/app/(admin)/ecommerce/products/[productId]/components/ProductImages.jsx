// import clsx from 'clsx';
// import { useState } from 'react';
// import { Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
// import product1 from '@/assets/images/products/product-1(1).png';
// import product2 from '@/assets/images/products/product-1(2).png';
// import product3 from '@/assets/images/products/product-1(3).png';
// import product4 from '@/assets/images/products/product-1(4).png';
// const ProductImages = ({
//   product
// }) => {
//   const {
//     name
//   } = product;

//   // You can replace below static images with the above ↑ images coming as props from parent element
//   const productImages = [product2, product1, product3, product4];
//   const eventKeyPrefix = name + '-';
//   const [activeImageTab, setActiveImageTab] = useState(eventKeyPrefix + 0);
//   return <TabContainer activeKey={activeImageTab}>
//       <TabContent>
//         {productImages.map((image, idx) => <TabPane key={idx} eventKey={eventKeyPrefix + idx} className="fade">
//             <img src={image} alt={name + idx} className="img-fluid mx-auto d-block rounded" />
//           </TabPane>)}
//       </TabContent>
//       <Nav variant="pills" justify>
//         {productImages.map((image, idx) => <NavItem onClick={() => setActiveImageTab(eventKeyPrefix + idx)} key={idx} className="nav-item">
//             <NavLink as={'button'} className={clsx('product-thumb', {
//           active: eventKeyPrefix + idx === activeImageTab
//         })}>
//               <img src={image} alt={name + 2 + '-thumb'} className="img-fluid mx-auto rounded" />
//             </NavLink>
//           </NavItem>)}
//       </Nav>
//     </TabContainer>;
// };
// export default ProductImages;

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
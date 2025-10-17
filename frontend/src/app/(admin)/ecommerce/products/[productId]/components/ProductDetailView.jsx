// import IconifyIcon from '@/components/wrappers/IconifyIcon';
// import { currency } from '@/context/constants';
// import { getCalculatedPrice } from '@/helpers/product';
// import { getStockStatus } from '@/utils/other';
// import { Button } from 'react-bootstrap';
// const ProductDetailView = ({
//   product
// }) => {
//   const {
//     seller,
//     review,
//     sale,
//     quantity,
//     price,
//     name
//   } = product;
//   const stockStatus = getStockStatus(quantity);
//   return <div className="ps-xl-3 mt-3 mt-xl-0">
//       <span className="text-primary mb-2 d-inline-block">{seller?.storeName}</span>
//       <h4 className="mb-3">{name}</h4>
//       <p className="text-muted gap-1 d-flex float-start me-3">
//         {Array.from(new Array(Math.floor(review.stars))).map((_val, idx) => <IconifyIcon icon="fa6-solid:star" width={14} height={14} key={idx} className="text-base text-warning" />)}
//         {!Number.isInteger(review.stars) && <IconifyIcon icon="fa6-solid:star-half-stroke" width={14} height={14} className="text-warning" />}
//         {review.stars < 5 && Array.from(new Array(5 - Math.ceil(review.stars))).map((_val, idx) => <IconifyIcon icon="fa6-solid:star" key={idx} width={14} height={14} className="text-warning" />)}
//       </p>
//       <p className="mb-3">
//         {' '}
//         <span className="text-muted">( {review.count} Customer Reviews )</span>
//       </p>
//       {sale && <h6 className="text-danger text-uppercase">{sale.type === 'percent' ? sale.discount + '% off' : 'Flat ' + currency + sale.discount}</h6>}
//       <h4 className="mb-3">
//         Price :{' '}
//         <span className="text-muted me-2">
//           <del>{currency + price}</del>
//         </span>{' '}
//         <b>{currency + getCalculatedPrice(product)}</b>
//       </h4>
//       <h4>
//         <span className={`badge badge-soft-${stockStatus.variant} mb-3`}>{stockStatus.text}</span>
//       </h4>
//       <form className="d-flex flex-wrap align-items-center mb-3">
//         <label className="my-1 me-2" htmlFor="color">
//           Color:
//         </label>
//         <div className="me-3">
//           <select className="form-select form-select-sm my-1" id="color">
//             <option value={1}>Black </option>
//             <option value={2}>Blue </option>
//             <option value={3}>Midnight </option>
//           </select>
//         </div>
//         <label className="my-1 me-2" htmlFor="sizeinput">
//           Size:
//         </label>
//         <div className="me-sm-3">
//           <select className="form-select form-select-sm my-1" id="sizeinput">
//             <option defaultChecked>256 GB</option>
//             <option value={1}>512 GB</option>
//           </select>
//         </div>
//       </form>
//       <div className="mb-3 pb-3 border-bottom">
//         <h5>
//           Processor Brand : <span className="text-muted me-2" /> <b>Apple</b>
//         </h5>
//         <h5>
//           Processor Name : <span className="text-muted me-2" /> <b>M1</b>
//         </h5>
//         <h5>
//           SSD : <span className="text-muted me-2" /> <b>Yes</b>
//         </h5>
//         <h5>
//           SSD Capacity : <span className="text-muted me-2" /> <b>256 GB</b>
//         </h5>
//         <h5>
//           RAM : <span className="text-muted me-2" /> <b>8 GB</b>
//         </h5>
//       </div>
//       <div className="mb-3 flex-column d-flex">
//         <h5>About this item:</h5>
//         <p className="text-muted mb-1 icons-center">
//           <span>
//             <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />
//           </span>{' '}
//           Quad LED Backlit IPS Display (227 PPI, 400 nits Brightness, Wide Colour (P3), True Tone Technology)
//         </p>
//         <p className="text-muted mb-1 icons-center">
//           <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />
//           Built-in Speakers
//         </p>
//         <p className="text-muted mb-1 icons-center">
//           <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />
//           Three-mic Array with Directional Beamforming
//         </p>
//         <p className="text-muted mb-1 icons-center">
//           <span>
//             <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />
//           </span>{' '}
//           Stereo Speakers, Wide Stereo Sound, Support for Dolby Atmos Playback
//         </p>
//         <p className="text-muted mb-1 icons-center">
//           <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />
//           49.9 WHr Li-polymer Battery
//         </p>
//         <p className="text-muted mb-1 icons-center">
//           <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />
//           Backlit Magic Keyboard
//         </p>
//       </div>
//       <div className="d-flex gap-1">
//         <Button variant="danger" type="button" className="me-2">
//           <IconifyIcon icon="bx:heart" className="fs-18" />
//         </Button>
//         <Button variant="primary" type="button">
//           <IconifyIcon icon="bx:cart" className="fs-18 me-2" />
//           Add to cart
//         </Button>
//       </div>
//     </div>;
// };
// export default ProductDetailView;

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
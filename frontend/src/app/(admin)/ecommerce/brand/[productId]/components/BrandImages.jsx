import clsx from 'clsx';
import { useState } from 'react';
import { Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import brand1 from '@/assets/images/products/product-1(1).png';
import brand2 from '@/assets/images/products/product-1(2).png';
import brand3 from '@/assets/images/products/product-1(3).png';
import brand4 from '@/assets/images/products/product-1(4).png';
const BrandImages = ({
  brand
}) => {
  const {
    name
  } = brand;

  // You can replace below static images with the above ↑ images coming as props from parent element
  const brandImages = [brand2, brand1, brand3, brand4];
  const eventKeyPrefix = name + '-';
  const [activeImageTab, setActiveImageTab] = useState(eventKeyPrefix + 0);
  return <TabContainer activeKey={activeImageTab}>
      <TabContent>
        {brandImages.map((image, idx) => <TabPane key={idx} eventKey={eventKeyPrefix + idx} className="fade">
            <img src={image} alt={name + idx} className="img-fluid mx-auto d-block rounded" />
          </TabPane>)}
      </TabContent>
      <Nav variant="pills" justify>
        {brandImages.map((image, idx) => <NavItem onClick={() => setActiveImageTab(eventKeyPrefix + idx)} key={idx} className="nav-item">
            <NavLink as={'button'} className={clsx('brand-thumb', {
          active: eventKeyPrefix + idx === activeImageTab
        })}>
              <img src={image} alt={name + 2 + '-thumb'} className="img-fluid mx-auto rounded" />
            </NavLink>
          </NavItem>)}
      </Nav>
    </TabContainer>;
};
export default BrandImages;
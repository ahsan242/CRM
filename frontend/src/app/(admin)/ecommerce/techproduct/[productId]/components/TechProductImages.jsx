import clsx from 'clsx';
import { useState } from 'react';
import { Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import techproduct1 from '@/assets/images/products/product-1(1).png';
import techproduct2 from '@/assets/images/products/product-1(2).png';
import techproduct3 from '@/assets/images/products/product-1(3).png';
import techproduct4 from '@/assets/images/products/product-1(4).png';
const TechProductImages = ({
  techproduct
}) => {
  const {
    name
  } = techproduct;

  // You can replace below static images with the above ↑ images coming as props from parent element
  const techproductImages = [techproduct2, techproduct1, techproduct3, techproduct4];
  const eventKeyPrefix = name + '-';
  const [activeImageTab, setActiveImageTab] = useState(eventKeyPrefix + 0);
  return <TabContainer activeKey={activeImageTab}>
      <TabContent>
        {techproductImages.map((image, idx) => <TabPane key={idx} eventKey={eventKeyPrefix + idx} className="fade">
            <img src={image} alt={name + idx} className="img-fluid mx-auto d-block rounded" />
          </TabPane>)}
      </TabContent>
      <Nav variant="pills" justify>
        {techproductImages.map((image, idx) => <NavItem onClick={() => setActiveImageTab(eventKeyPrefix + idx)} key={idx} className="nav-item">
            <NavLink as={'button'} className={clsx('techproduct-thumb', {
          active: eventKeyPrefix + idx === activeImageTab
        })}>
              <img src={image} alt={name + 2 + '-thumb'} className="img-fluid mx-auto rounded" />
            </NavLink>
          </NavItem>)}
      </Nav>
    </TabContainer>;
};
export default TechProductImages;
import clsx from 'clsx';
import { useState } from 'react';
import { Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import techproductname1 from '@/assets/images/products/product-1(1).png';
import techproductname2 from '@/assets/images/products/product-1(2).png';
import techproductname3 from '@/assets/images/products/product-1(3).png';
import techproductname4 from '@/assets/images/products/product-1(4).png';
const TechProductNameImages = ({
  techproductname
}) => {
  const {
    name
  } = techproductname;

  // You can replace below static images with the above ↑ images coming as props from parent element
  const techproductnameImages = [techproductname2, techproductname1, techproductname3, techproductname4];
  const eventKeyPrefix = name + '-';
  const [activeImageTab, setActiveImageTab] = useState(eventKeyPrefix + 0);
  return <TabContainer activeKey={activeImageTab}>
      <TabContent>
        {techproductnameImages.map((image, idx) => <TabPane key={idx} eventKey={eventKeyPrefix + idx} className="fade">
            <img src={image} alt={name + idx} className="img-fluid mx-auto d-block rounded" />
          </TabPane>)}
      </TabContent>
      <Nav variant="pills" justify>
        {techproductnameImages.map((image, idx) => <NavItem onClick={() => setActiveImageTab(eventKeyPrefix + idx)} key={idx} className="nav-item">
            <NavLink as={'button'} className={clsx('techproductname-thumb', {
          active: eventKeyPrefix + idx === activeImageTab
        })}>
              <img src={image} alt={name + 2 + '-thumb'} className="img-fluid mx-auto rounded" />
            </NavLink>
          </NavItem>)}
      </Nav>
    </TabContainer>;
};
export default TechProductNameImages;
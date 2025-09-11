import clsx from 'clsx';
import { useState } from 'react';
import { Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import subcategory1 from '@/assets/images/categories/product-1(1).png';
import subcategory2 from '@/assets/images/categories/product-1(2).png';
import subcategory3 from '@/assets/images/categories/product-1(3).png';
import subcategory4 from '@/assets/images/categories/product-1(4).png';
const SubCategoryImages = ({
  subcategory
}) => {
  const {
    name
  } = subcategory;

  // You can replace below static images with the above ↑ images coming as props from parent element
  const subcategoryImages = [subcategory2, subcategory1, subcategory3, subcategory4];
  const eventKeyPrefix = name + '-';
  const [activeImageTab, setActiveImageTab] = useState(eventKeyPrefix + 0);
  return <TabContainer activeKey={activeImageTab}>
      <TabContent>
        {subcategoryImages.map((image, idx) => <TabPane key={idx} eventKey={eventKeyPrefix + idx} className="fade">
            <img src={image} alt={name + idx} className="img-fluid mx-auto d-block rounded" />
          </TabPane>)}
      </TabContent>
      <Nav variant="pills" justify>
        {subcategoryImages.map((image, idx) => <NavItem onClick={() => setActiveImageTab(eventKeyPrefix + idx)} key={idx} className="nav-item">
            <NavLink as={'button'} className={clsx('subcategory-thumb', {
          active: eventKeyPrefix + idx === activeImageTab
        })}>
              <img src={image} alt={name + 2 + '-thumb'} className="img-fluid mx-auto rounded" />
            </NavLink>
          </NavItem>)}
      </Nav>
    </TabContainer>;
};
export default SubCategoryImages;
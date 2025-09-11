import clsx from 'clsx';
import { useState } from 'react';
import { Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import category1 from '@/assets/images/categories/product-1(1).png';
import category2 from '@/assets/images/categories/product-1(2).png';
import category3 from '@/assets/images/categories/product-1(3).png';
import category4 from '@/assets/images/categories/product-1(4).png';
const CategoryImages = ({
  category
}) => {
  const {
    name
  } = category;

  // You can replace below static images with the above ↑ images coming as props from parent element
  const categoryImages = [category2, category1, category3, category4];
  const eventKeyPrefix = name + '-';
  const [activeImageTab, setActiveImageTab] = useState(eventKeyPrefix + 0);
  return <TabContainer activeKey={activeImageTab}>
      <TabContent>
        {categoryImages.map((image, idx) => <TabPane key={idx} eventKey={eventKeyPrefix + idx} className="fade">
            <img src={image} alt={name + idx} className="img-fluid mx-auto d-block rounded" />
          </TabPane>)}
      </TabContent>
      <Nav variant="pills" justify>
        {categoryImages.map((image, idx) => <NavItem onClick={() => setActiveImageTab(eventKeyPrefix + idx)} key={idx} className="nav-item">
            <NavLink as={'button'} className={clsx('category-thumb', {
          active: eventKeyPrefix + idx === activeImageTab
        })}>
              <img src={image} alt={name + 2 + '-thumb'} className="img-fluid mx-auto rounded" />
            </NavLink>
          </NavItem>)}
      </Nav>
    </TabContainer>;
};
export default CategoryImages;
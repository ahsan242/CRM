// import { Card, CardBody, Col, Row } from 'react-bootstrap';
// import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
// import CreateCategoryForms from './components/CreateCategoryForms';
// import PageMetaData from '@/components/PageTitle';
// const CreateCategory = () => {
//   return <>
//       <PageBreadcrumb title="Create Category" subName="Ecommerce" />
//       <PageMetaData title="Create Category" />

//       <Row>
//         <Col>
//           <Card>
//             <CardBody>
//               <CreateCategoryForms />
//             </CardBody>
//           </Card>
//         </Col>
//       </Row>
//     </>;
// };
// export default CreateCategory;

import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateCategoryForms from './components/CreateCategoryForms';
import CategoriesListTable from './components/CategoriesListTable'; // You'll need to create this component
import PageMetaData from '@/components/PageTitle';

const CreateCategory = () => {
  const [activeForm, setActiveForm] = useState('create'); // 'create', 'edit', or null
  
  return (
    <>
      <PageMetaData title="Create Category" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <PageBreadcrumb title="Category Management" subName="Ecommerce" />
            <ButtonGroup>
              <Button
                variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}
              >
                Create Category
              </Button>
              <Button
                variant={activeForm === 'edit' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'edit' ? null : 'edit')}
              >
                Edit Category
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      {activeForm && (
        <Row>
          <Col>
            <Card>
              <CardBody>
                {activeForm === 'create' ? (
                  <CreateCategoryForms />
                ) : (
                  <div>
                    <h4 className="mb-3">Edit Category</h4>
                    <p className="text-muted mb-4">Select a category to edit from the list below:</p>
                    {/* Replace with your CategoriesListTable component */}
                    <CategoriesListTable />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default CreateCategory;
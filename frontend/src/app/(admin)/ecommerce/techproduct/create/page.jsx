// import { Card, CardBody, Col, Row } from 'react-bootstrap';
// import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
// import CreateTechproductForms from './components/CreateTechProductForms';
// import PageMetaData from '@/components/PageTitle';
// const CreateTechproduct = () => {
//   return <>
//       <PageBreadcrumb title="Create Techproduct" subName="Ecommerce" />
//       <PageMetaData title="Create Techproduct" />

//       <Row>
//         <Col>
//           <Card>
//             <CardBody>
//               <CreateTechproductForms />
//             </CardBody>
//           </Card>
//         </Col>
//       </Row>
//     </>;
// };
// export default CreateTechproduct;


import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateTechproductForms from './components/CreateTechProductForms';
import TechproductsListTable from './components/TechproductsListTable'; // You'll need to create this component
import PageMetaData from '@/components/PageTitle';

const CreateTechproduct = () => {
  const [activeForm, setActiveForm] = useState('create'); // 'create', 'edit', or null
  
  return (
    <>
      <PageMetaData title="Create Techproduct" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <PageBreadcrumb title="Techproduct Management" subName="Ecommerce" />
            <ButtonGroup>
              <Button
                variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}
              >
                Create Techproduct
              </Button>
              <Button
                variant={activeForm === 'edit' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'edit' ? null : 'edit')}
              >
                Edit Techproduct
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
                  <CreateTechproductForms />
                ) : (
                  <div>
                    <h4 className="mb-3">Edit Techproduct</h4>
                    <p className="text-muted mb-4">Select a techproduct to edit from the list below:</p>
                    {/* Replace with your TechproductsListTable component */}
                    <TechproductsListTable />
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

export default CreateTechproduct;


import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateTechproductnameForms from './components/CreateTechProductNameForms';
import TechproductnamesListTable from './components/TechproductnamesListTable'; // You'll need to create this component
import PageMetaData from '@/components/PageTitle';

const CreateTechproductname = () => {
  const [activeForm, setActiveForm] = useState('create'); // 'create', 'edit', or null
  
  return (
    <>
      <PageMetaData title="Create Techproductname" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <PageBreadcrumb title="Techproductname Management" subName="Ecommerce" />
            <ButtonGroup>
              <Button
                variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}
              >
                Create Techproductname
              </Button>
              <Button
                variant={activeForm === 'edit' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'edit' ? null : 'edit')}
              >
                Edit Techproductname
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
                  <CreateTechproductnameForms />
                ) : (
                  <div>
                    <h4 className="mb-3">Edit Techproductname</h4>
                    <p className="text-muted mb-4">Select a techproductname to edit from the list below:</p>
                    {/* Replace with your TechproductnamesListTable component */}
                    <TechproductnamesListTable />
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

export default CreateTechproductname;
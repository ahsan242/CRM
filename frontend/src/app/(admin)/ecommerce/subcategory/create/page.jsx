
import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateSubCategoryForms from './components/CreateSubCategoryForms';
import SubCategoriesListTable from './components/SubCategoriesListTable'; // You'll need to create this component
import PageMetaData from '@/components/PageTitle';

const CreateSubCategory = () => {
  const [activeForm, setActiveForm] = useState('create'); // 'create', 'edit', or null
  
  return (
    <>
      <PageMetaData title="Create SubCategory" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <PageBreadcrumb title="SubCategory Management" subName="Ecommerce" />
            <ButtonGroup>
              <Button
                variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}
              >
                Create SubCategory
              </Button>
              <Button
                variant={activeForm === 'edit' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'edit' ? null : 'edit')}
              >
                Edit SubCategory
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
                  <CreateSubCategoryForms />
                ) : (
                  <div>
                    <h4 className="mb-3">Edit SubCategory</h4>
                    <p className="text-muted mb-4">Select a subcategory to edit from the list below:</p>
                    {/* Replace with your SubCategoriesListTable component */}
                    <SubCategoriesListTable />
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

export default CreateSubCategory;
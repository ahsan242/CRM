import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateBrandForms from './components/CreateBrandForms';
import BrandsListTable from './components/BrandsListTable'; // Import the BrandsListTable component
import PageMetaData from '@/components/PageTitle';

const CreateBrand = () => {
  const [activeForm, setActiveForm] = useState('create'); // 'create', 'edit', or null
  
  // Sample products data - you'll likely want to fetch this from an API
  const sampleProducts = [
    {
      id: 1,
      images: ['https://via.placeholder.com/50'],
      name: 'Sample Product 1',
      description: 'Sample description',
      category: { name: 'Electronics' },
      price: 99.99,
      quantity: 10,
      // Add other required properties based on your data structure
    },
    {
      id: 2,
      images: ['https://via.placeholder.com/50'],
      name: 'Sample Product 2',
      description: 'Another product',
      category: { name: 'Clothing' },
      price: 49.99,
      quantity: 0,
      // Add other required properties based on your data structure
    }
  ];
  
  return (
    <>
      <PageMetaData title="Create Brand" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <PageBreadcrumb title="Brand Management" subName="Ecommerce" />
            <ButtonGroup>
              <Button
                variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}
              >
                Create Brand
              </Button>
              <Button
                variant={activeForm === 'edit' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'edit' ? null : 'edit')}
              >
                Edit Brand
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
                  <CreateBrandForms />
                ) : (
                  <div>
                    <h4 className="mb-3">Edit Brand</h4>
                    <p className="text-muted mb-4">Select a brand to edit from the list below:</p>
                    <BrandsListTable products={sampleProducts} />
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

export default CreateBrand;
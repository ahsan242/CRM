

// src/app/(admin)/ecommerce/products/create/page.jsx
import { useState } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonGroup, Tabs, Tab } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateProductForms from './components/CreateProductForms';
import ProductsListTable from './components/ProductsListTable';
import IcecatImportForm from './components/IcecatImportForm';
import PageMetaData from '@/components/PageTitle';

const CreateProduct = () => {
  const [activeForm, setActiveForm] = useState('create');
  const [importMethod, setImportMethod] = useState('manual');
  const [importedProductData, setImportedProductData] = useState(null);
  
  const handleProductImported = (productData, useDirectly = false) => {
    setImportedProductData(productData);
    if (useDirectly) {
      setImportMethod('manual');
    }
  };

  const handleProductCreated = () => {
    setImportedProductData(null);
    setImportMethod('manual');
  };

  return (
    <>
      <PageMetaData title="Create Product" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <PageBreadcrumb title="Product Management" subName="Ecommerce" />
            <ButtonGroup>
              <Button
                variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}
              >
                Create Product
              </Button>
              <Button
                variant={activeForm === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveForm(activeForm === 'list' ? null : 'list')}
              >
                View Products
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
                  <Tabs 
                    activeKey={importMethod} 
                    onSelect={(k) => setImportMethod(k)}
                    className="mb-3"
                  >
                    <Tab eventKey="manual" title="Manual Entry">
                      <CreateProductForms 
                        onProductCreated={handleProductCreated}
                        importedData={importedProductData}
                      />
                    </Tab>
                    <Tab eventKey="icecat" title="Import from Icecat">
                      <IcecatImportForm onProductImported={handleProductImported} />
                    </Tab>
                  </Tabs>
                ) : (
                  <div>
                    <h4 className="mb-3">Product List</h4>
                    <p className="text-muted mb-4">All products in the system:</p>
                    <ProductsListTable />
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

export default CreateProduct;
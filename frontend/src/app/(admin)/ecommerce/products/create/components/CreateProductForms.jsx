
// src/app/(admin)/ecommerce/products/create/components/CreateProductForms.jsx
import { useState } from 'react';
import { Card, CardBody, Col, Row, Tab, Tabs } from 'react-bootstrap';
import GeneralDetailsForm from './GeneralDetailsForm';
import MetaDataForm from './MetaDataForm';
import ProductGalleryForm from './ProductGalleryForm';
import ProductSubmittedForm from './ProductSubmittedForm';

const CreateProductForms = ({ onProductCreated, importedData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [productCreated, setProductCreated] = useState(false);

  const handleProductCreated = () => {
    setProductCreated(true);
    setActiveTab('completed');
    onProductCreated?.();
  };

  const handleTabSelect = (tab) => {
    if (!productCreated || tab === 'completed') {
      setActiveTab(tab);
    }
  };

  if (productCreated) {
    return (
      <Row>
        <Col>
          <ProductSubmittedForm />
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col>
        <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
          <Tab eventKey="general" title="General">
            <Card>
              <CardBody>
                <GeneralDetailsForm 
                  onProductCreated={handleProductCreated} 
                  importedData={importedData}
                />
              </CardBody>
            </Card>
          </Tab>
          <Tab eventKey="metadata" title="Meta Data" disabled={!activeTab}>
            <Card>
              <CardBody>
                <MetaDataForm />
              </CardBody>
            </Card>
          </Tab>
          <Tab eventKey="gallery" title="Gallery" disabled={!activeTab}>
            <Card>
              <CardBody>
                <ProductGalleryForm />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
};

export default CreateProductForms;
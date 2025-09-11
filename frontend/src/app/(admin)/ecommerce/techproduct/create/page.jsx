import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateTechproductForms from './components/CreateTechProductForms';
import PageMetaData from '@/components/PageTitle';
const CreateTechproduct = () => {
  return <>
      <PageBreadcrumb title="Create Techproduct" subName="Ecommerce" />
      <PageMetaData title="Create Techproduct" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateTechproductForms />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>;
};
export default CreateTechproduct;
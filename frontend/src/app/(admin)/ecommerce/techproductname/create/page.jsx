import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateTechproductnameForms from './components/CreateTechProductNameForms';
import PageMetaData from '@/components/PageTitle';
const CreateTechproductname = () => {
  return <>
      <PageBreadcrumb title="Create Techproductname" subName="Ecommerce" />
      <PageMetaData title="Create Techproductname" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateTechproductnameForms />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>;
};
export default CreateTechproductname;
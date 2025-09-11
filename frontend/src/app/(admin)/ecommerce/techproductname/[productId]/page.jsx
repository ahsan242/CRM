import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { getTechProductNameById } from '@/helpers/data';
import TechProductNameDetailView from './components/TechProductNameDetailView';
import TechProductNameImages from './components/TechProductNameImages';
import PageMetaData from '@/components/PageTitle';
const TechProductNameDetail = () => {
  const [techproductname, setTechProductName] = useState();
  const {
    techproductnameId
  } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      if (techproductnameId) {
        const data = await getTechProductNameById(techproductnameId);
        if (data) setTechProductName(data);else navigate('/pages/error-404-alt');
      }
    })();
  }, [techproductnameId]);
  return <>
      <PageBreadcrumb title="TechProductName Details" subName="Ecommerce" />
      <PageMetaData title={techproductname?.name ?? 'TechProductName Details'} />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Row>
                <Col lg={4}>{techproductname && <TechProductNameImages techproductname={techproductname} />}</Col>
                <Col lg={8}>{techproductname && <TechProductNameDetailView techproductname={techproductname} />}</Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>;
};
export default TechProductNameDetail;
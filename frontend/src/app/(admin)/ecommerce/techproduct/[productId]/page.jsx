import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { getTechProductById } from '@/helpers/data';
import TechProductDetailView from './components/TechProductDetailView';
import TechProductImages from './components/TechProductImages';
import PageMetaData from '@/components/PageTitle';
const TechProductDetail = () => {
  const [techproduct, setTechProduct] = useState();
  const {
    techproductId
  } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      if (techproductId) {
        const data = await getTechProductById(techproductId);
        if (data) setTechProduct(data);else navigate('/pages/error-404-alt');
      }
    })();
  }, [techproductId]);
  return <>
      <PageBreadcrumb title="TechProduct Details" subName="Ecommerce" />
      <PageMetaData title={techproduct?.name ?? 'TechProduct Details'} />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Row>
                <Col lg={4}>{techproduct && <TechProductImages techproduct={techproduct} />}</Col>
                <Col lg={8}>{techproduct && <TechProductDetailView techproduct={techproduct} />}</Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>;
};
export default TechProductDetail;
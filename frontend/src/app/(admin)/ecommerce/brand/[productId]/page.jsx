import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { getBrandById } from '@/helpers/data';
import BrandDetailView from './components/BrandDetailView';
import BrandImages from './components/BrandImages';
import PageMetaData from '@/components/PageTitle';
const BrandDetail = () => {
  const [brand, setBrand] = useState();
  const {
    brandId
  } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      if (brandId) {
        const data = await getBrandById(brandId);
        if (data) setBrand(data);else navigate('/pages/error-404-alt');
      }
    })();
  }, [brandId]);
  return <>
      <PageBreadcrumb title="Brand Details" subName="Ecommerce" />
      <PageMetaData title={brand?.name ?? 'Brand Details'} />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Row>
                <Col lg={4}>{brand && <BrandImages brand={brand} />}</Col>
                <Col lg={8}>{brand && <BrandDetailView brand={brand} />}</Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>;
};
export default BrandDetail;
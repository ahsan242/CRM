import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllEcommerceBrands } from '@/helpers/data';
import BrandsListTable from './components/BrandsListTable';
const Brands = () => {
  const [brandsList, setBrandsList] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllEcommerceBrands();
      setBrandsList(data);
    };
    fetchData();
  }, []);
  return <>
      <PageMetaData title="Brands List" />
      <PageBreadcrumb title="Brands List" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input type="search" className="form-control" id="search" placeholder="Search ..." />
                </div>
                <div>
                  <Link to="/ecommerce/brands/create" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Brand
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>{ brandsList && <BrandsListTable brands={brandsList} />}</div>
          </Card>
        </Col>
      </Row>
    </>;
};
export default Brands;
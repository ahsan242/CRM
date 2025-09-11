import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllEcommercecategories } from '@/helpers/data';
import categoriesListTable from './components/categoriesListTable';
const categories = () => {
  const [categoriesList, setcategoriesList] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllEcommercecategories();
      setcategoriesList(data);
    };
    fetchData();
  }, []);
  return <>
      <PageMetaData title="categories List" />
      <PageBreadcrumb title="categories List" subName="Ecommerce" />
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
                  <Link to="/ecommerce/categories/create" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Category
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>{categoriesList && <categoriesListTable categories={categoriesList} />}</div>
          </Card>
        </Col>
      </Row>
    </>;
};
export default categories;


import { useEffect, useState } from "react";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageMetaData from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getSubCategories } from "@/http/SubCategory";
import SubcategoriesListTable from "./components/SubcategoriesListTable";

const Subcategories = () => {
  const [subcategoriesList, setSubcategoriesList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSubCategories();
      setSubcategoriesList(data);
    };
    fetchData();
  }, []);

  return (
    <>
      <PageMetaData title="Subcategories List" />
      <PageBreadcrumb title="Subcategories List" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    id="search"
                    placeholder="Search ..."
                  />
                </div>
                <div>
                  <Link
                    to="/ecommerce/subcategories/create"
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add SubCategory
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>
              {subcategoriesList.length > 0 && (
                <SubcategoriesListTable subcategories={subcategoriesList} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default Subcategories;

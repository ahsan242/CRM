// // // src/app/(admin)/ecommerce/products/create/page.jsx

// import { useState, useEffect } from 'react'
// import { Card, CardBody, Col, Row, Button, ButtonGroup, Tabs, Tab, Spinner, Alert, Badge, ProgressBar, Modal } from 'react-bootstrap'
// import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
// import CreateProductForms from './components/CreateProductForms'
// import ProductsListTable from './components/ProductsListTable'
// import IcecatImportForm from './components/IcecatImportForm'
// import ExcelImportForm from './components/ExcelImportForm'
// import PriceIportForm from './components/PriceImportForm'
// import ImportJobsTable from './components/ImportJobsTable'
// import PageMetaData from '@/components/PageTitle'
// import IconifyIcon from '@/components/wrappers/IconifyIcon'
// import { getProductCountByBrandAndStatus, getBrandStatusDetails } from '@/http/Product/index'

// // Enhanced Brand Stat Card with Status Breakdown
// const BrandStatCardEnhanced = ({ brand, stats, icon, variant, index, onViewDetails }) => {
//   const { counts, summary } = stats;
//   const total = counts.active + counts.inactive + counts.pending + counts.failed;

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'active': return 'success';
//       case 'inactive': return 'secondary';
//       case 'pending': return 'warning';
//       case 'failed': return 'danger';
//       default: return 'light';
//     }
//   }

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'active': return 'mdi:check-circle';
//       case 'inactive': return 'mdi:circle-outline';
//       case 'pending': return 'mdi:clock-outline';
//       case 'failed': return 'mdi:alert-circle';
//       default: return 'mdi:help-circle';
//     }
//   }

//   return (
//     <Card className="h-100 brand-stat-card">
//       <CardBody className="p-3">
//         <div className="d-flex align-items-start mb-2">
//           <div className="flex-shrink-0 me-3">
//             <Badge
//               bg={variant}
//               className="rounded-circle d-flex align-items-center justify-content-center"
//               style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: 'bold' }}>
//               {index}
//             </Badge>
//           </div>
//           <div className="flex-grow-1">
//             <div className="d-flex justify-content-between align-items-start">
//               <h6 className="mb-1 text-truncate">{brand}</h6>
//               <Badge bg={summary.needsAttention ? "warning" : "success"} text="dark" className="fs-12">
//                 {summary.successRate}
//               </Badge>
//             </div>
//             <div className="d-flex align-items-center mb-2">
//               <small className="text-muted">
//                 Total: <strong>{total}</strong> products
//               </small>
//             </div>

//             {/* Status Progress Bar */}
//             {total > 0 && (
//               <div className="mb-2">
//                 <div className="d-flex justify-content-between small text-muted mb-1">
//                   <span>Status Distribution</span>
//                 </div>
//                 <div className="status-progress" style={{ height: '6px' }}>
//                   <div className="d-flex h-100 rounded overflow-hidden">
//                     {counts.active > 0 && (
//                       <div
//                         className="bg-success"
//                         style={{ width: `${(counts.active / total) * 100}%` }}
//                         title={`Active: ${counts.active}`}
//                       />
//                     )}
//                     {counts.inactive > 0 && (
//                       <div
//                         className="bg-secondary"
//                         style={{ width: `${(counts.inactive / total) * 100}%` }}
//                         title={`Inactive: ${counts.inactive}`}
//                       />
//                     )}
//                     {counts.pending > 0 && (
//                       <div
//                         className="bg-warning"
//                         style={{ width: `${(counts.pending / total) * 100}%` }}
//                         title={`Pending: ${counts.pending}`}
//                       />
//                     )}
//                     {counts.failed > 0 && (
//                       <div
//                         className="bg-danger"
//                         style={{ width: `${(counts.failed / total) * 100}%` }}
//                         title={`Failed: ${counts.failed}`}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Status Counts */}
//             <div className="row g-1 text-center">
//               <div className="col-3">
//                 <div className="border rounded p-1">
//                   <IconifyIcon icon={getStatusIcon('active')} height={14} className="text-success" />
//                   <div className="small fw-bold text-success">{counts.active}</div>
//                   <small className="text-muted d-none d-sm-block">Active</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border rounded p-1">
//                   <IconifyIcon icon={getStatusIcon('inactive')} height={14} className="text-secondary" />
//                   <div className="small fw-bold text-secondary">{counts.inactive}</div>
//                   <small className="text-muted d-none d-sm-block">Inactive</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border rounded p-1">
//                   <IconifyIcon icon={getStatusIcon('pending')} height={14} className="text-warning" />
//                   <div className="small fw-bold text-warning">{counts.pending}</div>
//                   <small className="text-muted d-none d-sm-block">Pending</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border rounded p-1">
//                   <IconifyIcon icon={getStatusIcon('failed')} height={14} className="text-danger" />
//                   <div className="small fw-bold text-danger">{counts.failed}</div>
//                   <small className="text-muted d-none d-sm-block">Failed</small>
//                 </div>
//               </div>
//             </div>

//             {/* Action Button */}
//             {total > 0 && (
//               <div className="mt-2">
//                 <Button
//                   variant="outline-primary"
//                   size="sm"
//                   className="w-100"
//                   onClick={() => onViewDetails(brand)}
//                 >
//                   View Details
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardBody>
//     </Card>
//   )
// }

// // Brand Details Modal
// const BrandDetailsModal = ({ show, onHide, brandName, brandDetails, loading }) => {
//   if (!brandName) return null;

//   return (
//     <Modal show={show} onHide={onHide} size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>
//           <IconifyIcon icon="mdi:information" className="me-2" />
//           Brand Details: {brandName}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {loading ? (
//           <div className="text-center py-4">
//             <Spinner animation="border" />
//             <div className="mt-2">Loading brand details...</div>
//           </div>
//         ) : brandDetails ? (
//           <div>
//             <div className="row text-center mb-4">
//               <div className="col-3">
//                 <div className="border rounded p-3">
//                   <div className="h4 text-success mb-0">{brandDetails.summary?.active || 0}</div>
//                   <small className="text-muted">Active Products</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border rounded p-3">
//                   <div className="h4 text-secondary mb-0">{brandDetails.summary?.inactive || 0}</div>
//                   <small className="text-muted">Inactive</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border rounded p-3">
//                   <div className="h4 text-warning mb-0">{brandDetails.summary?.pending || 0}</div>
//                   <small className="text-muted">Pending</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border rounded p-3">
//                   <div className="h4 text-danger mb-0">{brandDetails.summary?.failed || 0}</div>
//                   <small className="text-muted">Failed</small>
//                 </div>
//               </div>
//             </div>

//             {/* Active Products */}
//             {brandDetails.details?.activeProducts?.count > 0 && (
//               <div className="mb-4">
//                 <h6 className="text-success">
//                   <IconifyIcon icon="mdi:check-circle" className="me-1" />
//                   Active Products ({brandDetails.details.activeProducts.count})
//                 </h6>
//                 <div className="bg-light rounded p-2">
//                   {brandDetails.details.activeProducts.products?.map((product, idx) => (
//                     <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom">
//                       <span>{product.title || product.sku}</span>
//                       <Badge bg="success" className="fs-12">Active</Badge>
//                     </div>
//                   ))}
//                   {brandDetails.details.activeProducts.count > 5 && (
//                     <div className="text-center mt-2">
//                       <small className="text-muted">
//                         ... and {brandDetails.details.activeProducts.count - 5} more active products
//                       </small>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Import Queue Status */}
//             {brandDetails.details?.importQueue && (
//               <div>
//                 <h6 className="text-warning">
//                   <IconifyIcon icon="mdi:clock-outline" className="me-1" />
//                   Import Queue Status
//                 </h6>
//                 {Object.entries(brandDetails.details.importQueue).map(([status, items]) => (
//                   items.length > 0 && (
//                     <div key={status} className="mb-3">
//                       <div className="d-flex justify-content-between align-items-center mb-1">
//                         <span className="text-capitalize">
//                           {status} ({items.length})
//                         </span>
//                         <Badge
//                           bg={
//                             status === 'pending' ? 'warning' :
//                             status === 'inactive' ? 'secondary' :
//                             status === 'failed' ? 'danger' : 'light'
//                           }
//                         >
//                           {status}
//                         </Badge>
//                       </div>
//                       <div className="bg-light rounded p-2">
//                         {items.slice(0, 3).map((item, idx) => (
//                           <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom">
//                             <small>{item.sku}</small>
//                             <small className="text-muted">{item.distributor}</small>
//                           </div>
//                         ))}
//                         {items.length > 3 && (
//                           <div className="text-center mt-1">
//                             <small className="text-muted">
//                               ... and {items.length - 3} more
//                             </small>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )
//                 ))}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="text-center text-muted py-4">
//             <IconifyIcon icon="mdi:alert-circle" height={48} className="mb-2" />
//             <div>No detailed information available for this brand.</div>
//           </div>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// // Brands Overview Component
// const BrandsOverview = ({ brandsData, loading, error, onViewBrandDetails }) => {
//   const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark']

//   if (loading) {
//     return (
//       <Card>
//         <CardBody className="text-center py-4">
//           <Spinner animation="border" role="status" className="me-2" />
//           Loading brands and product status...
//         </CardBody>
//       </Card>
//     )
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardBody>
//           <Alert variant="danger" className="mb-0">
//             Error loading brand statistics: {error}
//           </Alert>
//         </CardBody>
//       </Card>
//     )
//   }

//   if (!brandsData || !brandsData.brands || brandsData.brands.length === 0) {
//     return (
//       <Card>
//         <CardBody className="text-center text-muted py-4">
//           <IconifyIcon icon="mdi:package-variant" height={48} className="text-muted mb-2" />
//           <div>No brands with products found.</div>
//           <small>Create your first brand and import products to see statistics.</small>
//         </CardBody>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardBody>
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h5 className="mb-0">Brands Overview</h5>
//           <div>
//             <Badge bg="primary" pill className="me-2">
//               {brandsData.brands.length} brands
//             </Badge>
//             <Badge bg="success" pill>
//               Updated: {new Date(brandsData.lastUpdated).toLocaleTimeString()}
//             </Badge>
//           </div>
//         </div>

//         {/* Overall Summary */}
//         {brandsData.overall && (
//           <div className="mb-3 p-3 bg-light rounded">
//             <div className="row text-center">
//               <div className="col-3">
//                 <div className="border-end">
//                   <div className="h4 mb-0 text-success">{brandsData.overall.totals.active}</div>
//                   <small className="text-muted">Active</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border-end">
//                   <div className="h4 mb-0 text-secondary">{brandsData.overall.totals.inactive}</div>
//                   <small className="text-muted">Inactive</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div className="border-end">
//                   <div className="h4 mb-0 text-warning">{brandsData.overall.totals.pending}</div>
//                   <small className="text-muted">Pending</small>
//                 </div>
//               </div>
//               <div className="col-3">
//                 <div>
//                   <div className="h4 mb-0 text-danger">{brandsData.overall.totals.failed}</div>
//                   <small className="text-muted">Failed</small>
//                 </div>
//               </div>
//             </div>
//             <div className="text-center mt-2">
//               <small className="text-muted">
//                 Success Rate: <strong>{brandsData.overall.summary.successRate}</strong> •
//                 Total Brands: <strong>{brandsData.overall.summary.totalBrands}</strong> •
//                 Brands with Products: <strong>{brandsData.overall.summary.brandsWithProducts}</strong>
//               </small>
//             </div>
//           </div>
//         )}

//         <div
//           className="brands-overview"
//           style={{
//             maxHeight: '500px',
//             overflowY: 'auto',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '12px',
//             padding: '5px',
//           }}>
//           {brandsData.brands.map((brand, idx) => (
//             <BrandStatCardEnhanced
//               key={brand.brandId || idx}
//               brand={brand.brandName}
//               stats={brand}
//               icon="mdi:tag"
//               variant={variants[idx % variants.length]}
//               index={idx + 1}
//               onViewDetails={onViewBrandDetails}
//             />
//           ))}
//         </div>
//       </CardBody>
//     </Card>
//   )
// }

// const CreateProduct = () => {
//   const [activeForm, setActiveForm] = useState('create')
//   const [importMethod, setImportMethod] = useState('manual')
//   const [importedProductData, setImportedProductData] = useState(null)

//   // Brand statistics state
//   const [brandsData, setBrandsData] = useState(null)
//   const [brandsLoading, setBrandsLoading] = useState(true)
//   const [brandsError, setBrandsError] = useState(null)

//   // Brand details modal state
//   const [showBrandModal, setShowBrandModal] = useState(false)
//   const [selectedBrand, setSelectedBrand] = useState(null)
//   const [brandDetails, setBrandDetails] = useState(null)
//   const [brandDetailsLoading, setBrandDetailsLoading] = useState(false)

//   // Fetch brand statistics on component mount
//   useEffect(() => {
//     fetchBrandStatistics()
//   }, [])

//   const fetchBrandStatistics = async () => {
//     try {
//       setBrandsLoading(true)
//       setBrandsError(null)
//       const response = await getProductCountByBrandAndStatus()

//       if (response.success) {
//         setBrandsData(response.data)
//       } else {
//         throw new Error(response.error || 'Failed to fetch brand statistics')
//       }
//     } catch (error) {
//       console.error('Error fetching brand statistics:', error)
//       setBrandsError(error.response?.data?.message || error.message || 'Failed to fetch brand statistics')
//     } finally {
//       setBrandsLoading(false)
//     }
//   }

//   const handleViewBrandDetails = async (brandName) => {
//     setSelectedBrand(brandName)
//     setShowBrandModal(true)
//     setBrandDetails(null)

//     try {
//       setBrandDetailsLoading(true)
//       const response = await getBrandStatusDetails(brandName)
//       if (response.success) {
//         setBrandDetails(response.data)
//       }
//     } catch (error) {
//       console.error('Error fetching brand details:', error)
//       // Don't show error in modal to avoid breaking UX
//     } finally {
//       setBrandDetailsLoading(false)
//     }
//   }

//   const handleCloseBrandModal = () => {
//     setShowBrandModal(false)
//     setSelectedBrand(null)
//     setBrandDetails(null)
//   }

//   const handleProductImported = (productData, useDirectly = false) => {
//     setImportedProductData(productData)
//     if (useDirectly) {
//       setImportMethod('manual')
//     }
//   }

//   const handleProductsImported = (jobId) => {
//     console.log('Products import scheduled with job ID:', jobId)
//     // Refresh brand statistics after import
//     setTimeout(() => {
//       fetchBrandStatistics()
//     }, 2000)
//   }

//   const handlePriceImported = (jobId) => {
//     console.log('Price import scheduled with job ID:', jobId)
//   }

//   const handleProductCreated = () => {
//     setImportedProductData(null)
//     setImportMethod('manual')
//     // Refresh brand statistics after creating a product
//     setTimeout(() => {
//       fetchBrandStatistics()
//     }, 1000)
//   }

//   return (
//     <>
//       <PageMetaData title="Product Management" />

//       <Row className="mb-3">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <PageBreadcrumb title="Product Management" subName="Ecommerce" />
//             <ButtonGroup>
//               <Button
//                 variant={activeForm === 'create' ? 'primary' : 'outline-primary'}
//                 onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')}>
//                 Create Product
//               </Button>
//               <Button
//                 variant={activeForm === 'list' ? 'primary' : 'outline-primary'}
//                 onClick={() => setActiveForm(activeForm === 'list' ? null : 'list')}>
//                 View Products
//               </Button>
//               <Button
//                 variant={activeForm === 'imports' ? 'primary' : 'outline-primary'}
//                 onClick={() => setActiveForm(activeForm === 'imports' ? null : 'imports')}>
//                 Import History
//               </Button>
//             </ButtonGroup>
//           </div>
//         </Col>
//       </Row>

//       {/* Brands Overview Section - Always Visible */}
//       <Row className="mb-4">
//         <Col lg={12}>
//           <BrandsOverview
//             brandsData={brandsData}
//             loading={brandsLoading}
//             error={brandsError}
//             onViewBrandDetails={handleViewBrandDetails}
//           />
//         </Col>
//       </Row>

//       {/* Brand Details Modal */}
//       <BrandDetailsModal
//         show={showBrandModal}
//         onHide={handleCloseBrandModal}
//         brandName={selectedBrand}
//         brandDetails={brandDetails}
//         loading={brandDetailsLoading}
//       />

//       {activeForm && (
//         <Row>
//           <Col>
//             <Card>
//               <CardBody>
//                 {activeForm === 'create' ? (
//                   <Tabs activeKey={importMethod} onSelect={(k) => setImportMethod(k)} className="mb-3">
//                     <Tab eventKey="manual" title="Manual Entry">
//                       <CreateProductForms onProductCreated={handleProductCreated} importedData={importedProductData} />
//                     </Tab>
//                     <Tab eventKey="icecat" title="Single Import">
//                       <IcecatImportForm onProductImported={handleProductImported} />
//                     </Tab>
//                     <Tab eventKey="excel" title="Bulk Excel Import">
//                       <ExcelImportForm onProductsImported={handleProductsImported} />
//                     </Tab>
//                     <Tab eventKey="importprice" title="Price Import">
//                       <PriceIportForm onProductsImported={handlePriceImported} />
//                     </Tab>
//                   </Tabs>
//                 ) : activeForm === 'list' ? (
//                   <div>
//                     <h4 className="mb-3">Product List</h4>
//                     <p className="text-muted mb-4">All products in the system:</p>
//                     <ProductsListTable />
//                   </div>
//                 ) : (
//                   <div>
//                     <h4 className="mb-3">Import History</h4>
//                     <p className="text-muted mb-4">Monitor your bulk import jobs:</p>
//                     <ImportJobsTable />
//                   </div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       )}
//     </>
//   )
// }

// export default CreateProduct

import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Badge,
  ProgressBar,
  Modal,
  ListGroup,
  Dropdown,
  Form,
} from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import CreateProductForms from './components/CreateProductForms'
import ProductsListTable from './components/ProductsListTable'
import IcecatImportForm from './components/IcecatImportForm'
import ExcelImportForm from './components/ExcelImportForm'
import PriceIportForm from './components/PriceImportForm'
import ImportJobsTable from './components/ImportJobsTable'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getProductCountByBrandAndStatus, getBrandStatusDetails } from '@/http/Product/index'

// Advanced Brand Card with Micro-interactions
const BrandCard = ({ brand, stats, isActive, onClick, index, performance }) => {
  const { counts, summary } = stats
  const total = counts.active + counts.inactive + counts.pending + counts.failed
  const activePercentage = total > 0 ? (counts.active / total) * 100 : 0

  const getPerformanceColor = (perf) => {
    if (perf >= 80) return 'success'
    if (perf >= 60) return 'warning'
    return 'danger'
  }

  return (
    <Card
      className={`brand-card ${isActive ? 'active' : ''}`}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isActive ? '2px solid #3b71ca' : '1px solid #e9ecef',
        transform: isActive ? 'translateX(8px) scale(1.02)' : 'translateX(0)',
        background: isActive ? 'linear-gradient(135deg, #3b71ca 0%, #2a56a5 100%)' : 'white',
        boxShadow: isActive ? '0 8px 25px rgba(59, 113, 202, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
      onClick={onClick}>
      {/* Performance Indicator Bar */}
      <div
        className="performance-bar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, 
            #28a745 ${performance}%, 
            #e9ecef ${performance}%)`,
        }}
      />

      <CardBody className="p-3">
        <div className="d-flex align-items-center">
          {/* Brand Index with Gradient */}
          <div className="flex-shrink-0 me-3">
            <div
              className="brand-index rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                background: isActive ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: isActive ? '#3b71ca' : 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
              {index}
            </div>
          </div>

          {/* Brand Content */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className={`mb-0 ${isActive ? 'text-white' : 'text-dark'}`}>{brand}</h6>
              <Badge
                bg={isActive ? 'light' : getPerformanceColor(performance)}
                text={isActive ? 'dark' : 'white'}
                className="fs-12"
                style={{
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                {performance}%
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="d-flex justify-content-between small mb-1">
                <span className={isActive ? 'text-white-50' : 'text-muted'}>Active</span>
                <span className={isActive ? 'text-white' : 'text-dark'}>
                  {counts.active}/{total}
                </span>
              </div>
              <ProgressBar
                now={activePercentage}
                variant={isActive ? 'light' : 'success'}
                style={{
                  height: '6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e9ecef',
                }}
              />
            </div>

            {/* Status Indicators */}
            <div className="d-flex justify-content-between">
              <div className="d-flex gap-1">
                {counts.pending > 0 && (
                  <div className="status-indicator" title={`${counts.pending} pending`}>
                    <IconifyIcon icon="mdi:clock-outline" height={12} className="text-warning" />
                    <small className={isActive ? 'text-white-50' : 'text-muted'}>{counts.pending}</small>
                  </div>
                )}
                {counts.failed > 0 && (
                  <div className="status-indicator" title={`${counts.failed} failed`}>
                    <IconifyIcon icon="mdi:alert-circle" height={12} className="text-danger" />
                    <small className={isActive ? 'text-white-50' : 'text-muted'}>{counts.failed}</small>
                  </div>
                )}
              </div>
              <small className={isActive ? 'text-white-50' : 'text-muted'}>{summary.successRate}</small>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Advanced Analytics Card with Sparklines
const AnalyticsCard = ({ title, value, change, icon, color, trend, subtitle, sparkline }) => {
  const isPositive = change >= 0

  return (
    <Card className="analytics-card h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div
            className={`analytics-icon avatar-lg bg-${color} bg-opacity-10 rounded-circle flex-centered`}
            style={{
              background: `linear-gradient(135deg, var(--bs-${color}) 0%, var(--bs-${color}-dark) 100%)`,
              opacity: 0.1,
            }}>
            <IconifyIcon icon={icon} height={24} className={`text-${color}`} />
          </div>
          <div className="text-end">
            <Badge bg={isPositive ? 'success' : 'danger'} className="fs-12 mb-1">
              {isPositive ? '↗' : '↘'} {Math.abs(change)}%
            </Badge>
            <div className="text-muted small">{subtitle}</div>
          </div>
        </div>

        <h3 className="text-dark mb-2">{value}</h3>
        <p className="text-muted mb-3 small">{title}</p>

        {/* Mini Sparkline */}
        {sparkline && (
          <div className="sparkline-container">
            <div className="d-flex align-items-center gap-2">
              <div className="sparkline" style={{ height: '20px', flex: 1 }}>
                {sparkline.map((point, index) => (
                  <div
                    key={index}
                    className="sparkline-bar"
                    style={{
                      height: `${point}%`,
                      backgroundColor: isPositive ? '#28a745' : '#dc3545',
                      width: '4px',
                      display: 'inline-block',
                      margin: '0 1px',
                      borderRadius: '2px',
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
              <small className={`text-${isPositive ? 'success' : 'danger'} fw-semibold`}>{trend}</small>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

// Circular Progress Gauge
const CircularProgressGauge = ({ percentage, label, color = 'primary', size = 80 }) => {
  const radius = size / 2 - 5
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="circular-gauge text-center position-relative">
      <svg width={size} height={size} className="gauge-svg">
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e9ecef" strokeWidth="4" fill="none" />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`var(--bs-${color})`}
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div
        className="gauge-content position-absolute top-50 start-50 translate-middle"
        style={{
          width: '100%',
          textAlign: 'center',
        }}>
        <div className="h5 mb-0 text-dark fw-bold">{percentage}%</div>
        <small className="text-muted">{label}</small>
      </div>
    </div>
  )
}

// Advanced Status Distribution with Donut Chart
const StatusDistribution = ({ counts, total }) => {
  const statusData = [
    { status: 'active', count: counts.active, color: 'success', icon: 'mdi:check-circle' },
    { status: 'inactive', count: counts.inactive, color: 'secondary', icon: 'mdi:pause-circle' },
    { status: 'pending', count: counts.pending, color: 'warning', icon: 'mdi:clock-outline' },
    { status: 'failed', count: counts.failed, color: 'danger', icon: 'mdi:alert-circle' },
  ].filter((item) => item.count > 0)

  const totalAngle = statusData.reduce((sum, item) => sum + (item.count / total) * 360, 0)
  let currentAngle = 0

  return (
    <Card className="h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Status Distribution</h6>
          <Badge bg="light" text="dark" className="fs-12">
            {total} Total
          </Badge>
        </div>

        <div className="row align-items-center">
          <Col md={6}>
            <div className="donut-chart position-relative" style={{ height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 120 120" className="position-absolute">
                {statusData.map((item, index) => {
                  const segmentAngle = (item.count / total) * 360
                  const largeArc = segmentAngle > 180 ? 1 : 0

                  const x1 = 60 + 40 * Math.cos((currentAngle * Math.PI) / 180)
                  const y1 = 60 + 40 * Math.sin((currentAngle * Math.PI) / 180)
                  const x2 = 60 + 40 * Math.cos(((currentAngle + segmentAngle) * Math.PI) / 180)
                  const y2 = 60 + 40 * Math.sin(((currentAngle + segmentAngle) * Math.PI) / 180)

                  const pathData = [`M 60 60`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`, `Z`].join(' ')

                  currentAngle += segmentAngle

                  return <path key={item.status} d={pathData} fill={`var(--bs-${item.color})`} opacity="0.8" />
                })}
                <circle cx="60" cy="60" r="25" fill="white" />
              </svg>
            </div>
          </Col>
          <Col md={6}>
            <div className="status-legend">
              {statusData.map((item, index) => (
                <div key={item.status} className="d-flex align-items-center mb-2">
                  <div
                    className="color-indicator rounded me-2"
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: `var(--bs-${item.color})`,
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-capitalize small">{item.status}</span>
                      <small className="text-muted">{item.count}</small>
                    </div>
                    <ProgressBar now={(item.count / total) * 100} variant={item.color} style={{ height: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </div>
      </CardBody>
    </Card>
  )
}

// Performance Metrics Grid
const PerformanceMetrics = ({ metrics }) => {
  return (
    <Card className="h-100">
      <CardBody>
        <h6 className="mb-3">Performance Insights</h6>
        <div className="row g-3">
          {metrics.map((metric, index) => (
            <div key={index} className="col-6">
              <div className="text-center p-3 border rounded position-relative">
                <CircularProgressGauge percentage={metric.value} label={metric.label} color={metric.color} size={80} />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

// Quick Actions with Hover Effects
const QuickActions = ({ onAction }) => {
  const actions = [
    {
      icon: 'mdi:rocket-launch',
      label: 'Manual Entry',
      description: 'Add new product to catalog',
      variant: 'primary',
      action: 'create',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: 'mdi:database-import',
      label: 'Bulk Import',
      description: 'Mass import from Excel/CSV',
      variant: 'success',
      action: 'import',
      gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    },
    {
      icon: 'mdi:chart-timeline',
      label: 'Product Analytics',
      description: 'Deep dive into products',
      variant: 'info',
      action: 'analytics',
      gradient: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
    },
    {
      icon: 'mdi:refresh',
      label: 'Sync Data',
      description: 'Update all statistics',
      variant: 'warning',
      action: 'refresh',
      gradient: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
    },
  ]

  return (
    <Card>
      <CardBody>
        <h6 className="mb-3">Quick Actions</h6>
        <div className="row g-2">
          {actions.map((action, index) => (
            <div key={index} className="col-6">
              <div
                className="quick-action-card p-3 rounded border-0 text-white"
                style={{
                  background: action.gradient,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                }}
                onClick={() => onAction(action.action)}>
                <div className="d-flex align-items-center">
                  <IconifyIcon icon={action.icon} height={20} className="me-2" />
                  <div>
                    <div className="small fw-semibold">{action.label}</div>
                    <small className="opacity-75">{action.description}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

// Enhanced Dashboard Header
const DashboardHeader = ({ selectedBrand, onFilterChange, lastUpdated }) => {
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <Card className="mb-4">
      <CardBody className="py-3">
        <Row className="align-items-center">
          <Col md={6}>
            <div className="d-flex align-items-center">
              <div
                className="avatar-lg bg-primary bg-opacity-10 rounded-circle flex-centered me-3"
                style={{
                  background: 'linear-gradient(135deg, #3b71ca 0%, #2a56a5 100%)',
                  opacity: 0.1,
                }}>
                <IconifyIcon icon="mdi:chart-box" height={24} className="text-primary" />
              </div>
              <div>
                <h4 className="mb-1">Brand Analytics Dashboard</h4>
                <p className="text-muted mb-0">
                  Real-time insights for {selectedBrand || 'all brands'} • Updated {lastUpdated}
                </p>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-end gap-2">
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  <IconifyIcon icon="mdi:calendar" className="me-1" />
                  {timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setTimeRange('7d')}>7 Days</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange('30d')}>30 Days</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange('90d')}>90 Days</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Button variant="outline-secondary" size="sm">
                <IconifyIcon icon="mdi:download" className="me-1" />
                Export
              </Button>

              <Button variant="primary" size="sm">
                <IconifyIcon icon="mdi:refresh" className="me-1" />
                Refresh
              </Button>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

// Main Dashboard Component
const BrandsDashboard = ({ brandsData, loading, error, selectedBrand, onBrandSelect, onQuickAction }) => {
  const selectedBrandData = useMemo(
    () => (selectedBrand ? brandsData?.brands?.find((brand) => brand.brandName === selectedBrand) : brandsData?.brands?.[0]),
    [selectedBrand, brandsData],
  )

  // Mock performance metrics
  const performanceMetrics = [
    { label: 'Success', value: 85, color: 'success' },
    { label: 'Active', value: 72, color: 'primary' },
    { label: 'Growth', value: 45, color: 'info' },
    { label: 'Quality', value: 68, color: 'warning' },
  ]

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <div className="loading-spinner mb-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <h5>Loading Brand Analytics</h5>
          <p className="text-muted">Crunching the latest numbers...</p>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <IconifyIcon icon="mdi:alert-circle-outline" height={64} className="text-danger mb-3" />
          <h5 className="text-danger">Unable to Load Data</h5>
          <p className="text-muted">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            <IconifyIcon icon="mdi:refresh" className="me-1" />
            Try Again
          </Button>
        </CardBody>
      </Card>
    )
  }

  if (!brandsData || !brandsData.brands || brandsData.brands.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <div
            className="empty-state-illustration mb-4 mx-auto"
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconifyIcon icon="mdi:package-variant" height={48} className="text-white" />
          </div>
          <h4>No Brands Found</h4>
          <p className="text-muted mb-4">Start building your product catalog by adding your first brand.</p>
          <Button variant="primary" size="lg" onClick={() => onQuickAction('create')}>
            <IconifyIcon icon="mdi:rocket-launch" className="me-2" />
            Launch Your First Brand
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="brands-dashboard">
      <DashboardHeader selectedBrand={selectedBrand} lastUpdated={new Date().toLocaleTimeString()} />

      <Row>
        {/* Left Sidebar - Enhanced Brand Scroller */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 brands-sidebar">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Brands</h5>
                <Badge bg="primary" pill className="fs-12">
                  {brandsData.brands.length}
                </Badge>
              </div>

              <div
                className="brands-scroller"
                style={{
                  maxHeight: '600px',
                  overflowY: 'auto',
                  padding: '8px',
                }}>
                <div className="d-grid gap-2">
                  {brandsData.brands.map((brand, index) => (
                    <BrandCard
                      key={brand.brandId || index}
                      brand={brand.brandName}
                      stats={brand}
                      isActive={selectedBrand === brand.brandName || (!selectedBrand && index === 0)}
                      onClick={() => onBrandSelect(brand.brandName)}
                      index={index + 1}
                      performance={Math.random() * 40 + 60} // Mock performance score
                    />
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Right Content - Enhanced Analytics */}
        <Col lg={8}>
          {selectedBrandData && (
            <>
              {/* Enhanced Analytics Cards */}
              <Row className="mb-4">
                <Col md={3} className="mb-3">
                  <AnalyticsCard
                    title="Active Products"
                    value={selectedBrandData.counts.active}
                    change={15.2}
                    icon="mdi:check-circle"
                    color="success"
                    trend="+12 this week"
                    subtitle="Live Products"
                    sparkline={[60, 65, 70, 68, 72, 75, selectedBrandData.counts.active]}
                  />
                </Col>
                <Col md={3} className="mb-3">
                  <AnalyticsCard
                    title="Total Views"
                    value="13.6K"
                    change={8.3}
                    icon="mdi:eye"
                    color="info"
                    trend="+1.2K views"
                    subtitle="Page Views"
                    sparkline={[40, 45, 50, 55, 60, 65, 70]}
                  />
                </Col>
                <Col md={3} className="mb-3">
                  <AnalyticsCard
                    title="Conversions"
                    value="65.2%"
                    change={12.1}
                    icon="mdi:trending-up"
                    color="warning"
                    trend="+5.2% growth"
                    subtitle="Conversion Rate"
                    sparkline={[50, 55, 58, 60, 62, 64, 65]}
                  />
                </Col>
                <Col md={3} className="mb-3">
                  <AnalyticsCard
                    title="Revenue"
                    value="$24.8K"
                    change={18.7}
                    icon="mdi:currency-usd"
                    color="danger"
                    trend="+$3.8K revenue"
                    subtitle="Monthly Revenue"
                    sparkline={[45, 50, 55, 60, 65, 70, 75]}
                  />
                </Col>
              </Row>

              {/* Charts and Metrics */}
              <Row className="mb-4">
                <Col md={6} className="mb-4">
                  <StatusDistribution counts={selectedBrandData.counts} total={Object.values(selectedBrandData.counts).reduce((a, b) => a + b, 0)} />
                </Col>
                <Col md={6} className="mb-4">
                  <PerformanceMetrics metrics={performanceMetrics} />
                </Col>
              </Row>

              {/* Quick Actions */}
              <Row>
                <Col md={12}>
                  <QuickActions onAction={onQuickAction} />
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}

// Enhanced Forms Overlay Component
const FormsOverlay = ({
  activeForm,
  importMethod,
  onClose,
  onImportMethodChange,
  importedProductData,
  onProductCreated,
  onProductImported,
  onProductsImported,
  onPriceImported,
}) => {
  if (!activeForm) return null

  return (
    <div
      className="forms-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '20px',
        backdropFilter: 'blur(5px)',
      }}>
      <Card
        className="forms-card"
        style={{
          width: '95%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
          border: 'none',
          borderRadius: '15px',
        }}>
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h3 className="mb-1 text-primary">
                {activeForm === 'create' ? '🚀 Product Management' : activeForm === 'list' ? '📦 Product Catalog' : '📊 Import History'}
              </h3>
              <p className="text-muted mb-0">
                {activeForm === 'create'
                  ? 'Create and manage your products'
                  : activeForm === 'list'
                    ? 'Browse and manage all products'
                    : 'Track your import operations'}
              </p>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onClose}
              style={{
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconifyIcon icon="mdi:close" />
            </Button>
          </div>

          {activeForm === 'create' ? (
            <div className="create-product-forms">
              <Tabs
                activeKey={importMethod}
                onSelect={onImportMethodChange}
                className="mb-4 custom-tabs"
                style={{
                  borderBottom: '2px solid #e9ecef',
                }}>
                <Tab
                  eventKey="manual"
                  title={
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon="mdi:plus-circle" className="me-2" />
                      <span>Manual Entry</span>
                    </div>
                  }>
                  <div className="p-3">
                    <CreateProductForms onProductCreated={onProductCreated} importedData={importedProductData} />
                  </div>
                </Tab>
                <Tab
                  eventKey="icecat"
                  title={
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon="mdi:cloud-download" className="me-2" />
                      <span>Single Import</span>
                    </div>
                  }>
                  <div className="p-3">
                    <IcecatImportForm onProductImported={onProductImported} />
                  </div>
                </Tab>
                <Tab
                  eventKey="excel"
                  title={
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon="mdi:file-excel" className="me-2" />
                      <span>Bulk Excel Import</span>
                    </div>
                  }>
                  <div className="p-3">
                    <ExcelImportForm onProductsImported={onProductsImported} />
                  </div>
                </Tab>
                <Tab
                  eventKey="importprice"
                  title={
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon="mdi:currency-usd" className="me-2" />
                      <span>Price Import</span>
                    </div>
                  }>
                  <div className="p-3">
                    <PriceIportForm onProductsImported={onPriceImported} />
                  </div>
                </Tab>
              </Tabs>
            </div>
          ) : activeForm === 'list' ? (
            <div className="product-list-section">
              <div className="mb-4">
                <h5 className="text-dark mb-2">Product Catalog</h5>
                <p className="text-muted">Browse and manage all products in your inventory</p>
              </div>
              <ProductsListTable />
            </div>
          ) : (
            <div className="import-history-section">
              <div className="mb-4">
                <h5 className="text-dark mb-2">Import History</h5>
                <p className="text-muted">Monitor and track your bulk import operations</p>
              </div>
              <ImportJobsTable />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

// Enhanced CreateProduct Component
const CreateProduct = () => {
  const [activeForm, setActiveForm] = useState(null)
  const [importMethod, setImportMethod] = useState('manual')
  const [importedProductData, setImportedProductData] = useState(null)

  const [brandsData, setBrandsData] = useState(null)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [brandsError, setBrandsError] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState(null)

  useEffect(() => {
    fetchBrandStatistics()
  }, [])

  const fetchBrandStatistics = async () => {
    try {
      setBrandsLoading(true)
      setBrandsError(null)
      const response = await getProductCountByBrandAndStatus()

      if (response.success) {
        setBrandsData(response.data)
        if (!selectedBrand && response.data.brands?.length > 0) {
          setSelectedBrand(response.data.brands[0].brandName)
        }
      } else {
        throw new Error(response.error || 'Failed to fetch brand statistics')
      }
    } catch (error) {
      console.error('Error fetching brand statistics:', error)
      setBrandsError(error.response?.data?.message || error.message || 'Failed to fetch brand statistics')
    } finally {
      setBrandsLoading(false)
    }
  }

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName)
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create':
        setActiveForm('create')
        setImportMethod('manual')
        break
      case 'import':
        setActiveForm('create')
        setImportMethod('excel')
        break
      case 'refresh':
        fetchBrandStatistics()
        break
      case 'analytics':
        setActiveForm('list')
        break
      default:
        break
    }
  }

  const handleProductImported = (productData, useDirectly = false) => {
    setImportedProductData(productData)
    if (useDirectly) {
      setImportMethod('manual')
    }
  }

  const handleProductsImported = (jobId) => {
    console.log('Products import scheduled with job ID:', jobId)
    // Refresh brand statistics after import
    setTimeout(() => {
      fetchBrandStatistics()
    }, 2000)
  }

  const handlePriceImported = (jobId) => {
    console.log('Price import scheduled with job ID:', jobId)
  }

  const handleProductCreated = () => {
    setImportedProductData(null)
    setImportMethod('manual')
    // Refresh brand statistics after creating a product
    setTimeout(() => {
      fetchBrandStatistics()
    }, 1000)
  }

  const handleCloseForms = () => {
    setActiveForm(null)
    setImportMethod('manual')
    setImportedProductData(null)
  }

  const handleImportMethodChange = (method) => {
    setImportMethod(method)
  }

  return (
    <>
      <PageMetaData title="Brand Analytics Dashboard" />

      <div className="dashboard-container">
        {/* Main Dashboard - Always Visible */}
        <BrandsDashboard
          brandsData={brandsData}
          loading={brandsLoading}
          error={brandsError}
          selectedBrand={selectedBrand}
          onBrandSelect={handleBrandSelect}
          onQuickAction={handleQuickAction}
        />

        {/* Enhanced Forms Overlay */}
        <FormsOverlay
          activeForm={activeForm}
          importMethod={importMethod}
          onClose={handleCloseForms}
          onImportMethodChange={handleImportMethodChange}
          importedProductData={importedProductData}
          onProductCreated={handleProductCreated}
          onProductImported={handleProductImported}
          onProductsImported={handleProductsImported}
          onPriceImported={handlePriceImported}
        />
      </div>

      <style jsx>{`
        .dashboard-container {
          position: relative;
        }
        .brand-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        .quick-action-card:hover {
          transform: translateY(-4px) !important;
          boxshadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
        }
        .custom-tabs .nav-link {
          border: none !important;
          border-bottom: 3px solid transparent !important;
          color: #6c757d;
          font-weight: 500;
          padding: 12px 20px;
          transition: all 0.3s ease;
        }
        .custom-tabs .nav-link.active {
          color: #3b71ca;
          border-bottom-color: #3b71ca !important;
          background: transparent;
        }
        .custom-tabs .nav-link:hover {
          color: #3b71ca;
          background: rgba(59, 113, 202, 0.05);
        }
      `}</style>
    </>
  )
}

export default CreateProduct

// // // import { useEffect, useState } from 'react'
// // // import { Card, CardBody, Col, Row } from 'react-bootstrap'
// // // import { Link } from 'react-router-dom'
// // // import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
// // // import PageMetaData from '@/components/PageTitle'
// // // import IconifyIcon from '@/components/wrappers/IconifyIcon'
// // // import { getAllEcommerceProducts } from '@/helpers/data'
// // // import ProductsListTable from './components/ProductsListTable'
// // // const Products = () => {
// // //   const [productsList, setProductsList] = useState()
// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       const data = await getAllEcommerceProducts()
// // //       setProductsList(data)
// // //     }
// // //     fetchData()
// // //   }, [])
// // //   // Cart button handler
// // //   const handleCartClick = () => {
// // //     // Navigate to cart page or open cart sidebar
// // //     console.log('Cart button clicked')
// // //     // Example: navigate('/ecommerce/cart');
// // //     // Or: dispatch(toggleCartSidebar());
// // //   }

// // //   return (
// // //     <>
// // //       <PageMetaData title="Products List" />
// // //       <PageBreadcrumb title="Products List" subName="Ecommerce" />
// // //       <Row>
// // //         <Col>
// // //           <Card>
// // //             <CardBody>
// // //               <div className="d-flex flex-wrap justify-content-between gap-3">
// // //                 <div className="search-bar">
// // //                   <span>
// // //                     <IconifyIcon icon="bx:search-alt" className="mb-1" />
// // //                   </span>
// // //                   <input type="search" className="form-control" id="search" placeholder="Search ..." />
// // //                 </div>
// // //                 <div className="d-flex gap-2">
// // //                   {/* Cart Icon Button - Icon Only */}
// // //                   <button className="btn btn-outline-primary d-flex align-items-center" onClick={handleCartClick} title="View Cart">
// // //                     <IconifyIcon icon="bx:cart" />
// // //                   </button>

// // //                   <Link to="/ecommerce/products/create" className="btn btn-primary d-flex align-items-center">
// // //                     <IconifyIcon icon="bx:plus" className="me-1" />
// // //                     Add Product
// // //                   </Link>
// // //                 </div>
// // //               </div>
// // //             </CardBody>
// // //             <div>{productsList && <ProductsListTable products={productsList} />}</div>
// // //           </Card>
// // //         </Col>
// // //       </Row>
// // //     </>
// // //   )
// // // }
// // // export default Products

// // import { useEffect, useState } from 'react'
// // import { Card, CardBody, Col, Row } from 'react-bootstrap'
// // import { Link, useNavigate } from 'react-router-dom' // Add useNavigate
// // import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
// // import PageMetaData from '@/components/PageTitle'
// // import IconifyIcon from '@/components/wrappers/IconifyIcon'
// // import { getAllEcommerceProducts } from '@/helpers/data'
// // import ProductsListTable from './components/ProductsListTable'
// // import { useCart } from '@/context/CartContext' // Import cart context

// // const Products = () => {
// //   const [productsList, setProductsList] = useState()
// //   const navigate = useNavigate() // Initialize navigate
// //   const { getCartTotals } = useCart() // Get cart totals
// //   const { totalItems } = getCartTotals() // Get item count

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       const data = await getAllEcommerceProducts()
// //       setProductsList(data)
// //     }
// //     fetchData()
// //   }, [])

// //   // Cart button handler - now navigates to cart page
// //   const handleCartClick = () => {
// //     navigate('/ecommerce/cart')
// //   }

// //   return (
// //     <>
// //       <PageMetaData title="Products List" />
// //       <PageBreadcrumb title="Products List" subName="Ecommerce" />
// //       <Row>
// //         <Col>
// //           <Card>
// //             <CardBody>
// //               <div className="d-flex flex-wrap justify-content-between gap-3">
// //                 <div className="search-bar">
// //                   <span>
// //                     <IconifyIcon icon="bx:search-alt" className="mb-1" />
// //                   </span>
// //                   <input type="search" className="form-control" id="search" placeholder="Search ..." />
// //                 </div>
// //                 <div className="d-flex gap-2">
// //                   {/* Cart Icon Button with item count */}
// //                   <button 
// //                     className="btn btn-outline-primary d-flex align-items-center position-relative" 
// //                     onClick={handleCartClick} 
// //                     title="View Cart"
// //                   >
// //                     <IconifyIcon icon="bx:cart" />
// //                     {totalItems > 0 && (
// //                       <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
// //                         {totalItems}
// //                       </span>
// //                     )}
// //                   </button>

// //                   <Link to="/ecommerce/products/create" className="btn btn-primary d-flex align-items-center">
// //                     <IconifyIcon icon="bx:plus" className="me-1" />
// //                     Add Product
// //                   </Link>
// //                 </div>
// //               </div>
// //             </CardBody>
// //             <div>{productsList && <ProductsListTable products={productsList} />}</div>
// //           </Card>
// //         </Col>
// //       </Row>
// //     </>
// //   )
// // }
// // export default Products

// import { useEffect, useState } from 'react'
// import { Card, CardBody, Col, Row } from 'react-bootstrap'
// import { Link, useNavigate } from 'react-router-dom'
// import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
// import PageMetaData from '@/components/PageTitle'
// import IconifyIcon from '@/components/wrappers/IconifyIcon'
// import { getAllEcommerceProducts } from '@/helpers/data'
// import ProductsListTable from './components/ProductsListTable'
// import { useCart } from '@/context/CartContext'

// const Products = () => {
//   const [productsList, setProductsList] = useState()
//   const [totalItems, setTotalItems] = useState(0) // 👈 ADD STATE FOR TOTAL ITEMS
//   const navigate = useNavigate()
//   const { getCartTotals } = useCart()

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getAllEcommerceProducts()
//       setProductsList(data)
//     }
//     fetchData()
//   }, [])

//   // 👇 ADD useEffect TO GET CART TOTALS
//   useEffect(() => {
//     const totals = getCartTotals()
//     setTotalItems(totals.totalItems || 0)
//   }, [getCartTotals])

//   // Cart button handler
//   const handleCartClick = () => {
//     navigate('/ecommerce/cart')
//   }

//   return (
//     <>
//       <PageMetaData title="Products List" />
//       <PageBreadcrumb title="Products List" subName="Ecommerce" />
//       <Row>
//         <Col>
//           <Card>
//             <CardBody>
//               <div className="d-flex flex-wrap justify-content-between gap-3">
//                 <div className="search-bar">
//                   <span>
//                     <IconifyIcon icon="bx:search-alt" className="mb-1" />
//                   </span>
//                   <input type="search" className="form-control" id="search" placeholder="Search ..." />
//                 </div>
//                 <div className="d-flex gap-2">
//                   {/* Cart Icon Button with item count */}
//                   <button 
//                     className="btn btn-outline-primary d-flex align-items-center position-relative" 
//                     onClick={handleCartClick} 
//                     title="View Cart"
//                   >
//                     <IconifyIcon icon="bx:cart" />
//                     {totalItems > 0 && (
//                       <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                         {totalItems}
//                       </span>
//                     )}
//                   </button>

//                   <Link to="/ecommerce/products/create" className="btn btn-primary d-flex align-items-center">
//                     <IconifyIcon icon="bx:plus" className="me-1" />
//                     Add Product
//                   </Link>
//                 </div>
//               </div>
//             </CardBody>
//             <div>{productsList && <ProductsListTable products={productsList} />}</div>
//           </Card>
//         </Col>
//       </Row>
//     </>
//   )
// }

// export default Products

import { useEffect, useState } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllEcommerceProducts } from '@/helpers/data'
import ProductsListTable from './components/ProductsListTable'
import { useCart } from '@/context/CartContext'

const Products = () => {
  const [productsList, setProductsList] = useState()
  const [totalItems, setTotalItems] = useState(0)
  const navigate = useNavigate()
  const { cart, getCartTotals, fetchCart } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllEcommerceProducts()
      setProductsList(data)
    }
    fetchData()
  }, [])

  // Update cart totals whenever cart changes
  useEffect(() => {
    const totals = getCartTotals()
    setTotalItems(totals.totalItems || 0)
  }, [cart, getCartTotals])

  // CartContext already fetches cart on mount, no need to refresh here

  const handleCartClick = () => {
    navigate('/ecommerce/cart')
  }

  const handleRefreshCart = () => {
    fetchCart();
  }

  return (
    <>
      <PageMetaData title="Products List" />
      <PageBreadcrumb title="Products List" subName="Ecommerce" />
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
                <div className="d-flex gap-2">
                  {/* Refresh Cart Button */}
                  <button 
                    className="btn btn-outline-secondary d-flex align-items-center" 
                    onClick={handleRefreshCart}
                    title="Refresh Cart"
                  >
                    <IconifyIcon icon="bx:refresh" />
                  </button>

                  {/* Cart Icon Button with item count */}
                  <button 
                    className="btn btn-outline-primary d-flex align-items-center position-relative" 
                    onClick={handleCartClick} 
                    title="View Cart"
                  >
                    <IconifyIcon icon="bx:cart" />
                    {totalItems > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </button>

                  <Link to="/ecommerce/products/create" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Product
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>{productsList && <ProductsListTable products={productsList} />}</div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Products
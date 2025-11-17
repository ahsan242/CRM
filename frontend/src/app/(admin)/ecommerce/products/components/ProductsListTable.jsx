// // // src/components/ProductsListTable.jsx
// // import { useEffect, useState } from 'react'
// // import clsx from 'clsx'
// // import { Link } from 'react-router-dom'
// // import ReactTable from '@/components/Table'
// // import IconifyIcon from '@/components/wrappers/IconifyIcon'
// // import { currency } from '@/context/constants'
// // import { getProducts } from '@/http/Product'
// // import { getStockStatus } from '@/utils/other'

// // const ProductsListTable = () => {
// //   const [products, setProducts] = useState([])
// //   const [loading, setLoading] = useState(true)

// //   useEffect(() => {
// //     const fetchProducts = async () => {
// //       try {
// //         const data = await getProducts()
// //         setProducts(data)
// //       } catch (error) {
// //         console.error('Failed to fetch products:', error)
// //       } finally {
// //         setLoading(false)
// //       }
// //     }
// //     fetchProducts()
// //   }, [])

// //   const columns = [
// //     {
// //       header: 'Product Name',
// //       cell: ({
// //         row: {
// //           original: { id, title, shortDescp, mainImage },
// //         },
// //       }) => (
// //         <div className="d-flex align-items-center">
// //           <div className="flex-shrink-0 me-3">
// //             <Link to={`/ecommerce/products/${id}`}>
// //               <img src={`http://localhost:5000/uploads/products/${mainImage}`} alt={title} className="img-fluid avatar-sm" />
// //             </Link>
// //           </div>
// //           <div className="flex-grow-1">
// //             <h5 className="mt-0 mb-1">
// //               <Link to={`/ecommerce/products/${id}`} className="text-reset">
// //                 {title}
// //               </Link>
// //             </h5>
// //             <span className="fs-13 text-muted">{shortDescp}</span>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       header: 'Category',
// //       cell: ({ row: { original } }) => original.category?.title || '-',
// //     },
// //     {
// //       header: 'Price',
// //       cell: ({ row: { original } }) => currency + (original.price || '0.00'),
// //     },
// //     {
// //       header: 'Inventory',
// //       cell: ({
// //         row: {
// //           original: { quantity },
// //         },
// //       }) => {
// //         const stockStatus = getStockStatus(quantity)
// //         return (
// //           <div className={'text-' + stockStatus.variant}>
// //             <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
// //             {stockStatus.text}
// //           </div>
// //         )
// //       },
// //     },
    
// // {
// //   header: 'Action',
// //   cell: ({ row: { original } }) => {
// //     const [quantity, setQuantity] = useState(1);

// //     const handleAddToCart = (product) => {
// //       console.log('Adding to cart:', product, 'Quantity:', quantity);
// //       // Your add to cart logic
// //     };

// //     return (
// //       <div className="d-flex align-items-center gap-2">
// //         {/* View Button */}
// //         <Link 
// //           to={`/ecommerce/products/${original.id}`}
// //           className="btn btn-sm btn-soft-info"
// //           title="View Product"
// //         >
// //           <IconifyIcon icon="bx:show" className="fs-18" />
// //         </Link>
        
// //         {/* Quantity Input */}
// //         {original.quantity > 0 && (
// //           <input 
// //             type="number" 
// //             className="form-control form-control-sm text-center"
// //             style={{width: '70px'}}
// //             value={quantity}
// //             onChange={(e) => {
// //               const value = parseInt(e.target.value) || 1;
// //               if (value > 0 && value <= original.quantity) {
// //                 setQuantity(value);
// //               }
// //             }}
// //             min="1"
// //             max={original.quantity}
// //           />
// //         )}
        
// //         {/* Add to Cart Button */}
       
// //         <button 
// //         className="btn btn-sm btn-soft-warning"
// //         onClick={() => handleAddToCart(original)}
// //         title="Buy Now"
// //         disabled={original.quantity === 0}
// //       >
// //         <IconifyIcon icon="bx:shopping-bag" className="fs-18" />
// //       </button>
// //       </div>
// //     );
// //   },
// // }

// //     ,
// //   ]

// //   const pageSizeList = [5, 10, 20, 50]

// //   return (
// //     <ReactTable
// //       columns={columns}
// //       data={products}
// //       rowsPerPageList={pageSizeList}
// //       pageSize={10}
// //       tableClass="text-nowrap mb-0"
// //       theadClass="bg-light bg-opacity-50"
// //       showPagination
// //       loading={loading}
// //     />
// //   )
// // }

// // export default ProductsListTable


// // //.... tomorrw check this

// import { useEffect, useState } from 'react'
// import clsx from 'clsx'
// import { Link } from 'react-router-dom'
// import ReactTable from '@/components/Table'
// import IconifyIcon from '@/components/wrappers/IconifyIcon'
// import { currency } from '@/context/constants'
// import { getProducts } from '@/http/Product'
// import { getStockStatus } from '@/utils/other'
// import { useCart } from '@/context/CartContext' // Import the cart hook

// const ProductsListTable = () => {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const { addToCart, loading: cartLoading } = useCart() // Get cart functions

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const data = await getProducts()
//         setProducts(data)
//       } catch (error) {
//         console.error('Failed to fetch products:', error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProducts()
//   }, [])

//   const handleAddToCart = async (product, quantity) => {
//     try {
//       await addToCart(product, quantity);
//       console.log('Product added to cart:', product.title, 'Quantity:', quantity);
//     } catch (error) {
//       console.error('Failed to add to cart:', error);
//     }
//   };

//   const columns = [
//     {
//       header: 'Product Name',
//       cell: ({
//         row: {
//           original: { id, title, shortDescp, mainImage },
//         },
//       }) => (
//         <div className="d-flex align-items-center">
//           <div className="flex-shrink-0 me-3">
//             <Link to={`/ecommerce/products/${id}`}>
//               <img src={`http://localhost:5000/uploads/products/${mainImage}`} alt={title} className="img-fluid avatar-sm" />
//             </Link>
//           </div>
//           <div className="flex-grow-1">
//             <h5 className="mt-0 mb-1">
//               <Link to={`/ecommerce/products/${id}`} className="text-reset">
//                 {title}
//               </Link>
//             </h5>
//             <span className="fs-13 text-muted">{shortDescp}</span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: 'Category',
//       cell: ({ row: { original } }) => original.category?.title || '-',
//     },
//     {
//       header: 'Price',
//       cell: ({ row: { original } }) => currency + (original.price || '0.00'),
//     },
//     {
//       header: 'Inventory',
//       cell: ({
//         row: {
//           original: { quantity },
//         },
//       }) => {
//         const stockStatus = getStockStatus(quantity)
//         return (
//           <div className={'text-' + stockStatus.variant}>
//             <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
//             {stockStatus.text}
//           </div>
//         )
//       },
//     },
//     {
//       header: 'Action',
//       cell: ({ row: { original } }) => {
//         const [quantity, setQuantity] = useState(1);

//         const handleAddToCartClick = () => {
//           handleAddToCart(original, quantity);
//         };

//         return (
//           <div className="d-flex align-items-center gap-2">
//             {/* View Button */}
//             <Link 
//               to={`/ecommerce/products/${original.id}`}
//               className="btn btn-sm btn-soft-info"
//               title="View Product"
//             >
//               <IconifyIcon icon="bx:show" className="fs-18" />
//             </Link>
            
//             {/* Quantity Input */}
//             {original.quantity > 0 && (
//               <input 
//                 type="number" 
//                 className="form-control form-control-sm text-center"
//                 style={{width: '70px'}}
//                 value={quantity}
//                 onChange={(e) => {
//                   const value = parseInt(e.target.value) || 1;
//                   if (value > 0 && value <= original.quantity) {
//                     setQuantity(value);
//                   }
//                 }}
//                 min="1"
//                 max={original.quantity}
//               />
//             )}
            
//             {/* Add to Cart Button */}
//             <button 
//               className="btn btn-sm btn-soft-warning"
//               onClick={handleAddToCartClick}
//               title="Buy Now"
//               disabled={original.quantity === 0 || cartLoading}
//             >
//               {cartLoading ? (
//                 <div className="spinner-border spinner-border-sm" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               ) : (
//                 <IconifyIcon icon="bx:shopping-bag" className="fs-18" />
//               )}
//             </button>
//           </div>
//         );
//       },
//     },
//   ]

//   const pageSizeList = [5, 10, 20, 50]

//   return (
//     <ReactTable
//       columns={columns}
//       data={products}
//       rowsPerPageList={pageSizeList}
//       pageSize={10}
//       tableClass="text-nowrap mb-0"
//       theadClass="bg-light bg-opacity-50"
//       showPagination
//       loading={loading}
//     />
//   )
// }

// export default ProductsListTable

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import ReactTable from '@/components/Table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import { getProducts } from '@/http/Product'
import { getStockStatus } from '@/utils/other'
import { useCart } from '@/context/CartContext'

const ProductsListTable = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart, loading: cartLoading, getProductQuantity } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = async (product, quantity) => {
    try {
      await addToCart(product, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      cell: ({
        row: {
          original: { id, title, shortDescp, mainImage },
        },
      }) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <Link to={`/ecommerce/products/${id}`}>
              <img 
                src={mainImage ? `http://localhost:5000/uploads/products/${mainImage}` : '/assets/images/products/default-product.jpg'} 
                alt={title} 
                className="img-fluid avatar-sm" 
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
            </Link>
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/products/${id}`} className="text-reset">
                {title}
              </Link>
            </h5>
            <span className="fs-13 text-muted">{shortDescp}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: ({ row: { original } }) => original.category?.title || '-',
    },
    {
      header: 'Price',
      cell: ({ row: { original } }) => currency + (original.price || '0.00'),
    },
    {
      header: 'Inventory',
      cell: ({
        row: {
          original: { quantity },
        },
      }) => {
        const stockStatus = getStockStatus(quantity)
        return (
          <div className={'text-' + stockStatus.variant}>
            <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
            {stockStatus.text}
          </div>
        )
      },
    },
    {
      header: 'Action',
      cell: ({ row: { original } }) => {
        const currentQuantity = getProductQuantity(original.id);
        const [quantity, setQuantity] = useState(currentQuantity > 0 ? currentQuantity : 1);

        const handleAddToCartClick = () => {
          handleAddToCart(original, quantity);
        };

        const handleQuantityChange = (e) => {
          const value = parseInt(e.target.value) || 1;
          if (value > 0 && value <= original.quantity) {
            setQuantity(value);
          }
        };

        return (
          <div className="d-flex align-items-center gap-2">
            {/* View Button */}
            <Link 
              to={`/ecommerce/products/${original.id}`}
              className="btn btn-sm btn-soft-info"
              title="View Product"
            >
              <IconifyIcon icon="bx:show" className="fs-18" />
            </Link>
            
            {/* Quantity Input - Only show if product is in stock */}
            {original.quantity > 0 && (
              <div className="d-flex align-items-center">
                <input 
                  type="number" 
                  className="form-control form-control-sm text-center"
                  style={{width: '70px'}}
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={original.quantity}
                />
              </div>
            )}
            
            {/* Add to Cart Button */}
            <button 
              className="btn btn-sm btn-soft-warning d-flex align-items-center"
              onClick={handleAddToCartClick}
              title="Add to Cart"
              disabled={original.quantity === 0 || cartLoading}
            >
              {cartLoading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <>
                  <IconifyIcon icon="bx:shopping-bag" className="fs-18 me-1" />
                  {currentQuantity > 0 ? `(${currentQuantity})` : 'Add'}
                </>
              )}
            </button>
          </div>
        );
      },
    },
  ]

  const pageSizeList = [5, 10, 20, 50]

  return (
    <ReactTable
      columns={columns}
      data={products}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
      loading={loading}
    />
  )
}

export default ProductsListTable
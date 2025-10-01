// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import ReactTable from '@/components/Table'
// import IconifyIcon from '@/components/wrappers/IconifyIcon'
// import { getProducts, deleteProduct } from '@/http/Product'
// import EditProductForm from './EditProductForm'

// const ProductsListTable = () => {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [editingProduct, setEditingProduct] = useState(null)
//   const [showEditForm, setShowEditForm] = useState(false)

//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   const fetchProducts = async () => {
//     try {
//       setLoading(true)
//       const response = await getProducts()
//       // Fix: The API returns the array directly, not nested under data
//       setProducts(response || []) // Use response directly instead of response.data
//       console.log('Products fetched:', response)
//     } catch (err) {
//       setError(err.message || 'Failed to fetch products')
//       console.error('Error fetching products:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEdit = (product) => {
//     setEditingProduct(product)
//     setShowEditForm(true)
//   }

//   const handleDelete = async (productId) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       try {
//         await deleteProduct(productId)
//         fetchProducts()
//       } catch (err) {
//         setError(err.response?.data?.error || 'Failed to delete product')
//       }
//     }
//   }

//   const handleEditSuccess = () => {
//     setShowEditForm(false)
//     setEditingProduct(null)
//     fetchProducts()
//   }

//   const handleCancelEdit = () => {
//     setShowEditForm(false)
//     setEditingProduct(null)
//   }

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

//               <img
//                 src={`http://localhost:5000/uploads/products/${mainImage}`}
//                 alt={title.substring(0, 2)}
//                 className="img-fluid avatar-sm"
//                 onError={(e) => {
//                   e.target.src = '/images/default-product.png'
//                 }}
//               />
//             </Link>
//           </div>
//           <div className="flex-grow-1">
//             <h5 className="mt-0 mb-1">
//               <Link to={`/ecommerce/products/${id}`} className="text-reset">
//                 {title}
//               </Link>
//             </h5>
//             <span className="fs-13 text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
//               {shortDescp}
//             </span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: 'Category',
//       accessorKey: 'category.title',
//     },
//     {
//       header: 'Price',
//       cell: ({
//         row: {
//           original: { price },
//         },
//       }) => `$${parseFloat(price || 0).toFixed(2)}`,
//     },
//     {
//       header: 'Inventory',
//       cell: ({
//         row: {
//           original: { quantity },
//         },
//       }) => {
//         const getStockStatus = (qty) => {
//           if (qty > 10) return { variant: 'success', text: 'In Stock' }
//           if (qty > 0) return { variant: 'warning', text: 'Low Stock' }
//           return { variant: 'danger', text: 'Out of Stock' }
//         }

//         const stockStatus = getStockStatus(quantity || 0)
//         return (
//           <div className={'text-' + stockStatus.variant}>
//             <span className={`badge bg-${stockStatus.variant}`}>
//               {stockStatus.text} ({quantity || 0})
//             </span>
//           </div>
//         )
//       },
//     },
//     {
//       header: 'Action',
//       cell: ({ row: { original } }) => (
//         <>
//           <button type="button" className="btn btn-sm btn-soft-secondary me-1" onClick={() => handleEdit(original)}>
//             <IconifyIcon icon="bx:edit" className="fs-18" />
//           </button>
//           <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDelete(original.id)}>
//             <IconifyIcon icon="bx:trash" className="fs-18" />
//           </button>
//         </>
//       ),
//     },
//   ]

//   const pageSizeList = [2, 5, 10, 20, 50]

//   if (loading) {
//     return <div className="text-center py-4">Loading products...</div>
//   }

//   if (error) {
//     return <div className="alert alert-danger">Error: {error}</div>
//   }

//   if (!products || products.length === 0) {
//     return <div className="alert alert-info">No products found.</div>
//   }

//   return (
//     <>
//       {showEditForm && editingProduct && (
//         <div className="card mb-4">
//           <div className="card-header bg-light">
//             <h5 className="mb-0">Edit Product: {editingProduct.title}</h5>
//           </div>
//           <div className="card-body">
//             <EditProductForm product={editingProduct} onSuccess={handleEditSuccess} />
//             <div className="d-flex justify-content-end mt-3">
//               <button className="btn btn-secondary" onClick={handleCancelEdit}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <ReactTable
//         columns={columns}
//         data={products}
//         rowsPerPageList={pageSizeList}
//         pageSize={10}
//         tableClass="text-nowrap mb-0"
//         theadClass="bg-light bg-opacity-50"
//         showPagination
//       />
//     </>
//   )
// }

// export default ProductsListTable

// import { useState, useEffect, useMemo } from 'react'
// import { Link } from 'react-router-dom'
// import ReactTable from '@/components/Table'
// import IconifyIcon from '@/components/wrappers/IconifyIcon'
// import { getProducts, deleteProduct } from '@/http/Product'
// import EditProductForm from './EditProductForm'

// const ProductsListTable = () => {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [editingProduct, setEditingProduct] = useState(null)
//   const [showEditForm, setShowEditForm] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [categoryFilter, setCategoryFilter] = useState('all')
//   const [selectedProducts, setSelectedProducts] = useState([])
//   const [bulkAction, setBulkAction] = useState('')
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   const fetchProducts = async () => {
//     try {
//       setLoading(true)
//       const response = await getProducts()
//       setProducts(response || [])
//       console.log('Products fetched:', response)
//     } catch (err) {
//       setError(err.message || 'Failed to fetch products')
//       console.error('Error fetching products:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Filter and search products
//   const filteredProducts = useMemo(() => {
//     return products.filter(product => {
//       const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            product.shortDescp?.toLowerCase().includes(searchTerm.toLowerCase())

//       const matchesStatus = statusFilter === 'all' ||
//         (statusFilter === 'in-stock' && product.quantity > 10) ||
//         (statusFilter === 'low-stock' && product.quantity > 0 && product.quantity <= 10) ||
//         (statusFilter === 'out-of-stock' && (!product.quantity || product.quantity === 0))

//       const matchesCategory = categoryFilter === 'all' ||
//         product.category?.title === categoryFilter

//       return matchesSearch && matchesStatus && matchesCategory
//     })
//   }, [products, searchTerm, statusFilter, categoryFilter])

//   // Sort products
//   const sortedProducts = useMemo(() => {
//     if (!sortConfig.key) return filteredProducts

//     return [...filteredProducts].sort((a, b) => {
//       let aValue = a[sortConfig.key]
//       let bValue = b[sortConfig.key]

//       // Handle nested properties
//       if (sortConfig.key === 'category.title') {
//         aValue = a.category?.title
//         bValue = b.category?.title
//       }

//       if (aValue < bValue) {
//         return sortConfig.direction === 'asc' ? -1 : 1
//       }
//       if (aValue > bValue) {
//         return sortConfig.direction === 'asc' ? 1 : -1
//       }
//       return 0
//     })
//   }, [filteredProducts, sortConfig])

//   const handleSort = (key) => {
//     setSortConfig(current => ({
//       key,
//       direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
//     }))
//   }

//   const handleEdit = (product) => {
//     setEditingProduct(product)
//     setShowEditForm(true)
//   }

//   const handleDelete = async (productId) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       try {
//         await deleteProduct(productId)
//         fetchProducts()
//       } catch (err) {
//         setError(err.response?.data?.error || 'Failed to delete product')
//       }
//     }
//   }

//   const handleBulkDelete = async () => {
//     if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
//       try {
//         await Promise.all(selectedProducts.map(id => deleteProduct(id)))
//         setSelectedProducts([])
//         setBulkAction('')
//         fetchProducts()
//       } catch (err) {
//         setError('Failed to delete some products')
//       }
//     }
//   }

//   const handleBulkStatusUpdate = async (status) => {
//     // Implement bulk status update logic here
//     console.log(`Update ${selectedProducts.length} products to status: ${status}`)
//   }

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       setSelectedProducts(sortedProducts.map(product => product.id))
//     } else {
//       setSelectedProducts([])
//     }
//   }

//   const handleSelectProduct = (productId, checked) => {
//     if (checked) {
//       setSelectedProducts(prev => [...prev, productId])
//     } else {
//       setSelectedProducts(prev => prev.filter(id => id !== productId))
//     }
//   }

//   const handleEditSuccess = () => {
//     setShowEditForm(false)
//     setEditingProduct(null)
//     fetchProducts()
//   }

//   const handleCancelEdit = () => {
//     setShowEditForm(false)
//     setEditingProduct(null)
//   }

//   // Get unique categories for filter
//   const categories = useMemo(() => {
//     const uniqueCategories = [...new Set(products.map(p => p.category?.title).filter(Boolean))]
//     return uniqueCategories
//   }, [products])

//   const getStockStatus = (quantity) => {
//     const qty = quantity || 0
//     if (qty > 10) return { variant: 'success', text: 'In Stock', icon: 'bx:check-circle' }
//     if (qty > 0) return { variant: 'warning', text: 'Low Stock', icon: 'bx:error' }
//     return { variant: 'danger', text: 'Out of Stock', icon: 'bx:x-circle' }
//   }

//   const getPriceChange = (product) => {
//     if (!product.originalPrice) return null
//     const change = ((product.price - product.originalPrice) / product.originalPrice) * 100
//     return {
//       value: change,
//       isPositive: change > 0,
//       icon: change > 0 ? 'bx:up-arrow-alt' : 'bx:down-arrow-alt'
//     }
//   }

//   // Create sortable header component
//   const SortableHeader = ({ columnKey, children, sortConfig }) => (
//     <div
//       className="d-flex align-items-center cursor-pointer"
//       onClick={() => handleSort(columnKey)}
//       style={{ cursor: 'pointer' }}
//     >
//       {children}
//       <IconifyIcon
//         icon={sortConfig.key === columnKey ?
//           (sortConfig.direction === 'asc' ? 'bx:up-arrow' : 'bx:down-arrow') :
//           'bx:minus'
//         }
//         className="ms-1 fs-12"
//       />
//     </div>
//   )

//   const columns = [
//     {
//       id: 'selection', // Added explicit id
//       header: (
//         <div className="form-check">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
//             onChange={handleSelectAll}
//           />
//         </div>
//       ),
//       cell: ({ row: { original } }) => (
//         <div className="form-check">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             checked={selectedProducts.includes(original.id)}
//             onChange={(e) => handleSelectProduct(original.id, e.target.checked)}
//           />
//         </div>
//       ),
//       size: 50,
//     },
//     {
//       id: 'productName', // Added explicit id
//       header: 'Product Name',
//       cell: ({
//         row: {
//           original: { id, title, shortDescp, mainImage, tags },
//         },
//       }) => (
//         <div className="d-flex align-items-center">
//           <div className="flex-shrink-0 me-3">
//             <Link to={`/ecommerce/products/${id}`}>
//               <div className="position-relative">
//                 <img
//                   src={`http://localhost:5000/uploads/products/${mainImage}`}
//                   alt={title}
//                   className="img-fluid avatar-lg rounded"
//                   onError={(e) => {
//                     e.target.src = '/images/default-product.png'
//                   }}
//                 />
//                 {tags?.includes('new') && (
//                   <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
//                     New
//                   </span>
//                 )}
//               </div>
//             </Link>
//           </div>
//           <div className="flex-grow-1">
//             <h5 className="mt-0 mb-1">
//               <Link to={`/ecommerce/products/${id}`} className="text-reset text-decoration-none">
//                 {title}
//               </Link>
//             </h5>
//             <p className="text-muted mb-1 fs-13" style={{ maxWidth: '250px' }}>
//               {shortDescp}
//             </p>
//             {tags && tags.length > 0 && (
//               <div className="d-flex flex-wrap gap-1 mt-1">
//                 {tags.slice(0, 2).map(tag => (
//                   <span key={tag} className="badge bg-light text-dark fs-11">
//                     {tag}
//                   </span>
//                 ))}
//                 {tags.length > 2 && (
//                   <span className="badge bg-light text-dark fs-11">
//                     +{tags.length - 2} more
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       ),
//     },
//     {
//       id: 'category', // Added explicit id
//       header: 'Category',
//       accessorKey: 'category.title',
//       cell: ({ cell }) => (
//         <span className="badge bg-primary bg-opacity-10 text-primary fs-12">
//           {cell.getValue() || 'Uncategorized'}
//         </span>
//       ),
//     },
//     {
//       id: 'price', // Added explicit id
//       header: 'Price',
//       cell: ({
//         row: {
//           original: { price, originalPrice },
//         },
//       }) => {
//         const priceChange = getPriceChange({ price, originalPrice })
//         return (
//           <div>
//             <div className="fw-semibold">${parseFloat(price || 0).toFixed(2)}</div>
//             {priceChange && (
//               <div className={`d-flex align-items-center fs-11 ${priceChange.isPositive ? 'text-success' : 'text-danger'}`}>
//                 <IconifyIcon icon={priceChange.icon} className="me-1 fs-10" />
//                 {Math.abs(priceChange.value).toFixed(1)}%
//               </div>
//             )}
//           </div>
//         )
//       },
//     },
//     {
//       id: 'inventory', // Added explicit id
//       header: 'Inventory',
//       cell: ({
//         row: {
//           original: { quantity },
//         },
//       }) => {
//         const stockStatus = getStockStatus(quantity || 0)
//         return (
//           <div className="d-flex align-items-center">
//             <IconifyIcon icon={stockStatus.icon} className={`text-${stockStatus.variant} me-2`} />
//             <span className={`badge bg-${stockStatus.variant} bg-opacity-10 text-${stockStatus.variant}`}>
//               {stockStatus.text} ({quantity || 0})
//             </span>
//           </div>
//         )
//       },
//     },
//     {
//       id: 'status', // Added explicit id
//       header: 'Status',
//       accessorKey: 'status',
//       cell: ({ cell }) => (
//         <span className={`badge bg-${cell.getValue() === 'active' ? 'success' : 'secondary'}`}>
//           {cell.getValue() === 'active' ? 'Active' : 'Inactive'}
//         </span>
//       ),
//     },
//     {
//       id: 'actions', // Added explicit id
//       header: 'Actions',
//       cell: ({ row: { original } }) => (
//         <div className="d-flex gap-1">
//           <button
//             type="button"
//             className="btn btn-sm btn-soft-primary"
//             onClick={() => handleEdit(original)}
//             title="Edit Product"
//           >
//             <IconifyIcon icon="bx:edit" className="fs-16" />
//           </button>
//           <button
//             type="button"
//             className="btn btn-sm btn-soft-info"
//             title="View Details"
//           >
//             <IconifyIcon icon="bx:show" className="fs-16" />
//           </button>
//           <button
//             type="button"
//             className="btn btn-sm btn-soft-danger"
//             onClick={() => handleDelete(original.id)}
//             title="Delete Product"
//           >
//             <IconifyIcon icon="bx:trash" className="fs-16" />
//           </button>
//         </div>
//       ),
//     },
//   ]

//   const pageSizeList = [10, 25, 50, 100]

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="mt-2 text-muted">Loading products...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger d-flex align-items-center" role="alert">
//         <IconifyIcon icon="bx:error-circle" className="fs-18 me-2" />
//         <div>Error: {error}</div>
//         <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchProducts}>
//           Retry
//         </button>
//       </div>
//     )
//   }

//   return (
//     <>
//       {/* Header with Stats and Controls */}
//       <div className="card mb-4">
//         <div className="card-body">
//           <div className="row align-items-center">
//             <div className="col-md-6">
//               <h4 className="card-title mb-0">Products</h4>
//               <p className="text-muted mb-0">
//                 Showing {filteredProducts.length} of {products.length} products
//               </p>
//             </div>
//             <div className="col-md-6">
//               <div className="d-flex gap-2 justify-content-md-end">
//                 <button className="btn btn-primary">
//                   <IconifyIcon icon="bx:plus" className="me-1" />
//                   Add Product
//                 </button>
//                 <button className="btn btn-outline-secondary" onClick={fetchProducts}>
//                   <IconifyIcon icon="bx:refresh" className="me-1" />
//                   Refresh
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="card mb-4">
//         <div className="card-body">
//           <div className="row g-3">
//             <div className="col-md-4">
//               <div className="input-group">
//                 <span className="input-group-text">
//                   <IconifyIcon icon="bx:search" />
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Search products..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="col-md-3">
//               <select
//                 className="form-select"
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="all">All Status</option>
//                 <option value="in-stock">In Stock</option>
//                 <option value="low-stock">Low Stock</option>
//                 <option value="out-of-stock">Out of Stock</option>
//               </select>
//             </div>
//             <div className="col-md-3">
//               <select
//                 className="form-select"
//                 value={categoryFilter}
//                 onChange={(e) => setCategoryFilter(e.target.value)}
//               >
//                 <option value="all">All Categories</option>
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="col-md-2">
//               <button
//                 className="btn btn-outline-secondary w-100"
//                 onClick={() => {
//                   setSearchTerm('')
//                   setStatusFilter('all')
//                   setCategoryFilter('all')
//                 }}
//               >
//                 Clear
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bulk Actions */}
//       {selectedProducts.length > 0 && (
//         <div className="card mb-4 border-warning">
//           <div className="card-body">
//             <div className="row align-items-center">
//               <div className="col-md-6">
//                 <span className="text-warning fw-semibold">
//                   <IconifyIcon icon="bx:check-double" className="me-2" />
//                   {selectedProducts.length} product(s) selected
//                 </span>
//               </div>
//               <div className="col-md-6">
//                 <div className="d-flex gap-2 justify-content-md-end">
//                   <select
//                     className="form-select w-auto"
//                     value={bulkAction}
//                     onChange={(e) => setBulkAction(e.target.value)}
//                   >
//                     <option value="">Bulk Actions</option>
//                     <option value="delete">Delete Selected</option>
//                     <option value="activate">Mark as Active</option>
//                     <option value="deactivate">Mark as Inactive</option>
//                   </select>
//                   <button
//                     className="btn btn-warning"
//                     onClick={() => {
//                       if (bulkAction === 'delete') handleBulkDelete()
//                       else if (bulkAction) handleBulkStatusUpdate(bulkAction)
//                     }}
//                     disabled={!bulkAction}
//                   >
//                     Apply
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Form */}
//       {showEditForm && editingProduct && (
//         <div className="card mb-4">
//           <div className="card-header bg-light d-flex justify-content-between align-items-center">
//             <h5 className="mb-0">Edit Product: {editingProduct.title}</h5>
//             <button className="btn-close" onClick={handleCancelEdit}></button>
//           </div>
//           <div className="card-body">
//             <EditProductForm product={editingProduct} onSuccess={handleEditSuccess} />
//           </div>
//         </div>
//       )}

//       {/* Products Table */}
//       <div className="card">
//         <div className="card-body p-0">
//           <ReactTable
//             columns={columns}
//             data={sortedProducts}
//             rowsPerPageList={pageSizeList}
//             pageSize={10}
//             tableClass="table-hover mb-0"
//             theadClass="bg-light bg-opacity-50"
//             showPagination
//             emptyState={
//               <div className="text-center py-5">
//                 <IconifyIcon icon="bx:package" className="fs-48 text-muted mb-3" />
//                 <h5>No products found</h5>
//                 <p className="text-muted">Try adjusting your search or filters</p>
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => {
//                     setSearchTerm('')
//                     setStatusFilter('all')
//                     setCategoryFilter('all')
//                   }}
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             }
//           />
//         </div>
//       </div>
//     </>
//   )
// }

// export default ProductsListTable

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactTable from '@/components/Table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getProducts, deleteProduct } from '@/http/Product'
import EditProductForm from './EditProductForm'

const ProductsListTable = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await getProducts()
      setProducts(response || [])
      console.log('Products fetched:', response)
    } catch (err) {
      setError(err.message || 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) || product.shortDescp?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'in-stock' && product.quantity > 10) ||
        (statusFilter === 'low-stock' && product.quantity > 0 && product.quantity <= 10) ||
        (statusFilter === 'out-of-stock' && (!product.quantity || product.quantity === 0))

      const matchesCategory = categoryFilter === 'all' || product.category?.title === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [products, searchTerm, statusFilter, categoryFilter])

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return filteredProducts

    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      // Handle nested properties
      if (sortConfig.key === 'category.title') {
        aValue = a.category?.title
        bValue = b.category?.title
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredProducts, sortConfig])

  // Add indexes to products
  const productsWithIndexes = useMemo(() => {
    return sortedProducts.map((product, index) => ({
      ...product,
      index: index + 1, // 1-based index for display
      globalIndex: products.findIndex((p) => p.id === product.id) + 1, // Global index in original array
    }))
  }, [sortedProducts, products])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowEditForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId)
        fetchProducts()
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete product')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await Promise.all(selectedProducts.map((id) => deleteProduct(id)))
        setSelectedProducts([])
        setBulkAction('')
        fetchProducts()
      } catch (err) {
        setError('Failed to delete some products')
      }
    }
  }

  const handleBulkStatusUpdate = async (status) => {
    // Implement bulk status update logic here
    console.log(`Update ${selectedProducts.length} products to status: ${status}`)
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(productsWithIndexes.map((product) => product.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId])
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditingProduct(null)
  }

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category?.title).filter(Boolean))]
    return uniqueCategories
  }, [products])

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalProducts = products.length
    const inStockCount = products.filter((p) => p.quantity > 10).length
    const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length
    const outOfStockCount = products.filter((p) => !p.quantity || p.quantity === 0).length
    const activeProducts = products.filter((p) => p.status === 'active').length
    const totalValue = products.reduce((sum, product) => sum + product.price * (product.quantity || 0), 0)

    return {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      activeProducts,
      totalValue,
    }
  }, [products])

  const getStockStatus = (quantity) => {
    const qty = quantity || 0
    if (qty > 10) return { variant: 'success', text: 'In Stock', icon: 'bx:check-circle' }
    if (qty > 0) return { variant: 'warning', text: 'Low Stock', icon: 'bx:error' }
    return { variant: 'danger', text: 'Out of Stock', icon: 'bx:x-circle' }
  }

  const getPriceChange = (product) => {
    if (!product.originalPrice) return null
    const change = ((product.price - product.originalPrice) / product.originalPrice) * 100
    return {
      value: change,
      isPositive: change > 0,
      icon: change > 0 ? 'bx:up-arrow-alt' : 'bx:down-arrow-alt',
    }
  }

  const columns = [
    {
      id: 'selection',
      header: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={selectedProducts.length === productsWithIndexes.length && productsWithIndexes.length > 0}
            onChange={handleSelectAll}
          />
        </div>
      ),
      cell: ({ row: { original } }) => (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={selectedProducts.includes(original.id)}
            onChange={(e) => handleSelectProduct(original.id, e.target.checked)}
          />
        </div>
      ),
      size: 50,
    },
    {
      id: 'index',
      header: '#',
      cell: ({ row: { original } }) => (
        <div className="text-center  ">
          <span className="badge fw-bold bg-secondary bg-opacity-75 fs-10">{original.index}</span>
        </div>
      ),
      size: 80,
    },
    {
      id: 'productName',
      header: 'Product Name',
      cell: ({
        row: {
          original: { id, title, shortDescp, mainImage, tags, index },
        },
      }) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3 position-relative">
            <Link to={`/ecommerce/products/${id}`}>
              <div className="position-relative">
                <img
                  src={`http://localhost:5000/uploads/products/${mainImage}`}
                  alt={title}
                  className="img-fluid avatar-lg rounded"
                  onError={(e) => {
                    e.target.src = '/images/default-product.png'
                  }}
                />
                {tags?.includes('new') && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">New</span>
                )}
              </div>
            </Link>
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/products/${id}`} className="text-reset text-decoration-none">
                {title}
              </Link>
            </h5>
            <p className="text-muted mb-1 fs-13" style={{ maxWidth: '250px' }}>
              {shortDescp}
            </p>
            {tags && tags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mt-1">
                {tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="badge bg-light text-dark fs-11">
                    {tag}
                  </span>
                ))}
                {tags.length > 2 && <span className="badge bg-light text-dark fs-11">+{tags.length - 2} more</span>}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category.title',
      cell: ({ cell }) => <span className="badge bg-primary bg-opacity-10 text-primary fs-12">{cell.getValue() || 'Uncategorized'}</span>,
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({
        row: {
          original: { price, originalPrice },
        },
      }) => {
        const priceChange = getPriceChange({ price, originalPrice })
        return (
          <div>
            <div className="fw-semibold">${parseFloat(price || 0).toFixed(2)}</div>
            {priceChange && (
              <div className={`d-flex align-items-center fs-11 ${priceChange.isPositive ? 'text-success' : 'text-danger'}`}>
                <IconifyIcon icon={priceChange.icon} className="me-1 fs-10" />
                {Math.abs(priceChange.value).toFixed(1)}%
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'inventory',
      header: 'Inventory',
      cell: ({
        row: {
          original: { quantity },
        },
      }) => {
        const stockStatus = getStockStatus(quantity || 0)
        return (
          <div className="d-flex align-items-center">
            <IconifyIcon icon={stockStatus.icon} className={`text-${stockStatus.variant} me-2`} />
            <span className={`badge bg-${stockStatus.variant} bg-opacity-10 text-${stockStatus.variant}`}>
              {stockStatus.text} ({quantity || 0})
            </span>
          </div>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ cell }) => (
        <span className={`badge bg-${cell.getValue() === 'active' ? 'success' : 'secondary'}`}>
          {cell.getValue() === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <div className="d-flex gap-1">
          <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => handleEdit(original)} title="Edit Product">
            <IconifyIcon icon="bx:edit" className="fs-16" />
          </button>
          <button type="button" className="btn btn-sm btn-soft-info" title="View Details">
            <IconifyIcon icon="bx:show" className="fs-16" />
          </button>
          <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDelete(original.id)} title="Delete Product">
            <IconifyIcon icon="bx:trash" className="fs-16" />
          </button>
        </div>
      ),
    },
  ]

  const pageSizeList = [10, 25, 50, 100]

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <IconifyIcon icon="bx:error-circle" className="fs-18 me-2" />
        <div>Error: {error}</div>
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchProducts}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card card-animate">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">Total Products</p>
                  <h4 className="mt-2 mb-0">{statistics.totalProducts}</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-primary bg-opacity-10">
                    <span className="avatar-title rounded-circle bg-primary bg-opacity-10 text-primary fs-22">
                      <IconifyIcon icon="bx:package" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card card-animate">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">In Stock</p>
                  <h4 className="mt-2 mb-0 text-success">{statistics.inStockCount}</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-success bg-opacity-10">
                    <span className="avatar-title rounded-circle bg-success bg-opacity-10 text-success fs-22">
                      <IconifyIcon icon="bx:check-circle" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card card-animate">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">Low Stock</p>
                  <h4 className="mt-2 mb-0 text-warning">{statistics.lowStockCount}</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-warning bg-opacity-10">
                    <span className="avatar-title rounded-circle bg-warning bg-opacity-10 text-warning fs-22">
                      <IconifyIcon icon="bx:error" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card card-animate">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">Out of Stock</p>
                  <h4 className="mt-2 mb-0 text-danger">{statistics.outOfStockCount}</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-danger bg-opacity-10">
                    <span className="avatar-title rounded-circle bg-danger bg-opacity-10 text-danger fs-22">
                      <IconifyIcon icon="bx:x-circle" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card card-animate">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">Active</p>
                  <h4 className="mt-2 mb-0 text-info">{statistics.activeProducts}</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-info bg-opacity-10">
                    <span className="avatar-title rounded-circle bg-info bg-opacity-10 text-info fs-22">
                      <IconifyIcon icon="bx:check" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card card-animate">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">Total Value</p>
                  <h4 className="mt-2 mb-0">${statistics.totalValue.toFixed(2)}</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-secondary bg-opacity-10">
                    <span className="avatar-title rounded-circle bg-secondary bg-opacity-10 text-secondary fs-22">
                      <IconifyIcon icon="bx:dollar" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Stats and Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h4 className="card-title mb-0">Products Management</h4>
              <p className="text-muted mb-0">
                Showing {filteredProducts.length} of {products.length} products • Page {productsWithIndexes[0]?.index || 0}-
                {productsWithIndexes[productsWithIndexes.length - 1]?.index || 0}
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-md-end">
                <button className="btn btn-primary">
                  <IconifyIcon icon="bx:plus" className="me-1" />
                  Add Product
                </button>
                <button className="btn btn-outline-secondary" onClick={fetchProducts}>
                  <IconifyIcon icon="bx:refresh" className="me-1" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <IconifyIcon icon="bx:search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="card mb-4 border-warning">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <span className="text-warning fw-semibold">
                  <IconifyIcon icon="bx:check-double" className="me-2" />
                  {selectedProducts.length} product(s) selected
                </span>
              </div>
              <div className="col-md-6">
                <div className="d-flex gap-2 justify-content-md-end">
                  <select className="form-select w-auto" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
                    <option value="">Bulk Actions</option>
                    <option value="delete">Delete Selected</option>
                    <option value="activate">Mark as Active</option>
                    <option value="deactivate">Mark as Inactive</option>
                  </select>
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      if (bulkAction === 'delete') handleBulkDelete()
                      else if (bulkAction) handleBulkStatusUpdate(bulkAction)
                    }}
                    disabled={!bulkAction}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && editingProduct && (
        <div className="card mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Edit Product: {editingProduct.title}</h5>
            <button className="btn-close" onClick={handleCancelEdit}></button>
          </div>
          <div className="card-body">
            <EditProductForm product={editingProduct} onSuccess={handleEditSuccess} />
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="card">
        <div className="card-body p-0">
          <ReactTable
            columns={columns}
            data={productsWithIndexes}
            rowsPerPageList={pageSizeList}
            pageSize={10}
            tableClass="table-hover mb-0"
            theadClass="bg-light bg-opacity-50"
            showPagination
            emptyState={
              <div className="text-center py-5">
                <IconifyIcon icon="bx:package" className="fs-48 text-muted mb-3" />
                <h5>No products found</h5>
                <p className="text-muted">Try adjusting your search or filters</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}>
                  Clear Filters
                </button>
              </div>
            }
          />
        </div>
      </div>
    </>
  )
}

export default ProductsListTable

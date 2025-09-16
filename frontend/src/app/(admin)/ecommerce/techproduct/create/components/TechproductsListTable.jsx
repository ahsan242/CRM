// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import ReactTable from '@/components/Table'
// import IconifyIcon from '@/components/wrappers/IconifyIcon'
// import { getAllTechProducts } from '@/http/TechProduct'


// const TechproductsListTable = () => {
//   const [subcategories, setSubcategories] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [techProduct, setTechProduct] = useState([])

//   useEffect(() => {
//     const fetchTechProduct = async () => {
//       try {
//         setLoading(true)
//         const response = await getAllTechProducts()
//         console.log('Fetched Techproducts:', response.data)
//          setTechProduct(response.data)
//       } catch (err) {
//         setError(err.message || 'Failed to fetch Techproducts')
//         console.error('Error fetching Techproduct:', err)
//       } finally {
//         setLoading(false)
//       }
//     }

//      fetchTechProduct()
//   }, [])

// //

//   const columns = [
//     {
//       header: 'ID',
//       accessorKey: 'id',
//     },
//     {
//       header: 'TechProduct Name',
//       accessorKey: 'value',
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

//   const handleEdit = (techProduct) => {
//     console.log('Edit subcategory:', techProduct)
//   }

//   const handleDelete = (techProductId) => {
//     console.log('Delete subcategory:', techProductId)
//   }

//   const pageSizeList = [2, 5, 10, 20, 50]

//   if (loading) {
//     return <div className="text-center py-4">Loading tech product...</div>
//   }

//   if (error) {
//     return <div className="alert alert-danger">Error: {error}</div>
//   }

//   if (!techProduct || techProduct.length === 0) {
//     return <div className="alert alert-info">No Tech Product found.</div>
//   }

//   return (
//     <ReactTable
//       columns={columns}
//       data={techProduct}
//       rowsPerPageList={pageSizeList}
//       pageSize={10}
//       tableClass="text-nowrap mb-0"
//       theadClass="bg-light bg-opacity-50"
//       showPagination
//     />
//   )
// }

// export default TechproductsListTable


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllTechProducts, deleteTechProduct } from '@/http/TechProduct';
import EditTechProductForm from './EditTechProductForm';
import toast from 'react-hot-toast';

const TechproductsListTable = () => {
  const [techProducts, setTechProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTechProduct, setEditingTechProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchTechProducts();
  }, []);

  const fetchTechProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllTechProducts();
      console.log('Fetched Techproducts:', response);
      
      // Handle different response structures
      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        console.warn('Unexpected response structure:', response);
        productsData = [];
      }
      
      setTechProducts(productsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch Techproducts');
      console.error('Error fetching Techproduct:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (techProduct) => {
    setEditingTechProduct(techProduct);
    setShowEditForm(true);
  };

  const handleDelete = async (techProductId) => {
    if (window.confirm('Are you sure you want to delete this tech product?')) {
      try {
        await deleteTechProduct(techProductId);
        toast.success('TechProduct deleted successfully!');
        // Refresh the tech products list
        fetchTechProducts();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete tech product');
        toast.error(err.response?.data?.error || 'Failed to delete tech product');
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingTechProduct(null);
    // Refresh the tech products list
    fetchTechProducts();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingTechProduct(null);
  };

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Specification',
      accessorKey: 'specification.title',
      cell: ({ row }) => (
        <span>{row.original.specification?.title || 'N/A'}</span>
      ),
    },
    {
      header: 'Value',
      accessorKey: 'value',
    },
    {
      header: 'Product ID',
      accessorKey: 'productId',
      cell: ({ getValue }) => (
        <span>{getValue() || 'Not assigned'}</span>
      ),
    },
    {
      header: 'Action',
      cell: ({ row: { original } }) => (
        <>
          <button 
            type="button" 
            className="btn btn-sm btn-soft-secondary me-1"
            onClick={() => handleEdit(original)}
          >
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-soft-danger"
            onClick={() => handleDelete(original.id)}
          >
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </>
      ),
    },
  ];

  const pageSizeList = [2, 5, 10, 20, 50];

  if (loading) {
    return <div className="text-center py-4">Loading tech products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!techProducts || techProducts.length === 0) {
    return <div className="alert alert-info">No Tech Products found.</div>;
  }

  return (
    <>
      {showEditForm && editingTechProduct && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Edit TechProduct: {editingTechProduct.specification?.title}</h5>
          </div>
          <div className="card-body">
            <EditTechProductForm 
              techProductId={editingTechProduct.id} 
              onSuccess={handleEditSuccess}
            />
            <div className="d-flex justify-content-end mt-3">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ReactTable
        columns={columns}
        data={techProducts}
        rowsPerPageList={pageSizeList}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  );
};

export default TechproductsListTable;
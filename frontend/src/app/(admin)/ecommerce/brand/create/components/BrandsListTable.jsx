// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import ReactTable from '@/components/Table';
// import IconifyIcon from '@/components/wrappers/IconifyIcon';
// import { getBrands } from '@/http/Brand';

// const BrandsListTable = () => {
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchBrands = async () => {
//       try {
//         setLoading(true);
//         const response = await getBrands();
//         console.log('Fetched brands:', response.data);
//         setBrands(response.data);
//       } catch (err) {
//         setError(err.message || 'Failed to fetch brands');
//         console.error('Error fetching brands:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBrands();
//   }, []);

//   const columns = [
//     {
//       header: 'Brand Name',
//       cell: ({
//         row: {
//           original: { id, title, short_descp },
//         },
//       }) => (
//         <div className="d-flex align-items-center">
//           <div className="flex-grow-1">
//             <h5 className="mt-0 mb-1">
//               <Link to={`/ecommerce/brands/${id}`} className="text-reset">
//                 {title}
//               </Link>
//             </h5>
//             <span className="fs-13">{short_descp}</span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: 'Short Description',
//       accessorKey: 'short_descp',
//     },
//     {
//       header: 'Meta Description',
//       accessorKey: 'meta_descp',
//     },
//     {
//       header: 'Action',
//       cell: ({ row: { original } }) => (
//         <>
//           <button 
//             type="button" 
//             className="btn btn-sm btn-soft-secondary me-1"
//             onClick={() => handleEdit(original)}
//           >
//             <IconifyIcon icon="bx:edit" className="fs-18" />
//           </button>
//           <button 
//             type="button" 
//             className="btn btn-sm btn-soft-danger"
//             onClick={() => handleDelete(original.id)}
//           >
//             <IconifyIcon icon="bx:trash" className="fs-18" />
//           </button>
//         </>
//       ),
//     },
//   ];

//   const handleEdit = (brand) => {
//     // Implement edit functionality
//     console.log('Edit brand:', brand);
//     // You might want to open a modal or navigate to an edit page
//   };

//   const handleDelete = (brandId) => {
//     // Implement delete functionality
//     console.log('Delete brand:', brandId);
//     // You might want to show a confirmation dialog first
//   };

//   const pageSizeList = [2, 5, 10, 20, 50];

//   if (loading) {
//     return <div className="text-center py-4">Loading brands...</div>;
//   }

//   if (error) {
//     return <div className="alert alert-danger">Error: {error}</div>;
//   }

//   if (brands.length === 0) {
//     return <div className="alert alert-info">No brands found.</div>;
//   }

//   return (
//     <ReactTable
//       columns={columns}
//       data={brands}
//       rowsPerPageList={pageSizeList}
//       pageSize={10}
//       tableClass="text-nowrap mb-0"
//       theadClass="bg-light bg-opacity-50"
//       showPagination
//     />
//   );
// };

// export default BrandsListTable;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getBrands, deleteBrand } from '@/http/Brand';
import EditBrandForm from './EditBrandForm'; // Import the new component

const BrandsListTable = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await getBrands();
      console.log('Fetched brands:', response.data);
      setBrands(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setShowEditForm(true);
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(brandId);
        // Refresh the brands list
        fetchBrands();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete brand');
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingBrand(null);
    // Refresh the brands list
    fetchBrands();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingBrand(null);
  };

  const columns = [
    {
      header: 'Brand Name',
      cell: ({
        row: {
          original: { id, title, short_descp },
        },
      }) => (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/brands/${id}`} className="text-reset">
                {title}
              </Link>
            </h5>
            <span className="fs-13 text-truncate d-inline-block" style={{maxWidth: '200px'}}>
              {short_descp}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Short Description',
      accessorKey: 'short_descp',
      cell: ({ getValue }) => (
        <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
          {getValue()}
        </span>
      ),
    },
    {
      header: 'Meta Description',
      accessorKey: 'meta_descp',
      cell: ({ getValue }) => (
        <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
          {getValue()}
        </span>
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
    return <div className="text-center py-4">Loading brands...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (brands.length === 0) {
    return <div className="alert alert-info">No brands found.</div>;
  }

  return (
    <>
      {showEditForm && editingBrand && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Edit Brand: {editingBrand.title}</h5>
          </div>
          <div className="card-body">
            <EditBrandForm 
              brandId={editingBrand.id} 
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
        data={brands}
        rowsPerPageList={pageSizeList}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  );
};

export default BrandsListTable;
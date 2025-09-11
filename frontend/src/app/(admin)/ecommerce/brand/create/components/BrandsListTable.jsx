import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getBrands } from '@/http/Brand';

const BrandsListTable = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchBrands();
  }, []);

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
            <span className="fs-13">{short_descp}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Short Description',
      accessorKey: 'short_descp',
    },
    {
      header: 'Meta Description',
      accessorKey: 'meta_descp',
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

  const handleEdit = (brand) => {
    // Implement edit functionality
    console.log('Edit brand:', brand);
    // You might want to open a modal or navigate to an edit page
  };

  const handleDelete = (brandId) => {
    // Implement delete functionality
    console.log('Delete brand:', brandId);
    // You might want to show a confirmation dialog first
  };

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
    <ReactTable
      columns={columns}
      data={brands}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  );
};

export default BrandsListTable;
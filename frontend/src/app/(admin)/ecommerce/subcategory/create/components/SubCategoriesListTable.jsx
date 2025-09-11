


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getCategories } from '@/http/Category';

const SubCategoriesListTable = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        console.log('Fetched categories:', response.data);
        setSubcategories(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch subcategories');
        console.error('Error fetching subcategories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  const columns = [
    {
      header: 'Subcategory Name',
      accessorKey: 'title',
    },
    {
      header: 'Meta Title',
      accessorKey: 'metaTitle',
    },
    {
      header: 'Meta Description',
      accessorKey: 'metaDescp',
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

  const handleEdit = (subcategory) => {
    // Implement edit functionality
    console.log('Edit subcategory:', subcategory);
    // You might want to open a modal or navigate to an edit page
  };

  const handleDelete = (subcategoryId) => {
    // Implement delete functionality
    console.log('Delete subcategory:', subcategoryId);
    // You might want to show a confirmation dialog first
  };

  const pageSizeList = [2, 5, 10, 20, 50];

  if (loading) {
    return <div className="text-center py-4">Loading subcategorys...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (subcategories.length === 0) {
    return <div className="alert alert-info">No Subcategorys found.</div>;
  }

  return (
    <ReactTable
      columns={columns}
      data={subcategories}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  );
};

export default SubCategoriesListTable;
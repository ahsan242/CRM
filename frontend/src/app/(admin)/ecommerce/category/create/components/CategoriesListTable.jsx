import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getCategories } from '@/http/Category';

const CategoriesListTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        console.log('Fetched categories:', response.data);
        setCategories(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const columns = [
    {
      header: 'Category Name',
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

  const handleEdit = (category) => {
    // Implement edit functionality
    console.log('Edit category:', category);
    // You might want to open a modal or navigate to an edit page
  };

  const handleDelete = (categoryId) => {
    // Implement delete functionality
    console.log('Delete category:', categoryId);
    // You might want to show a confirmation dialog first
  };

  const pageSizeList = [2, 5, 10, 20, 50];

  if (loading) {
    return <div className="text-center py-4">Loading categorys...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (categories.length === 0) {
    return <div className="alert alert-info">No Categorys found.</div>;
  }

  return (
    <ReactTable
      columns={columns}
      data={categories}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  );
};

export default CategoriesListTable;
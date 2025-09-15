import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getSubCategories } from '@/http/SubCategory';

const SubCategoriesListTable = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const response = await getSubCategories();
        console.log('Fetched Subcategories response:', response);
        
        // Check the actual structure of the response
        if (Array.isArray(response)) {
          // If the response is already the array
          setSubcategories(response);
          console.log('Fetched Subcategories:', response);
        } else if (response && Array.isArray(response.data)) {
          // If the response has a data property that contains the array
          setSubcategories(response.data);
          console.log('Fetched Subcategories:', response.data);
        } else {
          // Handle other possible response structures
          console.warn('Unexpected response structure:', response);
          setSubcategories([]);
        }
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
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Subcategory Name',
      accessorKey: 'title',
    },
    {
      header: 'Parent ID',
      accessorKey: 'parentId',
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
    console.log('Edit subcategory:', subcategory);
  };

  const handleDelete = (subcategoryId) => {
    console.log('Delete subcategory:', subcategoryId);
  };

  const pageSizeList = [2, 5, 10, 20, 50];

  if (loading) {
    return <div className="text-center py-4">Loading subcategories...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!subcategories || subcategories.length === 0) {
    return <div className="alert alert-info">No subcategories found.</div>;
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
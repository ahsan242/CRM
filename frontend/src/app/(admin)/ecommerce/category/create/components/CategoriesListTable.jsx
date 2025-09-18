

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getCategories, deleteCategory } from '@/http/Category';
import EditCategoryForm from './EditCategoryForm'; // Import the new component
import toast from 'react-hot-toast';

const CategoriesListTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowEditForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        toast.success('Category deleted successfully!');
        // Refresh the categories list
        fetchCategories();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete category');
        toast.error(err.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingCategory(null);
    // Refresh the categories list
    fetchCategories();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingCategory(null);
  };

  const columns = [
    {
      header: 'Category Name',
      accessorKey: 'title',
    },
    {
      header: 'Meta Title',
      accessorKey: 'metaTitle',
      cell: ({ getValue }) => (
        <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
          {getValue()}
        </span>
      ),
    },
    {
      header: 'Meta Description',
      accessorKey: 'metaDescp',
      cell: ({ getValue }) => (
        <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
          {getValue()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => (
        <span className={`badge bg-${getValue() === 'Online' ? 'success' : getValue() === 'Offline' ? 'danger' : 'warning'}`}>
          {getValue() || 'Online'}
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
    return <div className="text-center py-4">Loading categories...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (categories.length === 0) {
    return <div className="alert alert-info">No categories found.</div>;
  }

  return (
    <>
      {showEditForm && editingCategory && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Edit Category: {editingCategory.title}</h5>
          </div>
          <div className="card-body">
            <EditCategoryForm 
              categoryId={editingCategory.id} 
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
        data={categories}
        rowsPerPageList={pageSizeList}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  );
};

export default CategoriesListTable;
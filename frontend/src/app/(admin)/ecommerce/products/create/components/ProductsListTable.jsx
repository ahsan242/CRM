import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getProducts, deleteProduct } from '@/http/Product';
import EditProductForm from './EditProductForm'; // You'll need to create this

const ProductsListTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingProduct(null);
  };

  const columns = [
    {
      header: 'Product Name',
      cell: ({
        row: {
          original: { id, title, description },
        },
      }) => (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/products/${id}`} className="text-reset">
                {title}
              </Link>
            </h5>
            <span className="fs-13 text-truncate d-inline-block" style={{maxWidth: '200px'}}>
              {description}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ getValue }) => `$${getValue()}`,
    },
    {
      header: 'Stock',
      accessorKey: 'quantity',
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
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div className="alert alert-info">No products found.</div>;
  }

  return (
    <>
      {showEditForm && editingProduct && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Edit Product: {editingProduct.title}</h5>
          </div>
          <div className="card-body">
            <EditProductForm 
              productId={editingProduct.id} 
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
        data={products}
        rowsPerPageList={pageSizeList}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  );
};

export default ProductsListTable;
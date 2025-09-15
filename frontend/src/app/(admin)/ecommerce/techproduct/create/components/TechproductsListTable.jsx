import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactTable from '@/components/Table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllTechProducts } from '@/http/TechProduct'


const TechproductsListTable = () => {
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [techProduct, setTechProduct] = useState([])

  useEffect(() => {
    const fetchTechProduct = async () => {
      try {
        setLoading(true)
        const response = await getAllTechProducts()
        console.log('Fetched Techproducts:', response.data)
         setTechProduct(response.data)
      } catch (err) {
        setError(err.message || 'Failed to fetch Techproducts')
        console.error('Error fetching Techproduct:', err)
      } finally {
        setLoading(false)
      }
    }

     fetchTechProduct()
  }, [])

//

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'TechProduct Name',
      accessorKey: 'value',
    },
    {
      header: 'Action',
      cell: ({ row: { original } }) => (
        <>
          <button type="button" className="btn btn-sm btn-soft-secondary me-1" onClick={() => handleEdit(original)}>
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </button>
          <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDelete(original.id)}>
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </>
      ),
    },
  ]

  const handleEdit = (techProduct) => {
    console.log('Edit subcategory:', techProduct)
  }

  const handleDelete = (techProductId) => {
    console.log('Delete subcategory:', techProductId)
  }

  const pageSizeList = [2, 5, 10, 20, 50]

  if (loading) {
    return <div className="text-center py-4">Loading tech product...</div>
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>
  }

  if (!techProduct || techProduct.length === 0) {
    return <div className="alert alert-info">No Tech Product found.</div>
  }

  return (
    <ReactTable
      columns={columns}
      data={techProduct}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  )
}

export default TechproductsListTable
